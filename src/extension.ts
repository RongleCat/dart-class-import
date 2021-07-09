import { ExtensionContext } from 'vscode';
import { findClassWithFile } from './lib/find';
import {
  onDidFileSave,
  onDocumentChange,
  onConfigurationChange,
} from './lib/watch';
import { setModuleStatus } from './lib/start';

import Snippets from './lib/snippets';
import QuickFix from './lib/quickFix';

export async function activate(context: ExtensionContext) {
  // 查找所有 Class
  await findClassWithFile(context);
  // 监听文件修改，更新 Class 缓存
  onDidFileSave(context);

  const modules = {
    snippets: new Snippets(context),
    quickFix: new QuickFix(context),
  };

  setModuleStatus(modules);
  onConfigurationChange(context, modules);
}

export function deactivate() {}
