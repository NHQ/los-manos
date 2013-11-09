// this is a file for me to test stuff i load it on test.html
var container = document.getElementById('main');

var uuid = require('uuid')
var frameset = require('../lib/frameset');
var player = require('./player.js')
var frame = require('../lib/frame')
var film = require('film')

module.exports = function(){
  var set = frameset(1);
  var w = set.writeStream(); 
  // create 100 text frames.
  var t = 0;
  for(var i = 0;i<100;++i){
    t = t?0:1
    var f = frame(uuid.v4())
    if(t) f.text = 'hi '+i
    else f.text = 'ho '+i
    w.write(f);
  }

  w.end();

  console.log('added 100 frames');
  console.log(set);

  play = _playerEl();

  var playStream = player(play);

  set.play().pipe(playStream).on('end',function(){
    console.log('done playing');
    cb();
  });

}

module.exports.ee = function(video,canvas){
  // now its time to capture a frame every 5 seconds and play the video
  
      var cam = film();
      var em = cam.emit;
      cam.emit = function(){
        console.log(arguments);
        em.apply(this,arguments);
      }

      var film = document.getElementById('film');
      cam.on('snapshot',function(data){
        console.log('got snap')
        var render = film.getContext('2d')
        render.putImageData(data,0,0);
      })
        
}



function _playerEl(){
  var play = document.getElementById('player');
  if(!play) {
    play = document.createElement('div');
    play.style.width = "200px"; 
    play.style.height = "100px";
    play.style.border = '2px solid blue';
    play.setAttribute('id','player');
    container.appendChild(play);
    
  }
  return play;
}


module.exports.frameset = frameset;

module.exports.frame = frame;

module.exports.player = player;

module.exports.film = film;
