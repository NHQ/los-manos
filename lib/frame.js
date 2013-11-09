
module.exports = function(){
  var o = {
    images:false,
    text:false
    addImage:function(id,uri){
      if(!this.images) this.images = [];
      this.images.push({id:id,uri:uri})
    }
  }

  return o;
}

