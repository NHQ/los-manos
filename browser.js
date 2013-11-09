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
//var playButton = document.getElementById('playFrames');
//var playButtonList = document.querySelectorAll('playButton');

// capture page
var snapShotButton = document.getElementById('snapShot')
var videoEl = document.getElementById('source')
var film = document.getElementById('film')
var mirror = document.getElementById('mirror')
var shutterSpeed = document.getElementById('shutterSpeed')
var render = film.getContext('2d');
var knobs = document.querySelectorAll('.uxer-flatdial')

var params = {
    shutterSpeed: 100,
    filmSpeed: 2,
    r: 0,
    g: 0,
    b: 0
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

shutterSpeed.addEventListener('change', function(e){
    params.shutterSpeed = parseFloat(this.value)
    console.log(params)
})


setInterval(function(){
    camera.expose(params)
}, 500)

camera.on('expose', function(data){
    render.putImageData(data, 0, 0)    
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

/*
playButton.addEventListener(function(){
  var playEl = document.getElementById('player');
  playEl.style.display = 'block';
  player(playEl).on('end',function(){
    playEl.style.display = 'none';
  })
})
*/

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


