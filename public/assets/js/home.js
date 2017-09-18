$( document ).ready(function() {
 if($("#count").attr('value') == '0') {
   alert("No new articles to scrape.");
 } else if($("#count").attr('value') !== undefined) {
   alert($("#count").attr('value') + " new articles scraped.");
 }
});
