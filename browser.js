var prefix = require('./prefix.js')().css
var Film = require('film');

var showCap = document.getElementById('newFrame')
var captureInterface = document.getElementById('capture')
var closeCap = document.getElementById('closeSourceCap')
var h = window.innerHeight

showCap.addEventListener('click', function(){
    captureInterface.style[prefix+'transform'] = 'translateY('+ h +'px)';
    captureInterface.style['transform'] = 'translateY('+ h +'px)';
})

closeCap.addEventListener('click', function(){
    captureInterface.style[prefix+'transform'] = 'translateY('+ (0 - h) +'px)';
    captureInterface.style['transform'] = 'translateY('+ (0 - h) +'px)';
})

var videoEl = document.getElementById('source')
var film = document.getElementById('film')
var mirror = document.getElementById('mirror')

var camera = Film(videoEl, mirror)



