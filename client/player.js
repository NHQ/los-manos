// this is a writeable stream that expects an object stream of frames
// it could render on a canvas etc.


var through = require('through');

var renderFrame = require('./render_frame');

module.exports = function(container){

  var width = container.clientWidth;
  var height = container.clientHeight;

  console.log('rendering player in ',container,' of ',width,height,'dims')

  container.style.position = 'relative';// to be the position parent
  container.style.overflow = 'hidden';

  var renderers = {};

  var s = through(function(frame){

    if(frame) renderFrame(container,frame,width,height,renderers);

    if(renderers.audio){
      console.log('play the audio',audio);
      delete renderers.audio;
    }

  },function(){
    container.innerHTML = '';
    this.queue(null);
  });


  s.width = width;
  s.height = height;

  return s;
}




