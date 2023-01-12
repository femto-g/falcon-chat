const express = require("express");
const app = express();
const port = 3001;
const http = require("http");
const socket = require("socket.io");

const httpServer = http.createServer(app);
const io = new socket.Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true
  }
});

app.get("/", function (req, res) {
  res.send("Hello World!");
});

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
    socket.on('chat message', (msg) => {
      io.emit('chat message', msg);
      console.log('message: ' + msg);
    });
  });

// app.listen(3000); will not work here, as it creates a new HTTP serve
httpServer.listen(port, function () {
  console.log(`Example app listening on port ${port}!`);
});