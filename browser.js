var prefix = require('./prefix.js')().css
var Film = require('film');
var show = require('uxer-show');

//composition page
var showCap = document.getElementById('newFrame')
var frames = document.getElementById('frames')
var prev = document.getElementById('prev')
var next = document.getElementById('next')
window.stage = frames; // uhg


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
        frames.appendChild(canvas)
    })
    camera.snapShot();
})




