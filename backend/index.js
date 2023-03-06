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
const db = require('./db/index.js');
const pgStore = db.createStore(session);
const authRouter = require('./routes/auth.js');
const bodyParser = require('body-parser');
const passport = require('passport');



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
app.use(bodyParser.json());

const store = new MemoryStore({
	checkPeriod: 86400000
 });
const sessionMiddleware = session({
	 secret: process.env.EXPRESS_SESSION_SECRET || 'keyboard cat', 
	 cookie: { maxAge: 1000 * 60 * 5},
	 resave: false,
	 saveUninitialized: true,
	 store: pgStore
	 });

app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());



app.get("/", function (req, res) {
  res.send("Hello World!");
});

app.use("/", authRouter);

app.get("/session", (req, res) => {
	//console.log(`From session middleware, the nickname is ${req.session.name}`);
	//res.send(req.session.name);
	
	if(!req.user){
		res.sendStatus(401);
		return;
	}
	res.sendStatus(200);
	return;
});

app.post("/search", (req, res, next) => {
	const searchQuery = req.body.searchQuery;

	db.query('SELECT username FROM users WHERE username LIKE ($1)', [searchQuery + '%'], (err, result) => {
		if(err){
			return next(err);
		}
		//console.log(result.rows);
		//console.log("parsed");
		//console.log(JSON.parse(JSON.stringify(result.rows)));
		res.json(result.rows);
	})


});

io.on('connection', (socket) => {
    console.log(` ${socket.username} connected`);
    socket.on('disconnect', () => {
      console.log(`${socket.username} user disconnected`);
    });

		//Not used anymore
    // socket.on('chat message', (msg) => {
    //   io.emit('chat message', msg);
    //   console.log('message: ' + msg);
    // });

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
		
		// socket.on('selecting_receiver', (name) => {
		// 	let receiverId = "not found";
		// 	for(let [id, socket] of io.of("/").sockets) {
		// 		if(socket.username === name){
		// 			receiverId = socket.userId;
		// 		}
		// 	}
		// 	console.log(`Sending user id: ${receiverId} to user: ${socket.nickname}`)
		// 	socket.emit("id_of_receiver", receiverId);
		// })
		
  });

const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

io.use(wrap(sessionMiddleware));
io.use(wrap(passport.initialize()));
io.use(wrap(passport.session()));

//client will connect on startup.
//check if userId is associated with session
//if yes then emit and show message view. if no then show username form? 
//can't because only on connectiono does socket middleware


io.use((socket, next) => {
	//check if user is authenticated, if not throw connection error? <--- do this instead of checking if nickname exists
	const req = socket.request;
	//const nickname = socket.handshake.auth.name;
	//let userId;
//new code
	

	// if(!nickname){
	// 	//console.log(socket.handshake.auth);
	// 	console.log("error invalid nickname");
	// 	return next(new Error("invalid nickname"));
	// }


	//if its a new session generate new user id

	//have to call session.reload() and session.save() because you are not in http request
	req.session.reload((err) => {
		
		if (err) {
			//return socket.disconnect();
			//console.log(err);
			return next(err);
		}

		if(!req.user){
			//console.log(socket.handshake.auth);
			console.log("Not authenticated");
			return next(new Error("User not authenticated"));
		}

		// if(!req.session.socket){
		// 	//might just want to use a userID in users database table because this will be lost when cookie expires idk
		// 	req.session.socket = { userId: uuidv4() };
		// 	//remove this later it might be redundant
		// 	//req.session.name = nickname;
		// }

		//socket.userId = req.session.socket.userId;
		socket.username = req.user.username;
		socket.join(socket.username);
		console.log(`User id for ${socket.username} is ${socket.username}`);

		req.session.save();
		next();
	});


	//set socket.nickname to req.session.passport.user.username
	// socket.nickname = nickname;
	// console.log(`User id for ${socket.nickname} is ${socket.userId}`);
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


//error handler
app.use((err, req, res, next) => {
	console.log(err.stack);
  res.sendStatus(401);
})

module.exports = {app, httpServer, io, db};
