import * as vscode from 'vscode';
const fs = require('fs');

const { window } = vscode;

export interface ClassResultItem {
  key: string;
  path: string;
}

export const findClassWithFile = async (allFiles: Array<vscode.Uri>) => {
  const allFilesCount = allFiles.length;
  return window.withProgress(
    {
      location: vscode.ProgressLocation.Window,
      title: '正在匹配所有 Class',
      cancellable: true,
    },
    (progress, token) => {
      token.onCancellationRequested(() => {
        console.log('User canceled the long running operation');
      });

      progress.report({ increment: 0 });

      let allClassList: Array<ClassResultItem> = [];

      const p = new Promise<Array<ClassResultItem>>(async (resolve) => {
        for (let i = 0; i < allFiles.length; i++) {
          const fileItem: vscode.Uri = allFiles[i];
          const singleFileIncludedClass = await findClassWithSingleFile(
            fileItem.fsPath
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

      return p;
    }
  );
};

async function findClassWithSingleFile(filePath: string) {
  const fileContent = fs.readFileSync(filePath).toString();
  const classList = fileContent.match(/(?<=class\s|enum\s)([a-zA-Z0-9$]+)/gm);
  if (classList) {
    return classList;
  }
  return [];
}
