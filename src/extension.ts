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

  // 所有模块
  const modules = {
    snippets: new Snippets(context),
    quickFix: new QuickFix(context),
  };

  // 根据插件设置激活模块
  setModuleStatus(modules);
  // 监听设置修改激活或者关闭模块
  onConfigurationChange(context, modules);
  // 监听文档修改
  onDocumentChange(context);
  // 监听文件修改，更新 Class 缓存
  onDidFileSave(context);
}

export function deactivate() {}
