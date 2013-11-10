var compOpts = document.getElementById('compOpts')
var videoEl = document.getElementById('source')
var film = document.getElementById('film')

module.exports = function(el){
    videoEl.parentElement.style.display = 'none'
    compOpts.style.display = "block"
    var render = film.getContext('2d')
    render.putImageData(el.imgData, 0, 0)
}