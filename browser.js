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


frames.addEventListener('click',function(ev){

  var cls = ev.target.getAttribute('class');
  if(cls && cls.indexOf('delete-frame') > -1){
    ev.preventDefault();

    console.log('frames click',arguments);
    // find the index
    var framelist = frames.childNodes;
    for(var i=0;i<framelist.length;++i){
      if(framelist[i] === ev.target.parentNode){
        frameset.del(frameset.frames[i].id);
        break;
      }
    }
  }

})

frameset.on('data',function(change){
  console.log('frameset change ',change);

  //
  if(change.type == 'put'){
    var cont = document.createElement('div')
    cont.style.width = '160px';
    cont.style.height = '120px';
    cont.style.float = 'left';
    cont.style.position = 'relative';// become offset parent.

    // add delete link
    var dellink = document.createElement('a');
    dellink.appendChild(document.createTextNode('[X]'));
    dellink.setAttribute('href','#');
    dellink.setAttribute('class','delete-frame');
    dellink.style.position = 'absolute';
    dellink.style.top = '0px';
    dellink.style.right = '0px';
    dellink.style.zIndex = '300';
    cont.appendChild(dellink);

    renderFrame(cont,change.frame,160,120);
    if(change.index == frames.length){
      frames.appendChild(cont);
    } else {
      frames.insertBefore(cont,frames.childNodes[change.index+1]); 
    }
  } else if(change.type == 'del'){
    frames.removeChild(frames.childNodes[change.index]);
  }

})


