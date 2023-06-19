// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const { fetch, getRandomListenAddr } = require("./utils");

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
  let startHandler = async () => {
    let config = vscode.workspace.getConfiguration("go");
    /**@type {string} */
    let tagsStr = config.get("buildTags") || "";
    let tags = tagsStr.split(",");
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
    const addr = await getRandomListenAddr();
    const p = require("child_process").spawn(bin, ["-addr", addr]);
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
     * @param {vscode.TextDocumentWillSaveEvent} e
     * @returns
     */
    function onSave(e) {
      const doc = e.document;
      if (doc.languageId != "go") {
        return;
      }
      if (doc.isUntitled) {
        return;
      }
      if (doc.fileName.endsWith("_err4.go")) {
        return;
      }
      if (!doc.fileName.endsWith(".go")) {
        return;
      }
      const transpile = () => {
        let content = doc.getText();
        let link = `http://${addr}${doc.fileName}`;
        const p = fetch(link, { method: "POST", body: content }).then(
          async (res) => {
            if (res.status != 200) {
              throw new Error(await res.text());
            }
          }
        );
        p.catch((err) => {
          console.error(err);
        });
        return p;
      };
      e.waitUntil(transpile());
    }
    let handler = vscode.workspace.onWillSaveTextDocument(onSave);

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
