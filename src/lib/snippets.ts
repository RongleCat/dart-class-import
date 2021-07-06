import {
  TextDocument,
  Position,
  CancellationToken,
  CompletionContext,
  CompletionItem,
  ExtensionContext,
  CompletionItemKind,
  CompletionItemProvider,
  window,
  languages,
} from 'vscode';
const path = require('path');
import { ClassResultItem } from './find';

let mainContext: ExtensionContext;

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

class ImportClassSnippetsProvider implements CompletionItemProvider {
  public provideCompletionItems(
    document: TextDocument,
    position: Position,
    token: CancellationToken,
    context: CompletionContext
  ): CompletionItem[] {
    const line = document.lineAt(position);

    const lineText = line.text.substring(0, position.character);
    if (/(?<=^|\=\s|\s|:\s|\=|\:)[a-zA-Z0-9]+$/g.test(lineText)) {
      const allMatchClassList: Array<ClassResultItem> =
        mainContext.workspaceState.get('allMatchClassList') ?? [];
      const currentEditFilePath = window.activeTextEditor?.document.uri.fsPath;
      const matchText = lineText.match(/(?<=^|\=\s|\s|:\s|\=|\:)[a-zA-Z0-9]+$/);
      const reg = new RegExp(`${matchText}`, 'i');
      return allMatchClassList
        .filter((item: ClassResultItem) => {
          const className: string = item.key;
          return reg.test(className);
        })
        .map((classItem: ClassResultItem) => {
          const item: CompletionItem = new CompletionItem(
            classItem.key,
            CompletionItemKind.Class
          );
          let relativePath = path.relative(
            path.dirname(currentEditFilePath),
            classItem.path
          );
          /^[^.]/.test(relativePath) && (relativePath = './' + relativePath);
          item.detail = relativePath;
          item.preselect = true;

          return item;
        });
    }
    return [];
  }

  public resolveCompletionItem(item: CompletionItem) {
    mainContext.workspaceState.update('currentChoiceItem', item);
    return item;
  }
}

export default async (context: ExtensionContext) => {
  mainContext = context;

  return languages.registerCompletionItemProvider(
    'dart',
    new ImportClassSnippetsProvider(),
    ...triggerCharacters
  );
};
