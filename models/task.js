const mongoose = require('mongoose');
const Schema = 	mongoose.Schema;

const schema = new Schema({
	description: {
		type: String,
		required: true
	},
	creatorId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	users: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Task'
	}]
});

module.exports = mongoose.model('Task', schema);
