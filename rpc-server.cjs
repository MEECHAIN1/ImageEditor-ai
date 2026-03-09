const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ chainId: 13390, status: "ok" }));
});

server.listen(8080, () => {
  console.log("Mock RPC server running on https://rpc.meechain.run.place:8080");
});
