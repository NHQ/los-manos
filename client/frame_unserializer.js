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
      }
    }

    change.frame = frame;
    this.queue(change);
  });
}




