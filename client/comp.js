var videoEl = document.getElementById('source')
var film = document.getElementById('film')

module.exports = function(el){
    videoEl.style.display = 'none'
    var render = film.getContext('2d')
    render.putImageData(el.imgData, 0, 0)
}