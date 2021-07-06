import { workspace, ExtensionContext } from 'vscode';
import { findClassWithSingleFile, ClassResultItem } from './find';

export default (context: ExtensionContext) => {
  workspace.onWillSaveTextDocument(async (e) => {
    const allMatchClassList: ClassResultItem[] =
      context.workspaceState.get('allMatchClassList') ?? [];

    const { fsPath }: { fsPath: string } = e.document.uri;
    const classList: RegExpMatchArray = await findClassWithSingleFile(
      e.document.getText()
    );

    const newClassResultList: ClassResultItem[] = classList.map(
      (className: string) => {
        return { key: className, path: fsPath };
      }
    );

    const removedTargetFileList = allMatchClassList.filter(
      (item: ClassResultItem) => item.path !== fsPath
    );

    context.workspaceState.update('allMatchClassList', [
      ...newClassResultList,
      ...removedTargetFileList,
    ]);
  });
};
