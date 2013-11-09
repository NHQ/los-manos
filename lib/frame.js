


module.exports = function(id){
  var o = {
    id:id,
    images:false,
    text:false,
    addImage:function(id,uri,imgData){
      if(!this.images) this.images = [];
      this.images.push({id:id,uri:uri,imgData:imgData})
    }
  }

  return o;
}

