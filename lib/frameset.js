var through = require('through');

module.exports = function(rate){
  
  // a stream so later i can pipe changes that happen to the server to save.
  var o = through();
  
  o.rate = rate||5,// fps
  o.frames = [],
  o.frameids = {};

  // called with frame and no index will push it onto the end.
  o.put = function(i,frame){ 
    var z = this;
    if(typeof i != "number"){
      frame = i;
      i = z.frames.length;
    } else if(i < 0) i = z.frames.length; // -1 means push also

    // if its in already lets get it out
    // later i can think about comparing clocks.
    if(z.frameids[frame.id]){

      var index = arraySearch(z.frames,z.frameids[frame.id]);

      delete z.frameids[frame.id];
      if(index > -1) {
        z.frames.splice(index,1);
      }
    }

    // put a frame. shgould probably splice in frame at i
    // frames should have unique ids if so i could move frames with this as well.

    z.frameids[frame.id] = frame;
    if(frames.length-1 <= i) {
      // too long just push
      o.frames.push(frame);
      i = o.frames.length-1;
    } else {
      o.frames.splice(i,0,frame)
    }

    this.queue({
      type:'put',
      index:i,
      frame:frame
    });
  };

  o.del = function(id){
    // delete
    var z = this;
    if(z.frameids[id]){
      var index = arraySearch(z.frames,z.frameids[id])
      delete z.frameids[id];
      if(index == -1) return;
      var frame = z.frames.splice(index,1);
      this.queue({
        type:'del',
        index:index,
        frame:frame
      });
      return frame;
    }
  }
  
  o.play = function(from,to,rate){
    // returns readable stream
    var s = through();

    // emits object stream of frames at a specific rate.
    var z = this;
    var frame = from||0;
    var end = to||z.frames.length-1;
    var rate = rate||z.rate;
    var looping = 0;

    function fn(){
      looping = true;
      setTimeout(function(){
        looping = false;

        var more = s.write(z.frames[++frame]);
        
        if(frame <= end && more) fn();
        else s.end();

      },z.rate*1000)// naive for now.
    }

    s.on('drain',function(){
      if(!looping) fn();
    })

    // start playing.
    // if you are playing a valid frame.
    if(frame < z.frames.length && frame >= 0) fn();
    else process.nextTick(function(){
      s.end();
    });

    return s;
  }

  o.readStream = function(){
    // returns readable stream
    // emits object stream of frames with no delay.
    return this.play(o,this.frames.length-1,0);
  }

  o.writeStream = function(){
    var z = this;
    // expects object stream of frames.
    return through(function(frame){
      z.frames.push(frame);
      z.frameids[frame.id] = frame;
      this.queue({
        type:'put',
        index:z.frames.length-1,
        frame:frame
      });
    });
  }

  return o;

}



function arraySearch(arr,search){
  if(arr.indexOf) return arr.indexOf(search);
  var index = -1;
  for(var j=0;j<arr.length;++j) {
    if(arr[j] === search) {
      index = j;
      break;
    }
  }
  return index;
}
