const http = require("http");
const fs = require("fs/promises");
const path = require("path");

const root = __dirname;
const dataPath = path.join(root, "data.json");
const port = Number(process.env.PORT || 4173);

const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".ics": "text/calendar; charset=utf-8"
};

async function readData() {
  try {
    const data = JSON.parse(await fs.readFile(dataPath, "utf8"));
    if (!data.months) data.months = {};
    return data;
  } catch {
    return { months: {} };
  }
}

async function writeData(data) {
  if (!data || typeof data !== "object") throw new Error("Invalid data");
  if (!data.months) data.months = {};
  await fs.writeFile(dataPath, JSON.stringify(data, null, 2), "utf8");
}

function json(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(data));
}

async function body(req) {
  let text = "";
  for await (const chunk of req) {
    text += chunk;
    if (text.length > 1024 * 1024) throw new Error("Request too large");
  }
  return text;
}

http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname === "/api/data" && req.method === "GET") return json(res, 200, await readData());
    if (url.pathname === "/api/data" && req.method === "POST") {
      await writeData(JSON.parse(await body(req)));
      return json(res, 200, { ok: true });
    }
    if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });

    const requested = url.pathname === "/" ? "/index.html" : url.pathname;
    const filePath = path.normalize(path.join(root, requested));
    if (!filePath.startsWith(root)) return json(res, 403, { error: "Forbidden" });
    const content = await fs.readFile(filePath);
    res.writeHead(200, { "Content-Type": mime[path.extname(filePath)] || "application/octet-stream", "Cache-Control": "no-store" });
    res.end(content);
  } catch (error) {
    json(res, error.code === "ENOENT" ? 404 : 500, { error: error.code === "ENOENT" ? "Not found" : "Server error" });
  }
}).listen(port, "0.0.0.0", () => {
  console.log(`On-call scheduler: http://127.0.0.1:${port}/index.html`);
});
