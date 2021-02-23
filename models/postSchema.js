var mongoose=require("mongoose");

var	postSchema = new mongoose.Schema({
	title: {type:String, required: true},
	keywords: {type: Array, required: true},
	kababCasedTitle: {type: String, required: true},
	url: {type:String, required: true},
	shortDescription: {type:String, required: true},
	Featured: {type:Boolean, default:false, required: true},
	description: {type:String, required: true},
	created: {type:Date, default:Date.now},
	author: {
      id: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
      },
      username: String
   }
});

module.exports = mongoose.model("Post", postSchema);