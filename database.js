const config = require('./config');
const mongoose = require('mongoose');
const {User, Task} = require('./models');

exports.mongo = () => {
	return new Promise((resolve, reject) => {
    mongoose.Promise = global.Promise;
    mongoose.set('debug', true);

    mongoose.connection
      .on('error', error => reject(error))
      .on('close', () => console.log('Database connection closed.'))
      .once('open', () => resolve(mongoose.connections[0]));

    mongoose.connect(config.MONGO_URL, {useNewUrlParser: true});
  });
}

exports.createNewTask = function (userId, description){
	let task = new Task({
		   description: description,
		   creatorId: userId,
		   users: [userId]
	});
	let taskId = task._id;
   	task.save(function (err) {
        if (err) {
            return err;
        }
        console.log("task created");
   });
	addTaskToUser(userId, taskId);
	return taskId;
}

exports.findTasksByUserId = async function(userId){
	let user = await getUserPromiseById(userId);
	let tasks = [];
	for(let i = 0; i < user.tasks.length; i++){
		task = await getTaskPromiseById(user.tasks[i]);
		if(task){
			tasks.push(task);
		}
	}
	return tasks;
}

exports.removeTaskFromUser = async function(userId, taskId){
	task = await getTaskPromiseById(taskId);
	if(task == null){return null;}
	console.log(task.users);
	for(let i = 0; i < task.users.length; i++){
		let user = await getUserPromiseById(task.users[i]);
		user.tasks = removeElementFromArray(user.tasks, taskId);
		user.save(function (err) {
			 if (err) {
				 return err;
			 }
			 console.log("task deleted from user");
		});
	}
	await Task.findByIdAndRemove(taskId, (err) => {
		if (err) return err;
	});
}

exports.shareTaskToUser = async function(userEmail, taskId){
	task = await getTaskPromiseById(taskId);

	await User.findOne({email: userEmail}, function (err, user) {
        if (err) return console.log(err);
		if(!isElementInArray(task.users, user._id)){
			user.tasks.push(taskId)
			user.save(function (err) {
				 if (err) {
					 return err;
				 }
				 console.log("task added into user");
			});
			task.users.push(user._id);
		}
    });


	await Task.findByIdAndUpdate(taskId, task, {new: false}, (err, task) => {
			if (err) return err;
	});
}

exports.getUserEmailById = async function(userId){
	return await User.findOne({_id: userId}, {_id: false, email: true}, function (err, email) {
			if (err) return err;
			return email;
	});
}

exports.updateTask = async function(taskId, description){
	await Task.findByIdAndUpdate(taskId, {description: description}, {new: true}, (err, todo) => {
	        if (err) return err;
	});
}

exports.getAllUsersEmailsExcludingOne = async function(thisEmail){
	let emails = [];
	let users = await User.find({}, {_id: false, email: true}, function (err, users) {
			if (err) return err;
	});
	users.forEach(function(item, i, arr) {
	  emails.push(item.email);
	});
	return removeElementFromArray(emails, thisEmail);;
}

function addTaskToUser(userId, taskId){
	User.findById(userId, function (err, user) {
        if (err) return err;
		user.tasks.push(taskId);
		user.save(function (err) {
			 if (err) {
				 return err;
			 }
			 console.log("task added into user");
		});
    });
}

function getTaskPromiseById(taskId){
	return Task.findById(taskId, function (err, task) {
		if (err) return null;
		return task;
	});
}

function getUserPromiseById(userId){
	return User.findById(userId, function (err, user) {
			if (err) return err;
			return user;
	});
}

function createNewUser(email, password){
	let user = new User({
		email: email,
		password: password
	});
	let userId = user._id;
	user.save(function (err) {
        if (err) {
            return err;
        }
        console.log("user created");
   	});
	return userId;
}

function removeElementFromArray(array, element, elemets){
	for(let i = 0; i < array.length; i++){
		if(array[i] == element){
			array.splice(i, 1);
			if(!elemets)
				break;
		}
	}
	return array;
}

function isElementInArray(array, element){
	for(let i = 0; i < array.length; i++){
		if(array[i]+"" == element+""){
			return true;
		}
	}
	return false;
}
