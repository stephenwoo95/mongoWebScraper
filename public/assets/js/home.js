// Grab the articles as a json
$.getJSON("/articles", function(data) {
  // For each one
  for (var i = 0; i < data.length; i++) {
    var buttonChoice = '';
    if(data[i].saved) {
      buttonChoice = "<a class='btn-floating green'><i class='material-icons'>check</i></a>";
    } else {
      buttonChoice = "<button class='saveBtn waves-effect waves-light btn blue'>Save Article</button>";
    }
    // Display the apropos information on the page
    $(".collection").prepend("<li class='collection-item' id='" + data[i]._id +"'> <h4>" + data[i].title + "</h4>" + buttonChoice + "<a target='_blank' href='" + data[i].link + "'>View Article</a> <p>" + data[i].summary + "</p> </li>");
  }
});

$( document ).ready(function() {
  $(".button-collapse").sideNav();
});

$( document ).on("click","#scrape", function() {
  console.log('scraping');
  $.getJSON("/scrape", function(count) {
    $.getJSON("/articles", function(data) {
      $(".collection").empty();
      for (var i = 0; i < data.length; i++) {
        var buttonChoice = '';
        if(data[i].saved) {
          buttonChoice = "<a class='btn-floating green'><i class='material-icons'>check</i></a>";
        } else {
          buttonChoice = "<button class='saveBtn waves-effect waves-light btn blue'>Save Article</button>";
        }
        // Display the apropos information on the page
        $(".collection").prepend("<li class='collection-item' id='" + data[i]._id +"'> <h4>" + data[i].title + "</h4>" + buttonChoice + "<a target='_blank' href='" + data[i].link + "'>View Article</a> <p>" + data[i].summary + "</p> </li>");
      }
      //change to modal
      alert(count.message);
    });
  });
});

$( document ).on("click",".saveBtn", function() {
  $.get("/saved/"+$(this).parent().attr('id'),function() {
    var saved = $("<a>");
    var icon = $("<i class='material-icons'>").text('check');
    saved.attr('class','btn-floating green');
    saved.append(icon);
    $(this).replaceWith(saved);
  }.bind(this));
});
