var express = require('express'),
    app = express(),
    path = require('path'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    config = require('./config/config.js'),
    ConnectMongo = require('connect-mongo')(session),
    mongoose = require('mongoose'),
    passport = require('passport'),
    FacebookStrategy = require('passport-facebook').Strategy,
    rooms = [];

app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('hogan-express'));
app.set('view engine', 'html');

mongoose.connect(config.dbURL,{ useNewUrlParser: true }, function(err) {
  if(err != undefined){
    console.log("MONGOOSE-CONNECT: " + err);
  } else {
    console.log("MONGOOSE-CONNECT: Database connection established");
  }
});

app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser());



// Initialze passport
app.use(passport.initialize());
app.use(passport.session());
require('./auth/passportAuth.js')(passport, FacebookStrategy, config, mongoose);

// Setup the routes
require('./routes/routes.js')(express, app, passport, config, rooms);

// app.listen(3000, confirmListen);
//
// function confirmListen(req, res, next){
//   console.log("ChatCAT running on port 3000");
//
// }

// Create own http server for communication protocol
app.set('port', process.env.PORT || 3000);
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
require('./socket/socket.js')(io, rooms);
server.listen(app.get('port'), function(){
  console.log('ChatCAT on: ' + config.host);
  console.log("Mode " + env );
});

var env = process.env.NODE_ENV || "development";
	if(env ==="development"){
		app.use(session({
		  secret: config.sessionSecret,
		  resave: false,
		  saveUninitialized: true,
		  cookie: { secure: true }
}))
	//app.use(session({secret:config.sessionSecret}, saveUnintialized:true, resave:true , cookie: { secure: true }));
}
	else{
				app.use(session({
	  		secret: config.sessionSecret,
	  		resave: false,
	  		saveUninitialized: true,
	  		cookie: { secure: true },
			store: new ConnectMongo({
	        		url:config.dbURL,
	        		mongoose_connection:mongoose.connections[0],
	        		stringify:true
	      })
	}))

}



