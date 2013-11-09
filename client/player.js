// this is a writeable stream that expects an object stream of frames
// it could render on a canvas etc.


var through = require('through');

module.exports = function(container){

  var width = container.clientWidth;
  var height = container.clientHeight;

  container.style.position = 'relative';// to be the position parent
  container.style.overflow = 'hidden';

  var renderers = {
    text:document.createElement('div'),
    images:{},// if we are dealing only with data uris i shouldnt need preloading but that wont always be the case i guess.
    //sound://
  };

  container.appendChild(renderers.text);
  
  // there is only one text at a time. it is always 200 high.
  renderers.text.style.position = 'absolute';
  renderers.text.style.bottom = '0px';
  renderers.text.style.left = '0px';
  renderers.text.zIndex = 200;


  var zToggle = 0;

  var s = through(function(frame){
    //

    console.log('player frame',frame)

    if(frame.text){
      if(renderers.text.firstChild) renderers.text.removeChild(renderers.text.firstChild)
      renderers.text.appendChild(document.createTextNode(frame.text));
    }

    var showing = {};
    if(frame.images) {
      // write frames under/over
      zToggle = zToggle === 0?100:0;

      var ids = {};
      var updated = {}; 

      for(var i=0;i<frame.images.length;++i){
        var image = frame.images[i];
        ids[image.id] = 1;
        if(renderers.images[image.id]) {
          // re use existing image
          var rendered = renderers.images[image.id];
          rendered.obj.style.zIndex = i+1+zToggle;
          delete renderers.images[image.id]
          updated[image.id] = rendered;
        } else {
          // create new image
          var img = new Image();
          img.src = image.uri;
          img.style.zIndex = i+1+zToggle;
          img.style.position = 'absolute';
          img.style.top = '0px';
          img.style.left = '0px';
          image.obj = img;
          updated[image.id] = image;
          container.appendChild(img);
        }
      }

      var inframe = Object.keys(renderers.images);
      for(var i=0;i<inframe.length;++i){
        container.removeChild(inframe[i]);
      }

      renderers.images = updated;
    }

    if(frame.audio) {
      // make the audio element or audioContext and play it.
      // remove when done.
    }

  },function(){
    container.innerHTML = '  FIN.  ';
  });


  s.width = width;
  s.height = height;

  return s;
}




