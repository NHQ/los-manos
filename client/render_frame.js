var undef;


module.exports = function(container,frame,width,height,renderers){
  // i just assume we will need width and height they are not used yet.
  renderers = renderers||{};

  // manage state in renderers object if provided.
  if(!renderers.text && frame.text){
    renderers.text = document.createElement('div');
    container.appendChild(renderers.text);

    // there is only one text at a time. it is always 200 high.
    renderers.text.style.position = 'absolute';
    renderers.text.style.bottom = '0px';
    renderers.text.style.left = '0px';
    renderers.text.zIndex = 200;

  }

  if(renderers.zToggle === undef) renderers.zToggle = 0;  
  if(!renderers.images) renderers.images = {};

console.log('renderers: ',renderers);

  // render text
  if(frame.text){
    if(renderers.text.firstChild) renderers.text.removeChild(renderers.text.firstChild)
    renderers.text.appendChild(document.createTextNode(frame.text));
  }

  // render images
  if(frame.images) {
    // write frames under/over
    var zToggle = renderers.zToggle = renderers.zToggle === 0?100:0;

    var ids = {};
    var updated = {}; 

    for(var i=0;i<frame.images.length;++i){
      var image = frame.images[i];
      ids[image.id] = 1;
      if(renderers.images[image.id]) {
        // re use existing image
        var rendered = renderers.images[image.id];
        rendered.obj.style.zIndex = i+1+zToggle;
        delete renderers.images[image.id]
        updated[image.id] = rendered;
      } else {

        var idata


        var img = new Image();
        img.src = image.uri;
        img.imgData = image.imgData;
        img.style.zIndex = i+1+zToggle;
        image.obj = img;

        updated[image.id] = image;
        container.appendChild(img);
      }
      
      img.setAttribute('data-frame',frame.id);

    }

    var inframe = Object.keys(renderers.images);
    for(var i=0;i<inframe.length;++i){

      console.log('remove img: ',inframe[i],renderers.images[inframe[i]]);

      container.removeChild(renderers.images[inframe[i]].obj);
    }

    renderers.images = updated;
  }

  if(frame.audio) {
    // make the audio element or audioContext
    // because this may be just display dont play it
    // set the audio in the renderers object so the user can play it. 
  }


  return  container;
}




