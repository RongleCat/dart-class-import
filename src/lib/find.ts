import {
  workspace,
  Uri,
  ProgressLocation,
  ExtensionContext,
  window,
  CancellationToken,
  Progress,
} from 'vscode';
const fs = require('fs');

export interface ClassResultItem {
  key: string;
  path: string;
}

export const findClassWithFile = async (context: ExtensionContext) => {
  const allFiles: Array<Uri> = await workspace.findFiles('**/*.dart');
  const allFilesCount = allFiles.length;
  const allMatchClassList: Array<ClassResultItem> = await window.withProgress(
    {
      location: ProgressLocation.Window,
      title: '正在匹配所有 Class',
      cancellable: true,
    },
    (
      progress: Progress<{
        message?: string | undefined;
        increment?: number | undefined;
      }>,
      token: CancellationToken
    ) => {
      token.onCancellationRequested(() => {
        console.log('User canceled the long running operation');
      });

      progress.report({ increment: 0 });

      let allClassList: Array<ClassResultItem> = [];

      return new Promise<Array<ClassResultItem>>(async (resolve) => {
        for (let i = 0; i < allFiles.length; i++) {
          const fileItem: Uri = allFiles[i];
          const fileContent = fs.readFileSync(fileItem.fsPath).toString();
          const singleFileIncludedClass = await findClassWithSingleFile(
            fileContent
          );
          progress.report({
            increment: Math.floor(i / allFilesCount),
            message: fileItem.path,
          });
          singleFileIncludedClass.forEach((className: string) => {
            allClassList.push({ key: className, path: fileItem.fsPath });
          });
        }

        resolve(allClassList);
      });
    }
  );

  context.workspaceState.update('allMatchClassList', allMatchClassList);
};

export const findClassWithSingleFile = async (
  fileContent: string
): Promise<RegExpMatchArray> => {
  const classList = fileContent.match(/(?<=class\s|enum\s)([a-zA-Z0-9$]+)/gm);
  if (classList) {
    return classList;
  }
  return [];
};
