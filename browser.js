var prefix = require('./prefix.js')().css
var Film = require('film');
var uuid = require('uuid');

var framesets = require('./lib/frameset')
var frameobj = require('./lib/frame');
var renderFrame = require('./client/render_frame')

// the current frameset
var frameset = framesets();//(rate) defaults to 5 fps

//composition page
var showCap = document.getElementById('newFrame')
var frames = document.getElementById('frameset')

// capture page
var captureInterface = document.getElementById('capture')
var closeCap = document.getElementById('closeSourceCap')
var source = document.getElementById('source')
var snapShotButton = document.getElementById('snapShot')
var videoEl = document.getElementById('source')
var film = document.getElementById('film')
var mirror = document.getElementById('mirror')
var render = film.getContext('2d');

var h = window.innerHeight
var camera = Film(videoEl, mirror)

showCap.addEventListener('click', function(){   
    captureInterface.style[prefix+'transform'] = 'translateY('+ h +'px)';
    captureInterface.style['transform'] = 'translateY('+ h +'px)';
    source.style.display = 'block'
})

closeCap.addEventListener('click', function(){
    captureInterface.style[prefix+'transform'] = 'translateY('+ (0 - h) +'px)';
    captureInterface.style['transform'] = 'translateY('+ (0 - h) +'px)';
    source.style.display = 'none'
})

snapShotButton.addEventListener('click', function(){
    camera.once('snapshot', function(data){
        render.putImageData(data, 0, 0)


    
        var canvas = film.cloneNode(true)
        var ctx = canvas.getContext('2d')
        ctx.putImageData(data, 0, 0)

        var f = frameobj(uuid.v4());
        f.addImage(uuid.v4(),canvas.toDataURL());
        frameset.put(f);

        //frames.appendChild(canvas)

        
    })
    camera.snapShot();
})

frameset.on('data',function(change){
  console.log('frameset change ',change);

  //
  if(change.type == 'put'){
    var span = document.createElement('div')
    span.style.width = '160px';
    span.style.height = '120px';
    span.style.float = 'left';
    span.style.position = 'relative';// become offset parent.

    renderFrame(span,change.frame,160,120);
    if(change.index == frames.length){
      frames.appendChild(span);
    } else {
      frames.insertBefore(span,frames.childNodes[change.index+1]); 
    }
  } else if(change.type == 'del'){
    frames.removeChild(frames.childNodes[change.index]);
  }

})


