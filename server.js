var express = require("express");
var exphbs = require("express-handlebars");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
// Requiring our User, Article, Comments models
var User = require("./models/User.js");
var Comment = require("./models/Comment.js");
var Article = require("./models/Article.js");
// Our scraping tools
var request = require("request");
var cheerio = require("cheerio");
// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;

// Initialize Express
var app = express();

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.use(bodyParser.urlencoded({
  extended: false
}));

// Make public a static dir
app.use(express.static("public"));

//mongodb://heroku_z0j7bzpb:nu6gt7dk1av56tg1o66rpevhc9@ds133814.mlab.com:33814/heroku_z0j7bzpb
// Database configuration with mongoose
mongoose.connect("mongodb://localhost/mongoScraper");
var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
  console.log("Mongoose connection successful.");
});




// Routes
// ======
app.get("/:count?", function(req, res) {
  Article.find({}, function(error, data) {
    if(error) {
      res.send(error);
    } else {
      var hbsObject = {
        Articles: data,
        count: req.params.count
      };
      console.log(hbsObject);
      res.render("index", hbsObject);
    }
  });
});

// A GET request to scrape the hacker news website
app.get("/api/scrape", function(req, res) {
  // First, we grab the body of the html with request
  var count = 0;
  request("http://www.techcrunch.com/", function(error, response, html) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);
    // Now, we grab every h2 within an article tag, and do the following:
    $("h2.post-title").each(function(i, element) {

      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this).children("a").text();
      result.link = $(this).children("a").attr("href");
      result.summary = $(this).siblings("p.excerpt").text();

      // Using our Article model, create a new entry
      // This effectively passes the result object to the entry (and the title and link)

      Article.findOneAndUpdate({title: result.title}, result, {upsert: true, new:true, passRawResult: true}, function(err,numberAffected,rawResponse) {
        if(!rawResponse.lastErrorObject.updatedExisting) {
          count++;
        }
      });
    });
  });
  // Tell the browser that we finished scraping the text
  res.redirect("/"+count);
});

// This will grab an article by it's ObjectId
app.get("/articles/:id", function(req, res) {
  Article.findById(req.params.id).populate("comment").exec(function(error, data) {
    if(error) {
      res.send(error);
    } else {
      res.render("index",{Article: data});
    }
  });
});

// Create a new comment or replace an existing comment
app.post("/articles/:id", function(req, res) {
  var entry = new Comment(req.body);
  entry.save(function(err, doc) {
    // Log any errors
    if (err) {
      console.log(err);
    }
    // Or log the doc
    else {
      // Find our user and push the new comment id into the User's comments array
      Article.findByIdAndUpdate(req.params.id, { $set: { "comment": doc._id } }, { new: true }, function(err, newdoc) {
        // Send any errors to the browser
        if (err) {
          res.send(err);
        }
        // Or send the newdoc to the browser
        else {
          res.send(newdoc);
        }
      });
    }
  });
});


// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});
