const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const port = Number(process.env.PORT || 4180);
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
};

const server = http.createServer((request, response) => {
  const url = decodeURIComponent(request.url.split("?")[0]);
  const target = path.resolve(root, url === "/" ? "index.html" : url.slice(1));

  if (!target.startsWith(root)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.readFile(target, (error, data) => {
    if (error) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    response.writeHead(200, {
      "Content-Type": types[path.extname(target)] || "text/plain; charset=utf-8",
    });
    response.end(data);
  });
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Agenda Facil running at http://127.0.0.1:${port}`);
});
