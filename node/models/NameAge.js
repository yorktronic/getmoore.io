var mongoose = require('mongoose');

// mongodb schema for alan's exercise
var NameAgeSchema = new mongoose.Schema({
	name: String,
	age: Number,
});

mongoose.model('NameAge', NameAgeSchema);
