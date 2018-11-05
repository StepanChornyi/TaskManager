const express = require('express');
const config = require('./config');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const database = require('./database.js');
const session = require('express-session');
const MongoStore  = require('connect-mongo')(session);
const models = require('./models');
var router = express.Router();

const app = express();

app.use(
  session({
    secret: config.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
    store: new MongoStore({
      mongooseConnection: mongoose.connection
    })
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
		if(req.session.userId){
			res.redirect('/tasks');
		}else{
			res.render('index');
		}
});
app.get('/tasks', async (req, res) => {
	if(!req.session.userId){
		res.redirect('/');
	}else{
		res.render('tasks', {userEmail: req.session.email});
	}
});

app.post('/signin', (req, res) => {
	const { email, password } = req.body;
	models.User.findOne({
		email: email,
		password: password
	}).then(user => {
		req.session.userId = user._id;
	  	req.session.email = user.email;
	   res.redirect('/tasks');
    }).catch(err => {
	  res.redirect('/');
    });
});
app.post('/signup', (req, res) => {
	const { email, password } = req.body;
    models.User.create({
      email: email,
      password: password
  	}).then(user => {
		req.session.userId = user._id;
	  	req.session.email = email;
	  console.log(email);
	  res.redirect('/tasks');
  	}).catch(() => {
		res.redirect('/');
    });
});
app.post('/signout', (req, res) => {
	req.session.destroy(function(err) {
	  res.redirect('/');
  	});
});

///////////////////////////////////////////////index Page
app.post("/api/signin/email", async function(req,res){
	let emails = await database.emails();
	let emailValid = false;
	for(let i = 0; i < emails.length; i++){
		if(req.body.email == emails[i].email){
			emailValid = true;
			break;
		}
	}
	return res.send({valid: emailValid});
});
app.post("/api/signin/password", async function(req,res){
	const { email, password } = req.body;
	let tasks = await database.findUser(email, password);
	return res.send({valid: tasks});
});
app.post("/api/signup/email", async function(req,res){
	let emails = await database.emails();
	let emailValid = true;
	for(let i = 0; i < emails.length; i++){
		if(req.body.email == emails[i].email){
			emailValid = false;
			break;
		}
	}
	return res.send({valid: emailValid});
});
//\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\index Page

///////////////////////////////////////////////tasks Page
app.post("/tasks/api/tasks/me", async function(req,res){
	return res.send({_id: req.session.userId, email: req.session.email});
});
app.post("/tasks/api/tasks/load", async function(req,res){
	let tasks = await database.load(req.session.userId);
	return res.send(tasks);
});
app.post("/tasks/api/tasks/emails", async function(req,res){
	let emails = await database.emails();
	return res.send(emails);
});
app.post("/tasks/api/tasks/add", async function(req,res){
	let task = await database.add(req.session.userId, req.body.description);
	return res.send(task);
});
app.post("/tasks/api/tasks/delete", async function(req,res){
	let result = await database.del(req.body.taskId);
	if(result == true){
		return res.send({success: result});
	}else{
		return res.send({success: result+' (this task already deleted)'});
	}
});
app.post("/tasks/api/tasks/update", async function(req,res){
	let result = await database.update(req.body.taskId, req.body.description);
	return res.send({success: true});
});
app.post("/tasks/api/tasks/share", async function(req,res){
	let result = await database.share(req.body.taskId, req.body.userId);
	return res.send({success: result});
});
//\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\tasks Page

module.exports = app;
