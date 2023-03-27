window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    document.getElementById("scroll-to-top").style.display = "block";
  } else {
    document.getElementById("scroll-to-top").style.display = "none";
  }
}

document.getElementById("scroll-to-top").addEventListener("click", function() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
});

window.addEventListener('load', function() {
  setTimeout(function() {
    document.getElementById('loader').style.display = 'none';
    document.getElementById('grades-table').style.display = 'table';
 

  }, 3000); // زمن التأخير بالميلي ثانية (هنا 3 ثواني)
 
  var table = document.getElementById("myTable");
  if (table.rows.length === 0) {
    var div = document.getElementById("myDiv");
    table.parentNode.insertBefore(div, table);
  }
  

});


