
var level = require('level')
var sublevel = require('level-sublevel')
var db = sublevel(level(__dirname+'/../db/',{keyEncoding:'json',valueEncoding:'json'}));

console.log(db.sublevel);

module.exports = function(){
  return db;
}


/*
sublevel framesets

i need to query new frames by time 
  - frame feed

i need to query frames sorted by position in frameset by frameset id
  - playback

i need to query published framesets
  - catalog


  
*/



