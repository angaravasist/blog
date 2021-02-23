var mongoose = require("mongoose");

var	subscribeSchema = new mongoose.Schema({
	email:  {type:String, required: true},
	date: {type:Date, default:Date.now}
});

module.exports = mongoose.model("subscribedData", subscribeSchema);