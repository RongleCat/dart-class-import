// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
const util = require('./util');
const fs = require('fs');
const path = require('path');
import { findClassWithFile, ClassResultItem } from './lib/find';

let current: vscode.CompletionItem;

let allMatchClassList: Array<ClassResultItem>;

function resolveCompletionItem(item: vscode.CompletionItem) {
  current = item;
  return item;
}

function provideCompletionItems(document, position): vscode.CompletionItem[] {
  const line = document.lineAt(position);

  // 只截取到光标位置为止，防止一些特殊情况
  const lineText = line.text.substring(0, position.character);
  // 简单匹配，只要当前光标前的字符串为`this.dependencies.`都自动带出所有的依赖
  if (/(^|=| )[a-zA-Z0-9]+$/g.test(lineText)) {
    const reg = new RegExp(`${lineText}`, 'i');
    return allMatchClassList
      .filter((item: ClassResultItem) => {
        const className: string = item.key;
        return reg.test(className);
      })
      .map((classItem: ClassResultItem) => {
        const item: vscode.CompletionItem = new vscode.CompletionItem(
          classItem.key,
          vscode.CompletionItemKind.Class
        );
        item.detail = classItem.path;

        return item;
      });
  }
  return [];
}

export async function activate(context: vscode.ExtensionContext) {
  const allFile: Array<vscode.Uri> = await vscode.workspace.findFiles(
    '**/*.dart'
  );

  allMatchClassList = await findClassWithFile(allFile);

  const triggerCharacters = [
    '.',
    '/',
    '@',
    '<',
    '=',
    '_',
    '$',
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k',
    'l',
    'm',
    'n',
    'o',
    'p',
    'q',
    'r',
    's',
    't',
    'u',
    'v',
    'w',
    'x',
    'y',
    'z',
  ];
  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      'dart',
      {
        provideCompletionItems,
        resolveCompletionItem,
      },
      ...triggerCharacters
    ),
    vscode.workspace.onDidChangeTextDocument((e) => {
      if (e.contentChanges[0].text === current?.label ?? '') {
        console.log(current);
        console.log(e.document.uri);

        console.log(path.relative(e.document.uri.fsPath, current.detail));
      }
    })
  );
}

// this method is called when your extension is deactivated
export function deactivate() {}
