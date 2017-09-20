$.getJSON("/saved/articles/get", function(data) {
  // For each one
  for (var i = 0; i < data.length; i++) {
    button1 = "<a class='addComment waves-effect waves-light btn blue modal-trigger' href='#commentsModal'>Add Comment</a>";
    button2 = "<button class='deleteArticle waves-effect waves-light btn red'>Remove Article</button>";

    // Display the apropos information on the page
    $(".collection").prepend("<li class='collection-item' id='" + data[i]._id +"'> <h4>" + data[i].title + "</h4>" + button2 + button1 + "<a target='_blank' href='" + data[i].link + "'>View Article</a> <p>" + data[i].summary + "</p> </li>");
  }
});

$( document ).ready(function() {
  $(".button-collapse").sideNav();
  $('.modal').modal();
});

$( document ).on("click",".addComment", function() {
  $("#commentsCollection").empty();
  $.get("/articles/"+$(this).parent().attr('id'), function(data) {
    $("#commentsModal").attr('data',data._id);
    $(".modal-content h4").html(data.title);
    for(var i=0;i<data.comments.length;i++) {
      var newEntry = $("<li class='collection-item'>").attr('id',data.comments[i]._id);
      var body = $("<span>").html(data.comments[i].body);
      var close = $("<a class='deleteComment waves-effect waves-red btn-flat'>").html('&times;');
      newEntry.append(body, close);
      $("#commentsCollection").append(newEntry);
    }
  });
});

$( document ).on("click","#commentSubmit", function() {
  var newComment = $("#commentText").val();
  console.log(newComment);
  $("#commentText").val('');
  $.post("/articles/"+$(this).parent().parent().attr('data'),{body:newComment}, function(data) {
    console.log(data);
    var newEntry = $("<li class='collection-item'>").attr('id',data.comments[data.comments.length-1]);
    var body = $("<span>").html(newComment);
    var close = $("<a class='deleteComment waves-effect waves-red btn-flat'>").html('&times;');
    newEntry.append(body, close);
    $("#commentsCollection").append(newEntry);
  });
});

$( document ).on("click", ".deleteComment", function() {
  $.get("/delete/"+$(this).parent().attr('id'), function() {
    $(this).parent().remove();
  }.bind(this));
});

$( document ).on("click",".deleteArticle", function() {
  $.get("/saved/delete/"+$(this).parent().attr('id'), function() {
    $.getJSON("/saved/articles/get", function(data) {
      $(".collection").empty();
      for (var i = 0; i < data.length; i++) {
        button1 = "<a class='addComment waves-effect waves-light btn blue modal-trigger' href='#commentsModal'>Add Comment</a>";
        button2 = "<button class='deleteArticle waves-effect waves-light btn red'>Remove Article</button>";

        // Display the apropos information on the page
        $(".collection").prepend("<li class='collection-item' id='" + data[i]._id +"'> <h4>" + data[i].title + "</h4>" + button2 + button1 + "<a target='_blank' href='" + data[i].link + "'>View Article</a> <p>" + data[i].summary + "</p> </li>");
      }
    });
  });
});
