const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;
const DATA_FILE = path.join(__dirname, "movies.json");

function readMovies() {
  const data = fs.readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(data);
}

function writeMovies(movies) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(movies, null, 2));
}

function sendResponse(res, statusCode, data) {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

function getRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(err);
      }
    });
  });
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

  if (method === "POST" && url === "/movies") {
    getRequestBody(req)
      .then((newMovie) => {
        const movies = readMovies();
        const id = movies.length > 0 ? movies[movies.length - 1].id + 1 : 1;
        const movie = { id, ...newMovie };
        movies.push(movie);
        writeMovies(movies);
        sendResponse(res, 201, movie);
      })
      .catch(() => {
        sendResponse(res, 400, { message: "Invalid JSON body" });
      });
    return;
  }

  if (method === "PUT" && url.match(/^\/movies\/\d+$/)) {
    const id = parseInt(url.split("/")[2]);
    getRequestBody(req)
      .then((updatedData) => {
        const movies = readMovies();
        const index = movies.findIndex((m) => m.id === id);

        if (index === -1) {
          sendResponse(res, 404, { message: "Movie not found" });
        } else {
          movies[index] = { id, ...updatedData };
          writeMovies(movies);
          sendResponse(res, 200, movies[index]);
        }
      })
      .catch(() => {
        sendResponse(res, 400, { message: "Invalid JSON body" });
      });
    return;
  }

  if (method === "DELETE" && url.match(/^\/movies\/\d+$/)) {
    const id = parseInt(url.split("/")[2]);
    const movies = readMovies();
    const index = movies.findIndex((m) => m.id === id);

    if (index === -1) {
      sendResponse(res, 404, { message: "Movie not found" });
    } else {
      const deleted = movies.splice(index, 1);
      writeMovies(movies);
      sendResponse(res, 200, { message: "Movie deleted", movie: deleted[0] });
    }
    return;
  }

  sendResponse(res, 404, { message: "Route not found" });
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});