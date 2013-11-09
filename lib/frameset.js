var through = require('through');

module.exports = function(rate,stream){
  
  // a stream so later i can pipe changes that happen to the server to save.
  var o = through();
  
  o.rate = rate||5,// fps
  o.frames = [],
  o.put = function(i,frame,cb){
    // put a frame. shgould probably splice in frame at i
    // frames should have unique ids if so i could move frames with this as well.
  };

  o.del = function(id,cb){
    // delete
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
      console.log('looping frame');
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
    });
  }

  return o;

}




