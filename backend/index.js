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

		socket.on('private message', ({message, to}) => {
      socket.to(to).emit("private message", (message));
			console.log(`sending ${message} to ${to} `);
    });

		//this is only temporary, id is not actually a good thing to use this way because it changes on refresh, etc.
		socket.on('selecting_reciever', (name) => {
			let recieverId;
			for(let [id, socket] of io.of("/").sockets) {
				if(socket.nickname === name){
					recieverId = id;
				}
			}
			socket.emit("id_of_reciever", recieverId);
		})
  });



io.use((socket, next) => {
	const nickname = socket.handshake.auth.name;
	if(!nickname){
		//console.log(socket.handshake.auth);
		return next(new Error("invalid nickname"));
	}
	socket.nickname = nickname;
	next();
})

// app.listen(3000); will not work here, as it creates a new HTTP serve
httpServer.listen(port, function () {
  console.log(`Example app listening on port ${port}!`);
});