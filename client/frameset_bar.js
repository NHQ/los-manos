
var through = require('through');
var renderFrame = require('./render_frame')


module.exports = function(container,frameset){
  var o = {
    frames:[],
    frameids:{},
    change:function(data){
      // at least these fields should be set.
      data.event // put,del
      data.index // position in the array to splice into
      data.frame // the frame to render
      if(z.frameids[data.frame.id]) // this is renderd already
      
    },
    render:function(index,frame){
      
    }
  }

  // watch for future changes to this frame set and update my horizontal list
  frameset.on('data',function(){
    o.change()
  })
}


