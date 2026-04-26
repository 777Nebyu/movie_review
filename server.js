const http = require("http");

const PORT = 3000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ message: "Movie Review API is running" }));
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});