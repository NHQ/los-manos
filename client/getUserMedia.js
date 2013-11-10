var emitter = require('events').EventEmitter

navigator.getUserMedia = (navigator.getUserMedia || 
                        navigator.webkitGetUserMedia ||
                        navigator.mozGetUserMedia ||
                        navigator.msGetUserMedia);

module.exports = function(opts){
    
    var om = new emitter()
    
    navigator.getUserMedia(opts, function(stream){
        if(opts.video) om.emit('video', stream)
        if(opts.audio) om.emit('audio', stream)
    }, function(err){
        alert('no webcam or no getUserMedia support detected.  Try Using Chome')
    })
    
    return om
}
