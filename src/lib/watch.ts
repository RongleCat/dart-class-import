import { workspace, CompletionItem, ExtensionContext } from 'vscode';
import { findClassWithSingleFile, ClassResultItem } from './find';
import { setModuleStatus } from './start';
import insertImport from './insert';

export const onDidFileSave = (context: ExtensionContext) => {
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

/**
 * 监听文档变化事件
 *
 * @param {ExtensionContext} context
 */
export const onDocumentChange = (context: ExtensionContext) => {
  context.subscriptions.push(
    workspace.onDidChangeTextDocument((e) => {
      const currentChoiceItem: CompletionItem | undefined =
        context.workspaceState.get('currentChoiceItem');

      if (e.contentChanges[0].text === currentChoiceItem?.label ?? '') {
        if (!currentChoiceItem?.detail) {
          return;
        }
        insertImport(currentChoiceItem.detail);
      }
    })
  );
};

/**
 * 监听设置变化事件
 *
 * @param {ExtensionContext} context
 */
export const onConfigurationChange = (
  context: ExtensionContext,
  modules: any
) => {
  context.subscriptions.push(
    workspace.onDidChangeConfiguration(() => setModuleStatus(modules))
  );
};
