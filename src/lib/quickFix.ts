import {
  CodeActionProvider,
  TextDocument,
  Range,
  CodeActionContext,
  CancellationToken,
  CodeAction,
  CodeActionKind,
  DiagnosticSeverity,
  Diagnostic,
  ExtensionContext,
  languages,
  window,
  commands,
  Disposable,
} from 'vscode';
const path = require('path');
import insertImport from './insert';
import { ClassResultItem } from './find';

let allMatchClassList: Array<ClassResultItem>;
let mainContext: ExtensionContext;

class ImportProvider implements CodeActionProvider {
  commandId = 'fmcat.quickFixImport';

  public async provideCodeActions(
    document: TextDocument,
    range: Range,
    context: CodeActionContext,
    token: CancellationToken
  ): Promise<CodeAction[]> {
    allMatchClassList =
      mainContext.workspaceState.get('allMatchClassList') ?? [];

    const patterns = [
      /Undefined name '(\S+)'\./,
      /The name '(\S+)' isn't/,
      /Undefined class '(\S+)'\./,
    ];

    const codeActions = await Promise.all(
      context.diagnostics
        .filter((d) => d.severity === DiagnosticSeverity.Error)
        .flatMap((diagnostic) =>
          patterns
            .map((pattern) => pattern.exec(diagnostic.message))
            .filter((match) => match)
            .flatMap((match) => {
              const name: string = match![1];
              return this.addImportForVariable(
                document,
                diagnostic,
                name,
                this.search(name)
              );
            })
        )
    );

    return codeActions.flat();

    // const codeActions: CodeAction[] = [];

    // context.diagnostics
    //   .filter((d) => d.severity === DiagnosticSeverity.Error)
    //   .flat()
    //   .forEach((diagnostic: Diagnostic) => {
    //     const match: RegExpExecArray | null = /Undefined name '(\S+)'\./.exec(
    //       diagnostic.message
    //     );
    //     if (match) {
    //       const name = match[1];
    //       codeActions.push(
    //         ...this.addImportForVariable(
    //           document,
    //           diagnostic,
    //           name,
    //           this.search(name)
    //         )
    //       );
    //     }
    //   });

    // return codeActions;
  }

  private search(name: string) {
    return allMatchClassList.filter(
      (item: ClassResultItem) => name === item.key
    );
  }

  private addImportForVariable(
    document: TextDocument,
    diagnostic: Diagnostic,
    variableName: string,
    searchResults: Array<ClassResultItem>
  ): CodeAction[] {
    const codeActions = [];
    for (const result of searchResults) {
      const currentEditFilePath = window.activeTextEditor?.document.uri.fsPath;
      let relativePath = path.relative(
        path.dirname(currentEditFilePath),
        result.path
      );
      /^[^.]/.test(relativePath) && (relativePath = './' + relativePath);

      let title = `Add: "import ${relativePath}"`;
      let codeAction = new CodeAction(title, CodeActionKind.QuickFix);

      title = `Add: "import ${relativePath} (${variableName})"`;
      codeAction = new CodeAction(title, CodeActionKind.QuickFix);
      codeAction.command = {
        title: title,
        command: this.commandId,
        arguments: [relativePath],
      };
      codeAction.diagnostics = [diagnostic];
      codeActions.push(codeAction);
    }
    return codeActions;
  }
}

export default class QuickFix {
  public moduleName: string = 'quickFixIsOpen';
  static disposeExample: Disposable;
  static commandDisposeExample: Disposable;

  constructor(context: ExtensionContext) {
    mainContext = context;
  }

  /**
   * 监听快速修复
   *
   * @memberof QuickFix
   */
  public active() {
    const provider: ImportProvider = new ImportProvider();
    QuickFix.disposeExample = languages.registerCodeActionsProvider(
      'dart',
      provider
    );

    QuickFix.commandDisposeExample = commands.registerCommand(
      provider.commandId,
      insertImport
    );

    mainContext.subscriptions.push(QuickFix.disposeExample);
    mainContext.subscriptions.push(QuickFix.commandDisposeExample);
  }

  /**
   * 注销监听
   *
   * @memberof QuickFix
   */
  public dispose() {
    QuickFix.disposeExample && QuickFix.disposeExample.dispose();
    QuickFix.disposeExample = null!;

    QuickFix.commandDisposeExample && QuickFix.commandDisposeExample.dispose();
    QuickFix.commandDisposeExample = null!;
  }
}
