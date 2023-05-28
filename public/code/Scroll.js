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

// window.addEventListener('load', function() {
//   setTimeout(function() {
//     document.getElementById('loader').style.display = 'none';
//     document.getElementById('grades-table').style.display = 'table';
 


 
//   var table = document.getElementById("myTable");
//   if (table.rows.length === 0) {
//     var div = document.getElementById("myDiv");
//     table.parentNode.insertBefore(div, table);
//   }
  

// });
	
function showMenu() {
  var asideElement = document.getElementById('aside-menu');
  var showMenuButton = document.getElementById('show-menu-button');

  if (asideElement.style.display === 'none') {
    asideElement.style.display = 'block';
    setTimeout(function() {
      asideElement.style.opacity = '1';
    }, 4);
   
  } else {
    asideElement.style.opacity = '0';
    setTimeout(function() {
      asideElement.style.display = 'none';
    }, 100);
    
  }
}



