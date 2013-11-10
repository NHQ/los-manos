var buffers = require('jbuffers')
var jsynth = require('jsynth')
var amod = require('amod')

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
        var buf2 = buffers(6)
//        var audioProcessor = master.createScriptProcessor(4096, 2, 2)
        
        var audioProcessor = jsynth(master, dsp)
        
        function dsp(t,x,i){
            return i //Math.sin(t * Math.PI * 2 * 220)
        }
        
        source.connect(audioProcessor)
        audioProcessor.connect(master.destination)

        om.emit('recording')
        om.on('stop', function(){
//            source.disconnect()
            console.log(buf, buf2)
 //           audioProcessor.onaudioprocess = function(e){}()
  //          om.emit('data', buf)
        })
    }
    
    function play(buf){
        var src = master.createBufferSource()
        console.log(buf.toBuffer())
        var buffer = master.createBuffer(buf.toBuffer().buffer, true);
        src.buffer = buffer
        
        src.connect(master.destination);
        src.start(0);
        om.emit('playing')
    }
}