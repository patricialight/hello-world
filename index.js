var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Gearman = require("node-gearman");
var gearman = new Gearman();
//var job = gearman.submitJob("reverse", "test string");

app.get('/', function(req, res) {
   res.sendfile('PatChat.html');
});
var clients = {};
io.sockets.on('connection', function (socket) {
  console.log(" A user has joined : " + socket.id);
  
  socket.on('add-user', function(data){
	console.log("add-user" + data);
	if (clients[data]){
		 socket.emit('userExists', data + ' username is taken! Try some other username.');		
	} else {
		clients[data] = {
      "socket": socket.id
    };
	socket.emit('userSet', {user: data, soc : socket.id});
	console.log("user details" + clients[data]);
	}
    
  });

  socket.on('private-message', function(data){
    console.log("Sending: " + data.message + " to " + data.receiver + " from " + data.user);
    if (clients[data.receiver]){
		console.log("connect to " + clients[data.receiver].socket);
		// socket.to(clients[data.receiver].socket).emit("newmsg", data);
		 console.log(data.message + data.user);
		 //Gearman connection
		
		//Gearman Call sent with the payload from NodeJS to a python Worker. 
		var job = gearman.submitJob("letsdosomething", data);
		job.on("data", function(jobdata){
        console.log(jobdata); // gnirts tset
        console.log(clients[data.receiver].socket);
        socket.to(clients[data.receiver].socket).emit("newmsg", { message : jobdata.toString("utf-8")});
		});
		job.on("end", function(){
        console.log("Job completed!");
		});
		job.on("error", function(error){
        console.log(error.message);
		});
	    
 
    } else {
      console.log("User does not exist: " + data.user); 
    }
  });

  //Removing the socket on disconnect
  socket.on('disconnect', function() {
  	for(var name in clients) {
  		if(clients[name].socket === socket.id) {
  			delete clients[name];
  			break;
  		}
  	}	
  });

});



http.listen(3000, function() {
   console.log('listening on localhost:3000');
});