const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;
const DATA_FILE = path.join(__dirname, "movies.json");

function readMovies() {
  const data = fs.readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(data);
}

function sendResponse(res, statusCode, data) {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

const server = http.createServer((req, res) => {
  const { method, url } = req;

  if (method === "GET" && url === "/movies") {
    const movies = readMovies();
    sendResponse(res, 200, movies);
    return;
  }

  if (method === "GET" && url.match(/^\/movies\/\d+$/)) {
    const id = parseInt(url.split("/")[2]);
    const movies = readMovies();
    const movie = movies.find((m) => m.id === id);

    if (movie) {
      sendResponse(res, 200, movie);
    } else {
      sendResponse(res, 404, { message: "Movie not found" });
    }
    return;
  }

  sendResponse(res, 404, { message: "Route not found" });
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});