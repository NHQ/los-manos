var through = require('through');
var ext = require('./ext')
module.exports = function(){
  return through(function(change){

    console.log('serialize change >',change);

    var frame = ext({},change.frame);
    var images = change.frame.images;
    frame.images = [];
    if(images) {
      for(var i=0;i<images.length;i++){
        // if we stop doing uri but we keep image data i can serliaze the image data to png data uri here.
        frame.images.push({
          id:images[i].id
          ,uri:images[i].uri
        });
      }
    }
    change = ext({},change);
    change.frame = frame;
    this.queue(JSON.stringify(change)+"\n");
  });
}




