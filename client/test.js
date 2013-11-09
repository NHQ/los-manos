// this is a file for me to test stuff i load it on test.html
var container = document.getElementById('main');


var film = require('film')

module.exports = function(video,canvas){
  return film(video,canvas);
}


module.exports.film = film;
