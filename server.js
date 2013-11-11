// https://github.com/nko4/website/blob/master/module/README.md#nodejs-knockout-deploy-check-ins
//require('nko')('H0DfPY-ClY1wkrvJ');
var fs = require('fs')
var spawn = require('child_process').spawn;

var isProduction = (process.env.NODE_ENV === 'production');
var http = require('http');
var port = (isProduction ? 80 : 8000);

var ecstatic = require('ecstatic')({
    root       : __dirname + '/public', 
    autoIndex  : true,
    defaultExt : 'html'
});
var hyperstream = require('hyperstream')

/* vote example
function (req, res) {
  // http://blog.nodeknockout.com/post/35364532732/protip-add-the-vote-ko-badge-to-your-app
  var voteko = '<iframe src="http://nodeknockout.com/iframe/los-manos" frameborder=0 scrolling=no allowtransparency=true width=115 height=25></iframe>';

  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end('<html><body>' + voteko + '</body></html>\n');
}*/


// dev channel
var b = spawn(__dirname+'/node_modules/.bin/watchify', ['-e', __dirname + '/browser.js', '-t', 'brfs', '-o', __dirname + '/public/bundle.js', '-d'])
b.stderr.on('data', function(data){ console.log(data.toString('utf8'))});
// dev channel

var server = http.createServer(function(req,res){

  if(req.url.indexOf('/edit/') === 0) {
      res.writeHead(200, {"content-type" : "text/html"})
      var hs = hyperstream({
          '#compositor' : fs.createReadStream(__dirname+'/public/comp.html'),
      })
      var hs2 = hyperstream({
          '#compOpts' : fs.createReadStream(__dirname+'/public/compOpts.html')
      })
      
      fs.createReadStream(__dirname + '/public/index.html').pipe(hs).pipe(hs2).pipe(res)
  } else if(req.url === '/') { 

      res.writeHead(200, {"content-type" : "text/html"})
      fs.createReadStream(__dirname + '/public/sharecode.html').pipe(res)

  } else if (req.url.indexOf('/api/') > -1) {
    if(req.url.indexOf('/api/save/') > -1) {
      // makes the id!
 
      var frames = db.sublevel('frames')

      var len = 0;
      var chunks = 0;

      req.on('data',function(buf){
        chunks++;
        len += buf.length;
      }).on('end',function(){
        res.end('yay thanks for sending me that stuff! '+chunks+' chunks, '+len+' len');
      })

    } else {
      res.end('oh no! donde estas '+req.url+'. son sabroso?');
    }

  } else {      
    ecstatic(req,res);
  }
}).listen(port, function(err) {
  if (err) { console.error(err); process.exit(-1); }

  // if run as root, downgrade to the owner of this file
  if (process.getuid() === 0) {
    require('fs').stat(__filename, function(err, stats) {
      if (err) { return console.error(err); }
      process.setuid(stats.uid);
    });
  }

  console.log('Server running at http://0.0.0.0:' + port + '/');
});


var engineServer = require('engine.io-stream')
var uuid = require('uuid');
var db = require('./lib/db')();// leveldb!!
var liveStream = require('level-live-stream');
var framedb = db.sublevel('framesets');
var framedatadb = db.sublevel('framesetdata');

var monotonic = require('monotonic-timestamp');
var through = require('through');


var engine = engineServer(function(socket){

  // socket
  var id = false;
  var sub;
  var stream;
  var writeStream = framedb.createWriteStream();
  var socketid = uuid.v4();

  // when i get an id i check to see if its a write id or a read only id.
  socket.pipe(through(function(data){
    try{
      data = JSON.parse(data)
    } catch(e){
      return;
    }

    if(!data.type) {
      if(data.frameset){
        console.log('socket selected frameset', data.frameset);
        if(data.frameset != id){
          // same socket new frameset.
          if(stream) stream.end();
        }
        
        id = data.frameset;
        var datakey = id+"!data";
        framedatadb.get(id+"!data",function(err,data){
          var share = false;
          var after = function(){
            console.log('sending info !',share)
            socket.write(JSON.stringify({info:1,socketid:socketid,share:share})+"\n");
          }
          if(err) {
            var share = monotonic().toString(36);
            framedatadb.put(datakey,{share:share},function(){})

            framedatadb.put('share!'+share,id,function(){
              after();
            })
          } else {
            share = data.share;
            after();
          }
          
        });
        // subscribe this user to changes to this framesets frames. and send the existing frames.
        stream = liveStream(framedb,{start:id+'!',end:id+'!~'});
        stream.pipe(through(function(data){
          var _socket = index = t = null;
          frame = data.value||{};
          if(!data.value) {
            console.log('del?',data);
            frame.id = data.key.split('!').pop();
            
          } else {
            index = data.value.index;
            t = data.value.t;
          }
          var change = {
            type:!data.value?'del':'put',
            frame:frame,
            t:t,// with t i can order changes to index.
            index:index
          };
          // you gave me this.
          if(_socket === socketid) {
            // ignore. or omit uri from outgoing packet because this client created the event and its such a waste to send it again.
            //data.value.images foreach .uri = true;//TODO
          }
          this.queue(JSON.stringify(change)+"\n");
        })).pipe(socket,{end:false});
      } else {
        console.log('unassociated socket message dropped.'+(new Date()),data.id,Object.keys(data));
      }
    } else if(id && data.frame){
      console.log('updating frame in db?')

      var frame = data.frame;
      //only valid types.
      if(data.type != 'put' && data.type != 'del') return;

      // the way im putting data in this store it will read out of frame order.
      // each frame carries its index in the list which frameset can use to manage putting in order in the ui.
      //
      // the vector clocking + xdiff diff3 patch would be done here too 
      var o = {key:id+'!'+frame.id,type:data.type};
      if(data.type == 'put') {
        o.value = data.frame;
        o.value.index = data.index;
        o.value.socket = socketid;
        o.value.t = monotonic();
      }

      console.log(o.key);

      this.queue(o);

    } else {
      console.log('unassociated typed socket message dropped.'+(new Date()),data.id);
    }


  })).pipe(writeStream);

  socket.on('end',function(){
    //
    console.log('socket ',socketid,' disconnected');
  });

});

engine.attach(server,'/editing');


