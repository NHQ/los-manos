var buffers = require('jbuffers')

var audioCtx = window.AudioContext || window.webkitAudioContext;
var master = new audioCtx();
var emitter = require('events').EventEmitter

module.exports = function(stream){
 
    var source = master.createMediaStreamSource(stream);
    var om = new emitter()

    om.record = record
    om.play = play
    
    return om
 
    function record(){
        var buf = buffers(6)
        var audioProcessor = master.createScriptProcessor(4096, 1, 1)
        
        audioProcessor.onaudioprocess = function(e){
            var input = e.inputBuffer.getChannelData(0);
            console.log(input.length)
            buf.push(input)
        }
        
        source.connect(audioProcessor)
        audioProcessor.connect(master.destination)
        om.emit('recording')
        om.on('stop', function(){
            console.log(buf)
            source.disconnect()
            audioProcessor.onaudioprocess = function(e){}()
            om.emit('data', buf)
        })
    }
    
    function play(buf){
        var src = master.createBufferSource()
        console.log(buf.toBuffer())
        var buffer = master.createBuffer(buf.toBuffer(), true);
        src.buffer = buffer
        src.connect(master.destination);
        src.start(0);
        om.emit('playing')
    }
}