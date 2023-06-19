const fetch = require("node-fetch");

exports.fetch = fetch;

const http = require("http");
/**
 *
 * @returns {Promise<string>}
 */
exports.getRandomListenAddr = function getRandomListenAddr() {
  return new Promise((rl, rj) => {
    const server = http.createServer();
    let l = "";
    server.once("listening", () => {
      let addr = server.address();
      if (typeof addr === "string") {
        l = addr;
      } else {
        l = `127.0.0.1:${addr.port}`;
      }
      server.close();
    });
    server.once("error", (err) => {
      rj(err);
    });
    server.once("close", () => {
      rl(l);
    });
    server.listen(0, "127.0.0.1");
  });
};
