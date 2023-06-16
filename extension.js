// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  /**@type {vscode.Disposable} */
  let clear = null;

  let bar = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  bar.text = "err4go";
  context.subscriptions.push(bar);

  let running = false;
  let startHandler = () => {
    let config = vscode.workspace.getConfiguration("go");
    /**@type {string[]} */
    let flags = config.get("buildFlags") || [];
    let tagsStr = flags.filter((s) => s.startsWith("-tags="))[0];
    if (!tagsStr) {
      tagsStr = "-tags=";
    }
    let tags = tagsStr.slice("-tags=".length).split(",");
    if (!tags.includes("err4")) {
      // 配置已经关闭了 err4 tag, 响应配置关闭监听
      if (clear) {
        clear.dispose();
      }
      return;
    }

    if (running) {
      return;
    }

    const bin = require.resolve("./err4gen");
    const p = require("child_process").spawn(bin);
    p.on("exit", (code) => {
      if (code != 0 && !!clear) {
        clear.dispose();
      }
    });
    p.stdout.pipe(process.stdout);
    p.stderr.pipe(process.stderr);
    const exit_err4gen = {
      dispose: () => {
        p.kill();
      },
    };

    /**
     * @param {vscode.TextDocument} e
     * @returns
     */
    function onSave(e) {
      if (e.languageId != "go") {
        return;
      }
      if (e.isUntitled) {
        return;
      }
      if (e.fileName.endsWith("_err4.go")) {
        return;
      }
      if (!e.fileName.endsWith(".go")) {
        return;
      }
      p.stdin.write(e.fileName);
      p.stdin.write("\n");
    }
    let handler = vscode.workspace.onDidSaveTextDocument(onSave);

    running = true;
    bar.show();
    clear = vscode.Disposable.from(exit_err4gen, handler, {
      dispose() {
        running = false;
        bar.hide();
      },
    });
    
  };

  startHandler();
  vscode.workspace.onDidChangeConfiguration(() => {
    startHandler();
  });
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
