
module.exports = function(o1,o2){

  var keys = Object.keys(o2);
  for(var i=0;i<keys.length;++i) {
    o1[keys[i]] = o2[keys[i]];
  }
  return o1;
}

