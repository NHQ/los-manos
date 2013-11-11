var compOpts = document.getElementById('compOpts')
var videoEl = document.getElementById('source')
var film = document.getElementById('film')
var render = document.getElementById('renderCap')
var dnd = require("drag-and-drop-files")
var layers = document.getElementById('layers')
var fxList = document.getElementById('dropdown')
var frameDurInput = document.getElementById('frameDuration')

var renderFrameList = []
var dragging, draggedOver, dragBar;

module.exports = function(el){
    var r = film.getContext('2d')
    r.putImageData(el.imgData, 0, 0)
    film.imgEl = el;
    frameDurInput.value = drrrr[el.getAttribute('data-frame')] || 1
}
/*
function createDragBar(){
    var li = document.createElement('li')
    var bar = document.createElement('div')
    li.appendChild(bar)
    bar.id="dragBar"
    return li
}
function updateLayers(){
    var frames = render.children;
    layers.innerHTML = ""
    Array.prototype.forEach.call(render.children, function(e, i){
        var clone;
        if(e.imgEl) clone = e.imgEl.cloneNode()
        else if(e.src) {
            clone = new Image()
            clone.src = e.src
        }
        else clone = e.cloneNode(true)
        var li = document.createElement('li')
        li.id = (new Date().getTime() * Math.random()).toString()

        li.classList.add("layerFrame")
        li.appendChild(clone)
        li.listIndex = i
        layers.appendChild(li)
        handleDrag(li)
    })
}

function handleDrag(el){
    el.addEventListener('dragstart', function(evt){
        dragging = this
        console.log('dragstart', this, evt.target)
    })
    el.addEventListener('dragover', function(evt){
        if(this.id == dragging.id) return console.log(this.id, dragging.id)
        else{
            draggedOver = this;
            dragBar = dragBar || createDragBar()
            layers.insertBefore(dragBar, this.nextSibling)
            console.log('dragover', evt.target)   
        }
    })
}

dnd(render, function(files){
   var reader = new FileReader
   if(files[0].type.match('image')){
       console.log(files)
       reader.onload = function(file){
           var img = new Image()
           img.src =  file.target.result;
           img.style.position = 'absolute';
           img.style.left = 0;
           img.style.top =  0;
           render.appendChild(img)
           updateLayers()
       }
       reader.readAsDataURL(files[0])
   }    
})
*/
