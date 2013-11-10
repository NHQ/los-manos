var through = require('through');
var ext = require('./ext');
var Frame = require('../lib/frame')

module.exports = function(){
  return through(function(change){
    try{
      change = JSON.parse(change);
    } catch(e) {
      console.log('invalid json',change);
      return;
    }

    console.log('change',change)

    // not a change event.
    if(!change.type) return;

    var frame = Frame(change.frame.id);

    // for resolving order
    frame.t = change.frame.t;
    frame.index = change.frame.index;

    var images = change.frame.images;
    if(images) {
      for(var i=0;i<images.length;i++){
        // if we stop doing uri but we keep image data i can serliaze the image data to png data uri here.
        var idata = images[i];
        frame.addImage(idata.id,idata.uri);

        var img = frame.images[frame.images.length-1];
        img.obj = new Image();
        img.obj.src = idata.uri;

        var canvas = document.createElement('canvas');
        canvas.width = 640;//img.obj.width;
        canvas.height = 480;//img.obj.height;
 

        var ctx = canvas.getContext('2d');

        ctx.drawImage(img.obj,0,0);
        img.imgData = ctx.getImageData(0,0,canvas.width,canvas.height)
        img.canvas = canvas;

        img.obj.imgData = img.imgData;
    
      }
    }

    change.frame = frame;
    this.queue(change);
  });
}




