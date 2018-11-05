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

exports.load = async function(userId){
	let tasks = [];
	let user = await User.findById(userId, function (err, user) {
			if (err) return err;
	});
	for(let i = 0; i < user.tasks.length; i++){
		task = await getTaskPromiseById(user.tasks[i]);
		tasks.push(task);
	}
	console.log(JSON.stringify(tasks));
	return tasks;
}
exports.emails = async function(){
	let emails = await User.find({}, {email: true}, function (err, users) {
			if (err) return err;
	});
	return emails;
}
exports.add = async function(userId, description){
	let task = new Task({
		   description: description,
		   creatorId: userId,
		   users: [userId]
	});
   	task.save(function (err) {
        if (err) {
            return err;
        }
        console.log("task created");
   });
   let user = await User.findById(userId, function (err, user) {
		   if (err) return err;
   });
   	user.tasks.push(task._id);
	user.save(function (err) {
        if (err) {
            return err;
        }
        console.log("task saved into user");
   });

	return task;
}
exports.del = async function(taskId){
	let task = await Task.findById(taskId, function (err, task) {
			if (err) return err;
	});
	try{
		let a = task.users;
	}catch(err){
		return err;
	}
	for(let i=0; i < task.users.length; i++){
		await User.update( {_id: task.users[i]}, { $pullAll: {tasks: [taskId] } } );
	}
	await Task.findOneAndRemove({_id: taskId})
    .then((docs)=>{
	}).catch((err)=>{
       reject(err);
   	});

	return true;
}
exports.update = async function(taskId, description){
	await Task.update( {_id: taskId}, { description: description } );
	return true;
}
exports.share = async function(taskId, userId){
	let user = await User.findById(userId, function (err, user) {
 		   if (err) return err;
    });
	if((()=>{
		for(let i = 0; i < user.tasks.length; i++){
			if(user.tasks[i]._id == taskId){
				return true;
			}
		}
		return false;
	})()){
		return "This user already have this task";
	}
	let task = await Task.findById(taskId, function (err, user) {
 		   if (err) return err;
    });
    user.tasks.push(taskId);
 	user.save(function (err) {
         if (err) {
             return err;
         }

    });
    task.users.push(userId);
 	task.save(function (err) {
         if (err) {
             return err;
         }
		 console.log("task shared");
    });
	return true;
}
exports.findUser = async function(email, password){
	let exist;
	await User.find({
		email: email,
		password: password
	}).then(users => {
		if(users.length == 0){
			exist = false;
		}else{
			exist = true;
		}
	}).catch(err => {
      	exist = false;
    });
	return true;
}
exports.cerateUser = async function(taskId, description){
	await Task.update( {_id: taskId}, { description: description } );
	return true;
}

function getTaskPromiseById(taskId){
	return Task.findById(taskId, function (err, task) {
		if (err) return err;
		return task;
	});
}
function getUserPromiseById(userId){
	return User.findById(userId, function (err, user) {
			if (err) return err;
			return user;
	});
}
