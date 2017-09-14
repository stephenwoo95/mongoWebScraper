// Require mongoose
var mongoose = require("mongoose");
// Create Schema class
var Schema = mongoose.Schema;

// Create article schema
var UserSchema = new Schema({
  // title is a required string
  username: {
    type: String,
    required: true
  },
  // This only saves one note's ObjectId, ref refers to the Note model
  articles: [{
    type: Schema.Types.ObjectId,
    ref: "Article"
  }]
});

// Create the User model with the UserSchema
var User = mongoose.model("User", UserSchema);

// Export the model
module.exports = User;
