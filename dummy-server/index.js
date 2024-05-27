// const http = require("http");
// const fs = require("fs");
// const path = require("path");

// const server = http.createServer((req, res) => {
//   const filePath = path.join(__dirname, req.url);
//   fs.readFile(filePath, (err, data) => {
//     if (err) {
//       res.writeHead(404);
//       res.end("File not found");
//     } else {
//       res.writeHead(200, { "Content-Type": "text/plain" });
//       res.end(data);
//     }
//   });
// });

// const PORT = 8000;
// server.listen(PORT, () => {
//   console.log(`Server running at http://localhost:${PORT}`);
// });

const express = require("express");
const path = require("path");

const app = express();
const port = 8000;

// Serve the proto files
app.use("/protos", express.static(path.join(__dirname, "protos")));

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
