let emails = [], allTasks = [], me;
$(document).ready(loadData);

async function loadData(){
	let tasks = [];
 	let tasksPromise = $.ajax({
		type : "POST",
		contentType : "application/json",
		url : window.location + "/api/tasks/load",
		data : JSON.stringify({}),
		dataType : 'json',
		success : function(answer) {
			tasks = answer;
		},
		error : function(e) {
			console.log("ERROR: ", e);
		}
	});
	let mePromise = $.ajax({
		type : "POST",
		contentType : "application/json",
		url : window.location + "/api/tasks/me",
		data : JSON.stringify({}),
		dataType : 'json',
		success : function(answer) {
			me = answer;
		},
		error : function(e) {
			console.log("ERROR: ", e);
		}
	});
	let emailsPromise = $.ajax({
		type : "POST",
		contentType : "application/json",
		url : window.location + "/api/tasks/emails",
		data : JSON.stringify({}),
		dataType : 'json',
		success : function(answer) {
			emails = answer;
		},
		error : function(e) {
			console.log("ERROR: ", e);
		}
	});
	await tasksPromise;
	await emailsPromise;
	await mePromise;
	for(let i = 0; i < tasks.length; i++){
		tasks[i].owner = "Not found";
		for(let j = 0; j < emails.length; j++){
			if(tasks[i].creatorId == me._id){
				tasks[i].owner = 'You';
				break;
			}
			if(tasks[i].creatorId == emails[j]._id){
				tasks[i].owner = emails[j].email;
				break;
			}
		}
	}
	tasks.reverse();
	allTasks = tasks;
	for(let i = 0; i < tasks.length; i++){
		setTimeout(()=>{printTask(tasks[i], emails, 'tasksContainer', 1);}, 150*i);
	}
}
async function add(){
	let input = {
		description: $('textarea#editDesc').val()
	};
	if(input.description == ""){
		return 0;
	}
	let task;
    let taskPromice = $.ajax({
		type : "POST",
		contentType : "application/json",
		url : window.location + "/api/tasks/add",
		data : JSON.stringify(input),
		dataType : 'json',
		success : function(answer) {
			task = answer;
		},
		error : function(e) {
			console.log("ERROR: ", e);
		}
	});
	await taskPromice;
	task.owner = 'You';
	allTasks.reverse();
	allTasks.push(task);
	allTasks.reverse();
	printTask(task, emails, 'tasksContainer', 0);
    $('textarea#editDesc').val("");
}
async function del(taskId){
	let input = {
		taskId: taskId
	};
	if(input.taskId == ""){
		return 0;
	}
	$( "#task" + input.taskId).remove();
	let result;
    let resultPromice = $.ajax({
		type : "POST",
		contentType : "application/json",
		url : window.location + "/api/tasks/delete",
		data : JSON.stringify(input),
		dataType : 'json',
		success : function(answer) {
			result = answer;
		},
		error : function(e) {
			console.log("ERROR: ", e);
		}
	});
	await resultPromice;
	for(let i=0; i < allTasks.length; i++){
		if(allTasks[i]._id == input.taskId){
			allTasks.splice(i, 1);
			break;
		}
	}
}
async function edit(taskId){
	printForm(taskId, 0);
}
async function cancel(){
	printForm(null, 1);
}
async function update(taskId){
	let description = $('textarea#editDesc').val();
	cancel();
	let input = {
		taskId: taskId,
		description: description
	};
	let result;
	let resultPromice = $.ajax({
		type : "POST",
		contentType : "application/json",
		url : window.location + "/api/tasks/update",
		data : JSON.stringify(input),
		dataType : 'json',
		success : function(answer) {
			result = answer;
		},
		error : function(e) {
			console.log("ERROR: ", e);
		}
	});

	let task;
	for(let i=0; i < allTasks.length; i++){
		if(allTasks[i]._id == taskId){
			allTasks[i].description = description;
			task = allTasks[i];
			break;
		}
	}
	printTask(task, emails, 'task'+ task._id, 2);
	await resultPromice;
}
async function share(taskId, userId){
	let input = {
		taskId: taskId,
		userId: userId
	};
	let result;
	console.log(input);
	await $.ajax({
		type : "POST",
		contentType : "application/json",
		url : window.location + "/api/tasks/share",
		data : JSON.stringify(input),
		dataType : 'json',
		success : function(answer) {
			result = answer;
		},
		error : function(e) {
			console.log("ERROR: ", e);
		}
	});
}

function printTask(task, emails, elementId, action){
		/*action 0-print to begin, 1-print to end, 2-replase element;*/
	let color = (()=>{
		let x = Math.round(Math.random()*3);
		switch (x) {
			case 0:
				return 'primary';
			break;
			case 1:
				return 'success';
			break;
			case 2:
				return 'danger';
			break;
			case 3:
				return 'warning';
			break;
			default:
				return 'secondary';
		}
	})();
	let drordownMenuItems = (()=>{
		let str = "";
		for(let i=0; i < emails.length; i++){
			if(emails[i]._id !=  me._id){
				str += `<a class="dropdown-item" onclick="share('`+ task._id +`', '`+ emails[i]._id +`')">`+emails[i].email +`</a>`;
			}
		}
		return str;
	})();
	let taskHTML = `
	<div class="row justify-content-md-center my-1" id="task`+ task._id +`">
		<div class="col-9 align-self-center">
			<div class="alert alert-`+ color +` shadow-sm" id="taskText">
				<h5 class="alert-heading"><b class="font-weight-light">Owner: </b>`+ task.owner +`</h5>
				<p><b class="font-weight-light">Description: </b>`+ task.description +`</p>
			</div>
		</div>
		<div class="col-3 align-self-center">
			<div class="row justify-content-start mb-3">
				<div class="d-inline-flex px-3">
					<button type="button" class="btn btn-danger shadow-sm" onclick="del('`+ task._id +`')">Delete</button>
				</div>
				<div class="d-inline-flex pl-0">
				   <button type="button" class="btn btn-warning shadow-sm" onclick="edit('`+ task._id +`')" >Edit</button>
			   </div>
			</div>
			<div class="row justify-content-md-center mb-3">
				<div class="col">
					<div class="dropdown">
						  <button class="btn btn-success dropdown-toggle  shadow-sm" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
								Share
						  </button>
						  <div class="dropdown-menu" aria-labelledby="share">
						  		`+ drordownMenuItems +`
						  </div>
					</div>
				</div>
			</div>
		</div>
	</div>`;
	switch (action) {
		case 0:
			document.getElementById(elementId).innerHTML =  taskHTML + document.getElementById(elementId).innerHTML;
			break;
		case 1:
			document.getElementById(elementId).innerHTML =  document.getElementById(elementId).innerHTML + taskHTML;
			break;
		case 2:
			document.getElementById(elementId).outerHTML =  taskHTML;
			break;
		default:
			console.log("Wrong action");
	}
}
function printForm(taskId, action){
		/*actions 0-edit, 1-update/cancel*/
	let task;
	if(action == 0){
		for(let i=0; i < allTasks.length; i++){
			if(allTasks[i]._id == taskId){
				task = allTasks[i];
				break;
			}
		}
	}
	let button = "";
	switch (action) {
		case 0:
			button = `
			<button type="button" class="btn btn-success shadow-sm float-left mb-2" onclick="update('`+ taskId +`')">Update</button>
			<button type="button" class="btn btn-warning shadow-sm float-left" onclick="cancel()">Cancel</button>`;
			break;
		case 1:
			button = `
			<button type="button" class="btn btn-primary shadow-sm float-left" id="addButton" onclick="add()">Add</button>`;
			break;
		default:
			console.log("Wrong action");
	}
	let textField = "";
	switch (action) {
		case 0:
			textField = `<textarea class="form-control shadow-sm" style="width: 100%" name="description" rows="3" placeholder="Write your task here..." id="editDesc">`+task.description+`</textarea>`;
			break;
		case 1:
			textField = `<textarea class="form-control shadow-sm" style="width: 100%" name="description" rows="3" placeholder="Write your task here..." id="editDesc"></textarea>`;
			break;
		default:
			console.log("Wrong action");
	}
	let formHTML = `
	<form  method="post" action="/add" class="form-inline" id="editForm">
		<div class="col-10 form-group pr-0  mr-3">
			`+ textField +`
		</div>
		<div class="col-1">
			 `+ button +`
		</div>
	</form>`;
	document.getElementById('editForm').outerHTML = formHTML;
}

function signout(){
	var form = jQuery('<form>', {
		'action': '/signout',
		'method': 'post',
		'style': 'display:none;'
	});
	$(document.body).append(form);
	form.submit();
}
