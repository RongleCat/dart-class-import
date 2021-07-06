import { ExtensionContext, CompletionItem, workspace } from 'vscode';
import { findClassWithFile } from './lib/find';
import snippets from './lib/snippets';
import insertImport from './lib/insert';
import quickFix from './lib/quickFix';
import watchFileSave from './lib/watch';

export async function activate(context: ExtensionContext) {
  // 查找所有 Class
  await findClassWithFile(context);
  // 监听文件修改，更新 Class 缓存
  watchFileSave(context);

  context.subscriptions.push(
    // 注册代码提示
    await snippets(context),
    // 注册快速修复
    await quickFix(context),
    // 监听修改文档修改，修改值与当前选中值一致则执行插入
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
}

export function deactivate() {}
