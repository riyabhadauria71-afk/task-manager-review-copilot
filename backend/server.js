// backend/server.js
//
// Zero-dependency Node.js backend for the Review Copilot demo app.
// Serves:
//   - static frontend files (frontend/)
//   - a small REST API wrapping src/tasks.js
//   - a read-only endpoint exposing the real Review Copilot findings
//     captured from an actual IBM Bob 2.0 session (data/review-findings.json)
//
// Run with: node backend/server.js   (from the project root)

const http = require("http");
const fs = require("fs");
const path = require("path");
const { addTask, completeTask, listTasks } = require("../src/tasks");

const PORT = process.env.PORT || 3000;
const ROOT = path.join(__dirname, "..");
const FRONTEND_DIR = path.join(ROOT, "frontend");
const REVIEW_FINDINGS_PATH = path.join(ROOT, "data", "review-findings.json");

const MIME_TYPES = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
};

function sendJson(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(body),
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1e6) req.destroy(); // basic guard against huge bodies
    });
    req.on("end", () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

function serveStatic(req, res) {
  let reqPath = req.url === "/" ? "/index.html" : req.url;
  reqPath = reqPath.split("?")[0];
  const filePath = path.join(FRONTEND_DIR, reqPath);

  // Prevent path traversal outside the frontend directory.
  if (!filePath.startsWith(FRONTEND_DIR)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      return res.end("Not found");
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { "Content-Type": MIME_TYPES[ext] || "text/plain" });
    res.end(content);
  });
}

const server = http.createServer(async (req, res) => {
  const url = req.url.split("?")[0];
  const query = Object.fromEntries(new URL(req.url, `http://x`).searchParams);

  try {
    // --- API routes ---
    if (url === "/api/tasks" && req.method === "GET") {
      const includeDone = query.includeDone !== "false";
      const priority = query.priority || undefined;
      return sendJson(res, 200, listTasks({ includeDone, priority }));
    }

    if (url === "/api/tasks" && req.method === "POST") {
      const body = await readBody(req);
      const task = addTask(body.title, body.priority || "normal");
      return sendJson(res, 201, task);
    }

    const completeMatch = url.match(/^\/api\/tasks\/(\d+)\/complete$/);
    if (completeMatch && req.method === "POST") {
      const task = completeTask(Number(completeMatch[1]));
      return sendJson(res, 200, task);
    }

    if (url === "/api/review" && req.method === "GET") {
      const raw = fs.readFileSync(REVIEW_FINDINGS_PATH, "utf-8");
      return sendJson(res, 200, JSON.parse(raw));
    }

    // --- static frontend ---
    if (req.method === "GET") {
      return serveStatic(req, res);
    }

    sendJson(res, 404, { error: "Not found" });
  } catch (err) {
    sendJson(res, 400, { error: err.message });
  }
});

server.listen(PORT, () => {
  console.log(`Review Copilot demo app running at http://localhost:${PORT}`);
});
