var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var path = require("path");
// Requiring our User, Article, Comments models
var Comment = require("./models/Comment.js");
var Article = require("./models/Article.js");
// Our scraping tools
var request = require("request");
var cheerio = require("cheerio");
// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

app.use(bodyParser.urlencoded({
  extended: false
}));

// Make public a static dir
app.use(express.static("public"));

// Database configuration with mongoose
mongoose.connect("mongodb://heroku_4wpnwjb0:31o31tml77s5r66pglr1aqh91f@ds141524.mlab.com:41524/heroku_4wpnwjb0");
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
app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname, "./views/index.html"))
});

app.get("/articles", function(req, res) {
  // Grab every doc in the Articles array
  Article.find({}, function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Or send the doc to the browser as a json object
    else {
      res.json(doc);
    }
  });
});

// A GET request to scrape the hacker news website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with request
  request("http://www.techcrunch.com/", function(error, response, html) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);
    // Now, we grab every h2 within an article tag, and do the following:
    var articles = [];
    var message = {};
    $("h2.post-title").each(function(i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this).children("a").text();
      result.link = $(this).children("a").attr("href");
      result.summary = $(this).siblings("p.excerpt").text();

      articles.push(result);

      if(i == $("h2.post-title").length-1) {
        Article.collection.insertMany(articles, {ordered:false}, function(err, docs) {
          if(!docs || docs.insertedCount == 0) {
            message.message = 'No new articles to scrape.';
          } else {
            message.message = docs.insertedCount + ' new articles scraped.';
          }
          res.json(message);
        });
      }
    });
  });
});

app.get("/saved", function(req, res) {
    res.sendFile(path.join(__dirname, "./views/saved.html"))
});

// This will save an article
app.get("/saved/:id", function(req, res) {
  Article.findByIdAndUpdate(req.params.id, {$set: {saved: true}}, function(err, doc) {
    res.end();
  });
});

app.get("/saved/articles/get", function(req, res) {
  Article.find({saved: true}, function(err, doc) {
    if(err) {
      res.send(err);
    }
    res.json(doc);
  });
});

app.get("/saved/delete/:id", function(req, res) {
  Article.findByIdAndUpdate(req.params.id, {saved: false}, function(err, doc) {
    if(err) throw err;
    res.end();
  });
});

// This will grab an article by it's ObjectId
app.get("/articles/:id", function(req, res) {
  Article.findById(req.params.id).populate("comments").exec(function(error, data) {
    if(error) {
      res.send(error);
    } else {
      res.json(data);
    }
  });
});

// Create a new comment or replace an existing comment
app.post("/articles/:id", function(req, res) {
  console.log(req.body);
  var entry = new Comment(req.body);
  console.log(entry);
  entry.save(function(err, doc) {
    // Log any errors
    if (err) {
      console.log(err);
    }
    // Or log the doc
    else {
      // Find our user and push the new comment id into the User's comments array
      Article.findByIdAndUpdate(req.params.id, { $push: { "comments": doc._id } }, { new: true }, function(err, newdoc) {
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

app.get("/delete/:id", function(req, res) {
  Comment.remove({_id:req.params.id}, function(err, data) {
    if(err) {
      res.send(err);
    } else {
      res.end();
    }
  });
});

// Listen on port 3000
app.listen(PORT, function() {
  console.log("App running on port 3000!");
});
