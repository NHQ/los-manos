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

  if(req.url == '/') {
      res.writeHead(200, {"content-type" : "text/html"})
      var hs = hyperstream({
          '#compositor' : fs.createReadStream(__dirname+'/public/comp.html'),
          '#capture' : fs.createReadStream(__dirname+'/public/capture.html')
      })
      fs.createReadStream(__dirname + '/public/index.html').pipe(hs).pipe(res)
  }
  else {      
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



