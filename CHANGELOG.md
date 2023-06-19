# Change Log

## [0.0.9] - 2023-06-19

#### Improve

- 添加 output channel, 方便得知哪里出现了问题

#### Fix

- 捕获转译的错误, 因为抛出转译错误超 3 次后将不再被调用. 改为输出转译错误到 output channel

## [0.0.8] - 2023-06-19

#### Change

- follow err4@v0.0.4 change

## [0.0.7] - 2023-06-19

#### Change

- 改用 `vscode.TextDocumentWillSaveEvent`, 确保文件能转译成功

## [0.0.6] - 2023-06-16

#### Fix

- follow err4@v0.0.2 fix

## [0.0.5] - 2023-06-16

#### Fix

- follow err4@v0.0.1 fix
