import { window, TextEditor, Position, TextEditorEdit } from 'vscode';

export default (filePath: string) => {
  const activeTextEditor: TextEditor | undefined = window.activeTextEditor;

  let currentFileContent: string = activeTextEditor?.document.getText() ?? '';
  const allMatchImport: RegExpMatchArray =
    currentFileContent.match(/(?<=import\s')(.+)(?=')/gm) ?? [];

  // 如果页面已经有引入该文件则不再引入
  if (allMatchImport.includes(filePath)) {
    return;
  }

  allMatchImport.push(filePath);

  const sortedIndex: number = allMatchImport
    .sort((a: string, b: string) => a.localeCompare(b))
    .findIndex((importItem: string) => importItem === filePath);

  let insertLineIndex = 0;

  if (sortedIndex !== 0) {
    const beforeImport = allMatchImport[sortedIndex - 1];
    const lines: Array<string> = currentFileContent.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const lineText = lines[i];
      lineText.match(/(?<=import\s')(.+)(?=')/);
      if (RegExp.$1 === beforeImport) {
        insertLineIndex = i + 1;
        break;
      }
    }
  }

  activeTextEditor?.edit((editBuilder: TextEditorEdit) => {
    editBuilder.insert(
      new Position(insertLineIndex, 0),
      `import '${filePath}';\n`
    );
  });
};
