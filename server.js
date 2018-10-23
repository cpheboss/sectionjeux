var http = require('http');
var url = require('url');
var morgan = require('morgan');
var express = require('express');
var bodyparser = require('body-parser');
var ent = require('ent');

var app = express();

app.use(morgan('combined'));

var server = http.Server(app);
server.listen(8080, '0.0.0.0');

var nextid=1;

var tdl = []; // La todolist partagée
// Un todo = un id + un text

app.get('/', function(req,res) {
	res.redirect('/todo');
})
.get('/todo', function(req,res) {
	res.render('todo.ejs', {todolist:tdl});
})
.use(function(req,res) {
	res.setHeader('Content-Type','text/plain');
	res.status(404).send('konaipo ' + req.url);
});

var io = require('socket.io').listen(server);
io.sockets.on('connection', function(socket) {
	console.log('Connection !');
	tdl.forEach(function(item, index) {
		socket.emit('add_task', item);
	});
	socket.on('newtodo', function(tasktxt) {
		console.log('New todo : ' + tasktxt);
		
		var ntd = {id:nextid++, text:tasktxt};
		tdl.push(ntd)
		
		socket.emit('add_task', ntd);
		socket.broadcast.emit('add_task', ntd);
	});
	socket.on('delete', function(taskid) {
		console.log('Delete #' + taskid);
		
		var idx = tdl.findIndex(function(item) {return item.id == taskid;});
		if(idx >= 0)
		{
			tdl.splice(idx,1);
			socket.emit('del_task', taskid);
			socket.broadcast.emit('del_task', taskid);
		}
		else
		{
			console.log('id ' + id + ' not found, cannot delete, do nothing');
		}
	});
});
