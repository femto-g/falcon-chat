const express = require("express");
const app = express();
const port = 3001;
const http = require("http");
const socket = require("socket.io");
const session = require("express-session");
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const MemoryStore = require('memorystore')(session);

const httpServer = http.createServer(app);
const io = new socket.Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true
  }
});

const corsOptions = {
	origin: "http://localhost:3000",
	credentials: true
}
app.use(cors(corsOptions));

const store = new MemoryStore({
	checkPeriod: 86400000
 });
const sessionMiddleware = session({
	 secret: 'keyboard cat', 
	 cookie: { maxAge: 1000 * 60 * 5},
	 resave: false,
	 saveUninitialized: true,
	 store: store
	 });
app.use(sessionMiddleware);

app.get("/", function (req, res) {
  res.send("Hello World!");
});


app.get("/session", (req, res) => {
	//console.log(req.session);
	// store.all((err, sessions) => {
	// 	if(err){
	// 		console.log(err);
	// 	}
	// 	else{
	// 		console.log("printing sessions in express middleware");
	// 		console.log(sessions);
	// 		console.log(` ^these are the sessions in express middleware^`);
	// 	}
	// });
	//console.log(`this is the session id from express ${req.sessionID}`);

	// req.session.dummy = 'dummy';
	// req.session.save((err) => {
	// 	if(err){
	// 		console.log(err);
	// 	}
	// });
	console.log(`From session middleware, the nickname is ${req.session.name}`);
	res.send(req.session.name);


});

io.on('connection', (socket) => {
    console.log(` ${socket.nickname} connected`);
    socket.on('disconnect', () => {
      console.log(`${socket.nickname} user disconnected`);
    });

		//Not used anymore
    socket.on('chat message', (msg) => {
      io.emit('chat message', msg);
      console.log('message: ' + msg);
    });

		socket.onAny((e, ...args) => {
			console.log(`On any catcher recieved event: ${e} from socket/user: ${socket.nickname} with arguments: ${args}`);
		});

		socket.on('private message', ({message, to}) => {
      socket.to(to).emit("private message", (message));
			console.log(`sending private message: ${message} to user with id: ${to} `);
    });

		//now uses userId so its fine
		// maybe just change this to use username and
		// have unique usernames unless there is a reason
		// to obfuscate userId
		socket.on('selecting_receiver', (name) => {
			let receiverId = "not found";
			for(let [id, socket] of io.of("/").sockets) {
				if(socket.nickname === name){
					receiverId = socket.userId;
				}
			}
			console.log(`Sending user id: ${receiverId} to user: ${socket.nickname}`)
			socket.emit("id_of_receiver", receiverId);
		})
  });

const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

io.use(wrap(sessionMiddleware));

//client will connect on startup.
//check if userId is associated with session
//if yes then emit and show message view. if no then show username form? 
//can't because only on connectiono does socket middleware


// io.use((socket, next) => {

// 	store.all((err, sessions) => {
// 		if(err){
// 			console.log(err);
// 		}
// 		else{
// 			console.log("print sessions in socket middleware");
// 			console.log(sessions);
// 			console.log(`^these are the sessions in socket middleware^`);
// 		}
	
// 	})
	
// 	next();
// });

io.use((socket, next) => {
	const req = socket.request;
	const nickname = socket.handshake.auth.name;
	let userId;
//

	if(!nickname){
		//console.log(socket.handshake.auth);
		console.log("error invalid nickname");
		return next(new Error("invalid nickname"));
	}

	//if its a new session generate new user id
	//console.log(`this is the session id before reload ${req.sessionID}`);
	//call this async function since outside of http request so put all session access or change here
	req.session.reload((err) => {
		if (err) {
			//return socket.disconnect();
			console.log(err);
		}
		if(!req.session.userId){
			req.session.userId = uuidv4();
			req.session.name = nickname;
			socket.userId = req.session.userId;
			socket.join(socket.userId);
			console.log(`User id for ${nickname} is ${socket.userId}`);
		}
		req.session.save();
		//console.log(req.session);
		//console.log(`this is the session id from socket ${req.sessionID}`);
	});

	// socket.userId = userId;

	//socket joins room with same name of user id
	//socket.join(userId);
	socket.nickname = nickname;
	console.log(`User id for ${socket.nickname} is ${socket.userId}`);
	//console.log(req.session);
	//console.log(`this is the session id from socket ${req.sessionID}`);
	next();
})


// io.use((socket, next) => {
// 	const nickname = socket.handshake.auth.name;
// 	if(!nickname){
// 		//console.log(socket.handshake.auth);
// 		return next(new Error("invalid nickname"));
// 	}
// 	//adds nickname property to session
// 	socket.request.session.nickname = nickname;
// 	next();
// })

// app.listen(3000); will not work here, as it creates a new HTTP serve
httpServer.listen(port, function () {
  console.log(`Example app listening on port ${port}!`);
});