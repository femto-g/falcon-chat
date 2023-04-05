const express = require("express");
const app = express();
const http = require("http");
const socket = require("socket.io");
const session = require("express-session");
const cors = require('cors');
const httpServer = http.createServer(app);
const db = require('./db/index.js');
const pgStore = db.createStore(session);
const authRouter = require('./routes/auth.js');
const messageRouter = require('./routes/messages.js');
const bodyParser = require('body-parser');
const passport = require('passport');


const corsOptions = {
	origin: process.env.CLIENT_URL,
	credentials: true
}

const io = new socket.Server(httpServer, {
  cors: corsOptions
});

app.use(cors(corsOptions));
app.use(bodyParser.json());

const sessionMiddleware = session({
	 secret: process.env.EXPRESS_SESSION_SECRET || 'keyboard cat', 
	 cookie: { maxAge: 1000 * 60 * 30},
	 resave: false,
	 saveUninitialized: true,
	 store: pgStore
	 });

app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());


app.use("/", authRouter);
app.use("/", messageRouter);


io.on('connection', (socket) => {
    console.log(` ${socket.username} connected`);
    socket.on('disconnect', () => {
      console.log(`${socket.username} user disconnected`);
    });

		socket.onAny((e, ...args) => {
			console.log(`On any catcher recieved event: ${e} from socket/user: ${socket.nickname} with arguments: ${args}`);
		});

		socket.on('private message', ({message, receiver, sender, timestamp}) => {

			db.query('INSERT into messages(sender, receiver, content, timestamp, read) values($1, $2, $3, $4, false)',
				[sender, receiver, message, timestamp],
				(err) => {
					if(err){
						console.error(err);
						//send some err to client that message wasn't sent
					}
					else{
						socket.to(receiver).emit("private message", {message, sender, timestamp});
						console.log(`sending private message: ${message} to user with id: ${receiver} `);
					}
				}
			)

    });
		
  });

//wrapper function to use express middleware with socket.io
const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

io.use(wrap(sessionMiddleware));
io.use(wrap(passport.initialize()));
io.use(wrap(passport.session()));

io.use((socket, next) => {

	const req = socket.request;

	if(!req.user){
			//only allow connection if user is authenticated
			console.log("Not authenticated");
			return next(new Error("User not authenticated"));
	}

	//have to call session.reload() and session.save() because you are not in http request (won't be called automatically)
	req.session.reload((err) => {
		if (err) {
			return next(err);
		}
		socket.username = req.user.username;
		socket.join(socket.username);
		console.log(`User id for ${socket.username} is ${socket.username}`);

		req.session.save();
		next();
	});

})


//error handler
app.use((err, req, res, next) => {
	console.log(err.stack);
  return res.sendStatus(500);
})

module.exports = {app, httpServer, io, db};
