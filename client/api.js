var hyperquest = require('hyperquest');

var engine = require('engine.io-stream');


module.exports = {
  socket:function(id){
    var stream = engine('/editing');

    stream.write(JSON.stringify({frameset:id})+'\n')

    return stream;
  },
  playVideo:function(id){
    var res = [];
    // should pass through frameify
    return stream.pipe(hyperquest('/api/play/'+id));

  },
  saveTitle:function(id,title,cb){
    console.log('should save title',id,title);
    cb();
  }
}

