var prefix = require('./prefix.js')().css
var Film = require('film');
var spin = require('uxer/spin');

var uuid = require('uuid');
var framesets = require('./lib/frameset')
var frameobj = require('./lib/frame');
var renderFrame = require('./client/render_frame')

// the current frameset
var frameset = framesets();//(rate) defaults to 5 fps

//composition page
var frames = document.getElementById('frameset')

// capture page
var snapShotButton = document.getElementById('snapShot')
var videoEl = document.getElementById('source')
var film = document.getElementById('film')
var mirror = document.getElementById('mirror')
var shutterSpeed = document.getElementById('shutterSpeed')
var filmSpeed = document.getElementById('filmSpeed')
var filmColor = document.getElementById('filmColor')
var lightColor = document.getElementById('lightColor')
var overlay = document.getElementById('superOverlay')
var invert = document.getElementById('invert')

var render = film.getContext('2d');
var knobs = document.querySelectorAll('.uxer-flatdial')

var params = {
    shutterSpeed: 200,
    filmSpeed: 2,
    r: 33,
    g: 33,
    b: 33,
    invert: false
}

Array.prototype.forEach.call(knobs, function(node){
    spin(node);
    node.spinDegree = 0;
    node.addEventListener('spin', function(e){
        console.log(e)
    	this.spinDegree += e.detail.delta;

        this.style[prefix + 'transform'] = 'rotateZ('+(e.detail.degree)+'deg)'
    });
})

var h = window.innerHeight
var camera = Film(videoEl, mirror, film)

invert.addEventListener('change', function(e){
    params.invert = this.checked
})

shutterSpeed.addEventListener('keyup', function(e){
    params.shutterSpeed = Math.max(this.value, 1000/24)
})

filmSpeed.addEventListener('keyup', function(e){
    params.filmSpeed = Math.max(this.value, 1)
})

filmColor.addEventListener('change', function(e){
    var rgb = hexToRgb(this.value); console.log(rgb, this.value)
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

snapShotButton.addEventListener('click', function(){
    overlay.style.display = 'block'
    camera.once('expose', function(data){
        render.putImageData(data, 0, 0)


    
        var canvas = film.cloneNode(true)
        var ctx = canvas.getContext('2d')
        ctx.putImageData(data, 0, 0)

        var f = frameobj(uuid.v4());
        f.addImage(uuid.v4(),canvas.toDataURL());
        frameset.put(f);

        //frames.appendChild(canvas)

        
    })
    camera.expose(params);
})


frames.addEventListener('click',function(ev){

  var cls = ev.target.getAttribute('class');
  if(cls){

    if(cls.indexOf('delete-frame') > -1){
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
    } else if(cls.indexOf('frame-cont') > -1){
      ev.preventDefault();
      //// SELECT THE FRAME HERE!!!!
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
    cont.setAttribute('class','frame-cont')

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


