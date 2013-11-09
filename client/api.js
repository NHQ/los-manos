var hyperquest = require('hyperquest');

module.exports = {
  saveVideo:function(stream,id,cb){
    var res = [];
    stream.pipe(hyperquest('/api/save')).on('data',function(buf){
      res.push(buf)
    }).on('end',function(){
      cb(false,Buffer.concat(buf));
    })
  }
}

