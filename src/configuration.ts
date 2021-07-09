import { WorkspaceConfiguration, workspace } from 'vscode';

const rootSection = 'dartClassImport';

const openSnippets = 'openSnippets';
const openQuickFix = 'openQuickFix';

function root(): WorkspaceConfiguration {
  return workspace.getConfiguration(rootSection);
}

function get<T>(section: string): T {
  return root().get(section)!;
}

export default class Configuration {
  public static get root(): WorkspaceConfiguration {
    return root();
  }

  public static get snippetsIsOpen(): boolean {
    return get(openSnippets);
  }

  public static get quickFixIsOpen(): boolean {
    return get(openQuickFix);
  }
}
