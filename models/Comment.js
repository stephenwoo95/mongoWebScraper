// Require mongoose
var mongoose = require("mongoose");

// Create a Schema class with mongoose
var Schema = mongoose.Schema;

// make CommentSchema a Schema
var CommentSchema = new Schema({
  // body: just a string
  body: {
    type: String,
    required: true
  }
});

// Create the Comment model with the CommentSchema
var Comment = mongoose.model("Comment", CommentSchema);

// Export the model so we can use it on our server file.
module.exports = Comment;
