const express = require('express');
const config = require('./config');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const database = require('./database.js');
const session = require('express-session');
const MongoStore  = require('connect-mongo')(session);
const models = require('./models');

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
		let tasks = await database.findTasksByUserId(req.session.userId);
		let emails = await database.getAllUsersEmailsExcludingOne(req.session.email);
		tasks.reverse();
		for(let i = 0; i < tasks.length; i++){
			tasks[i].creator = "You";
			if(tasks[i].creatorId != req.session.userId){
				let email = await database.getUserEmailById(tasks[i].creatorId);
				tasks[i].creator = email.email;
			}
		}
		res.render('tasks', {tasks: tasks, emails: emails, userEmail: req.session.email});
	}
});

app.post('/add', (req, res) => {
	let { description } = req.body;
	let userId = req.session.userId;
	database.createNewTask(userId, description);
	res.redirect('/tasks');
});
app.post('/remove', async (req, res) => {
	await database.removeTaskFromUser(req.session.userId, req.body.taskId);
	res.redirect('/tasks');
});
app.post('/share', async (req, res) => {
	await database.shareTaskToUser(req.body.userEmail, req.body.taskId);
	res.redirect('/tasks');
});
app.post('/edit', async (req, res) => {
	let { taskId, description } = req.body;
	await database.updateTask(taskId, description);
	res.redirect('/tasks');
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
    	console.error('User ' + email + ' creating error');
		res.redirect('/');
    });
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
      console.error('Wrong data for signin [email: ' + email + ", password: " + password + "]");
	  res.redirect('/');
    });
});
app.post('/signout', (req, res) => {
	req.session.destroy(function(err) {
	  res.redirect('/');
  	});
});

module.exports = app;
