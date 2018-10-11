var http = require('http');
var url = require('url');
var morgan = require('morgan');
var express = require('express');
var bodyparser = require('body-parser');

var app = express();
app.use(morgan('combined'));

var server = http.createServer(app);

var urlencodedParser = bodyparser.urlencoded({extended : false});

var nextid=0;

var tdl = []; // La todolist partagée
// Un todo = un id + un texte

app.get('/', function(req,res) {
	res.redirect('/todo');
})
.get('/todo', function(req,res) {
	res.render('todo.ejs', {todolist:tdl});
})
.get('/todo/delete/:id', function(req,res) {
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
})
.post('/todo/add', urlencodedParser, function(req,res) {
	if(req.body.newtodo != '')
	{
		var ntd = {id:nextid++, text:req.body.newtodo};

		var idx = tdl.push(ntd)

		console.log('pushed' + idx + '/' + req.body.newtodo);

		console.log(tdl);
	}
	res.redirect('/todo');
})
.use(function(req,res) {
	res.setHeader('Content-Type','text/plain');
	res.status(404).send('konaipo ' + req.url);
})



// Chargement de socket.io
var io = require('socket.io').listen(server);
io.sockets.on('connection', function(socket) {
	console.log('Connection !');
});

app.listen(8080, '0.0.0.0');

