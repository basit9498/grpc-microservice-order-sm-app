const http = require("http");
const fs = require("fs");
const path = require("path");

const server = http.createServer((req, res) => {
  // Set the Content-Type header based on the file extension
  const ext = path.extname(req.url);
  const contentType =
    {
      ".proto": "text/plain",
    }[ext] || "application/octet-stream";

  // Read the file from the local directory
  const filePath = path.join(__dirname, req.url);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("File not found");
    } else {
      res.writeHead(200, { "Content-Type": contentType });
      res.end(data);
    }
  });
});

const PORT = 8000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
