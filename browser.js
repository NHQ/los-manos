var userMediaStream = require('./client/getUserMedia.js')({audio: true, video: true})

var comp = require('./client/comp.js')

var prefix = require('./prefix.js')().css
var Film = require('film');
var spin = require('uxer/spin');

var uuid = require('uuid');
var framesets = require('./lib/frameset')
var frameobj = require('./lib/frame');
var renderFrame = require('./client/render_frame')
var api = require('./client/api');
var player = require('./client/player')

// the current frameset
var frameset = framesets();//(rate) defaults to 5 fps

//composition page
var frames = document.getElementById('frameset')

// capture page
var snapShotButton = document.getElementById('snapShot')
var videoEl = document.getElementById('source')
var monitor = document.getElementById('monitor')
var monitorButton = document.getElementById('monitorButton')

var film = document.getElementById('film')
var mirror = document.getElementById('mirror')
var shutterSpeed = document.getElementById('shutterSpeed')
var filmSpeed = document.getElementById('filmSpeed')
var filmColor = document.getElementById('filmColor')
var lightColor = document.getElementById('lightColor')
var overlay = document.getElementById('superOverlay')
var invert = document.getElementById('invert')
var alpha = document.getElementById('alpha')
var rexpose = document.getElementById('exposureShot')
var exportFrame = document.getElementById('exportFrame')
var exportGif = document.getElementById('exportGif')
var frameDurInput = document.getElementById('frameDuration')
var compOpts = document.getElementById('compOpts')

var render = film.getContext('2d');
var _selected = undefined;
var shooting = false;
var params = {
    shutterSpeed: 41.6,
    filmSpeed: 1,
    r: 0,
    g: 0,
    b: 0,
    a: 255,
    invert: false
}
window.drrrr = {};
var h = window.innerHeight

monitorButton.addEventListener('change', function(e){
    toggleMonitor(this.checked)
})

function toggleMonitor(val){
    if(val) {
        monitor.style.display = 'none';
        compOpts.style.display = "block"
        
    }
    else {
        monitor.style.display = "block";
        compOpts.style.display = "none"
    }
    monitorButton.checked = val || false;
}


frameDurInput.addEventListener('keyup', function(){
    drrrr[film.imgEl.getAttribute('data-frame')] = parseInt(this.value)
    console.log('drrr', drrrr)
})

userMediaStream.on('stream', function(stream){
    
    var camera = Film(stream, videoEl, mirror, film)

    invert.addEventListener('change', function(e){
        params.invert = this.checked
    })

    alpha.addEventListener('keyup', function(e){
        params.a = Math.max(Math.min(parseInt(this.value), 255), 0)
        this.value = params.a
    })
    
    shutterSpeed.addEventListener('keyup', function(e){
        params.shutterSpeed = Math.max(parseInt(this.value), 1000/24)
    })

    filmSpeed.addEventListener('keyup', function(e){
        params.filmSpeed = Math.max(parseInt(this.value), 1)
    })

    filmColor.addEventListener('change', function(e){
        var rgb = hexToRgb(this.value); 
        params.r = rgb.r
        params.b = rgb.b
        params.g = rgb.g
        function hexToRgb(hex) {
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        }
    })

    lightColor.addEventListener('change', function(e){
        overlay.style.background = this.value
        function hexToRgb(hex) {
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        }
    })

    camera.on('expose', function(data){
        overlay.style.display = 'none'
        render.putImageData(data, 0, 0)    
    })
    exportFrame.addEventListener('click', function(){
        if(!_selected) return
        else{
            window.open(film.toDataURL('image/png'))
        }
    })
    exportGif.addEventListener('click', function(){
        console.log('mak gif')
        var gif = new GIF({
            workers: 2,
            quality:1,
            width:640,
            height:480,
            workerScript: window.location.origin + '/gif.worker.js'
        })
        
        Array.prototype.forEach.call(frames.children, function(e){
            var delay = drrrr[e.children[1].getAttribute('data-frame')] || 667
            console.log(delay)
            gif.addFrame(e.children[1], {delay:delay})
        })
        
        
        gif.on('finished', function(blob) {
          window.open(window.URL.createObjectURL(blob));
        });
        
        gif.render();
        
    });
    
    rexpose.addEventListener('click', function(){
        var blob = render.getImageData(0,0,film.width, film.height);
        params.blob = blob.data
        if(!_selected) blob = undefined

        overlay.style.display = 'block'
        if(!shooting){
            shooting = true
            camera.once('expose', function(data){
                _selected = true
                var canvas = film.cloneNode(true)
                var ctx = canvas.getContext('2d')
                ctx.putImageData(data, 0, 0)

                var f = frameobj(uuid.v4());
                f.addImage(uuid.v4(),canvas.toDataURL(), data);
                frameset.put(f);

                //frames.appendChild(canvas)
                shooting = false

            })
            camera.expose(params);            
        }
    })

    snapShotButton.addEventListener('click', function(){
        if(!shooting){
            shooting = true;
            overlay.style.display = 'block'
            camera.once('expose', function(data){

                _selected = true
                var canvas = film.cloneNode(true)
                var ctx = canvas.getContext('2d')
                ctx.putImageData(data, 0, 0)

                var f = frameobj(uuid.v4());
                f.addImage(uuid.v4(),canvas.toDataURL(), data);
                frameset.put(f);

                //frames.appendChild(canvas)
                shooting = false

            });
            camera.expose(params);            
        }
    });
})



frames.addEventListener('click',function(ev){
    // this classlist Identifier is broken
  var cls = ev.target.getAttribute('class');
  if(cls){

    if(cls.indexOf('delete-frame') > -1){
      ev.preventDefault();
      ev.stopPropagation();
      // find the index
      var framelist = frames.childNodes;
      for(var i=0;i<framelist.length;++i){
        if(framelist[i] === ev.target.parentNode){
          frameset.del(frameset.frames[i].id);
          break;
        }
      }
    } 
  } else {
    ev.preventDefault();
    toggleMonitor(true)
    //// SELECT THE FRAME HERE!!!!
    comp(ev.target)
  }

})


frameset.on('data',function(change){


  if(change.source != 'server') return;
  if(change.type == 'put'){

    var cont = document.createElement('div')
    cont.setAttribute('class','frame-cont')

    // add delete link
    var dellink = document.createElement('a');
    dellink.appendChild(document.createTextNode('[X]'));
    dellink.setAttribute('href','#');
    dellink.setAttribute('class','delete-frame');
    dellink.style.position = 'absolute';
    dellink.style.top = '0px';
    dellink.style.right = '0px';
    //dellink.style.zIndex = '300';

    cont.appendChild(dellink);
    renderFrame(cont,change.frame,160,120);

    cont.setAttribute('data-frame',change.frame.id);

    comp(cont.children[1])
    toggleMonitor(true)
    
    if(change.index >= frames.childNodes.length){
      frames.appendChild(cont);
    } else {
      frames.insertBefore(cont,frames.childNodes[change.index]); 
    }
  } else if(change.type == 'del'){


    for(var i=0;i<frames.childNodes.length;++i){
        var fid = frames.childNodes[i].getAttribute('data-frame');
        if(fid == change.frame.id) {
          frames.removeChild(frames.childNodes[i]);
        }
    }
  }

})


// player.
var playButton = document.getElementById('playFrames');
var playButtonList = document.querySelectorAll('.playButton');


var playHidden = true;
playButton.addEventListener('click',function(){
  if(!frameset.frames.length) return;

console.log('play button!');

 // window.location = window.location.origin + '/play/' + id
  var c = document.createElement('div');
  document.body.appendChild(c);
  c.style.width = '640px';
  c.style.height = '480px';
  c.style.position = 'fixed';
  c.style.backgroundColor = '#fff';
  c.style.top = '0px';
 
  var p = document.createElement('div');

  c.appendChild(p)
  frameset.play().pipe(player(p)).on('end',function(){
    document.body.removeChild(c);
  })

})

// hide show broken on 
frameset.on('data',function(){
  /*
  if(frameset.frames.length && playHidden){
  //  playButtonList[0].style.display = 'block';  
  } else if(!frameset.frames.length){
 //   playButtonList[0].style.display = 'none';  
//    playHidden = true;
  }
  */
})


window.fo = frameset;

// make sure there is an id for this session

var pathname = window.location.pathname;

if(pathname.indexOf('/edit/') == 0) {
  var parts = pathname.split('/');
  // the id is chunk2 after edit
  var id = parts[2] 
}

if(!id) {
  window.location = '/edit/'+uuid.v4();
}

var shareid = id;

var reconnect = require('reconnect/engine.io');
var connected = false;
var buf = [];

reconnect(function(socket){
  connected = true;
  var b = buf;
  buf = [];

  var frameSerializer = require('./client/frame_serializer')();
  var frameUnserializer = require('./client/frame_unserializer')();
  var connected = true;
  var socket = api.socket(id);

  frameSerializer
  .pipe(socket)
  .pipe(frameUnserializer)
  .pipe(frameset.writeStream('server'))
  var handler = function(change){
    if(change.source == 'server') return;
    frameSerializer.write(change);
  }

  frameset.on('data',handler);
  socket.on('end',function(){
    connected = false;
  });

  while(b.length){
    frameSerializer.write(b.shift());
  }

  socket.once('data',function fn(data){
    try{
    data = JSON.parse(data);
    } catch(e) {
      return;
    }
    if(!data.info) return;

    shareid = data.share
    console.log('got info message',data);
  })

}).connect('/editing')


frameset.on('data',function(change){
  if(change.source == 'server') return;
  if(connected) return;
  buf.push(change);
});

