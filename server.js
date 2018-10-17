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

var urlencodedParser = bodyparser.urlencoded({extended : false});

var nextid=3;

var tdl = [{id:1,text:'Bisou'},{id:2,text:'ma'}]; // La todolist partagée
// Un todo = un id + un text

app.get('/', function(req,res) {
	res.redirect('/todo');
})
.get('/todo', function(req,res) {
	res.render('todo.ejs', {todolist:tdl});
})
/*.get('/todo/delete/:id', function(req,res) {
	var id=req.params.id;
	console.log('Try to delete id ' + id);
	if(id != '')
	{
		var idx = tdl.findIndex(function(item) {return item.id == id;});
		if(idx >= 0)
		{
			console.log('Deleting ' +tdl[idx].id + '/' + tdl[idx].text);
			tdl.splice(idx,1);
		}
		else
		{
			console.log('id ' + id + ' not found');
		}
	}
	res.redirect('/todo');
})*/
.use(function(req,res) {
	res.setHeader('Content-Type','text/plain');
	res.status(404).send('konaipo ' + req.url);
})

var io = require('socket.io').listen(server);
io.sockets.on('connection', function(socket) {
	console.log('Connection !');
	tdl.forEach(function(item, index) {
		socket.emit('add_task', item);
	});
	socket.on('newtodo', function(task) {
		console.log('new todo : ' + task.id +'/' + task.text);
		
		var ntd = {id:nextid++, text:task.text};
		tdl.push(ntd)
		
		socket.emit('add_task', ntd);
		socket.broadcast.emit('add_task', ntd);
	});
	socket.on('delete', function(taskid) {
		console.log('delete #' + taskid);
		
	});
});
