var api = require('./api')
var uuid = require('uuid')
// when the title box is filled create an id and associate the text with it then redirect to the edit view.

module.exports = function(){
  var code = document.getElementById('code')
  var button = document.getElementById('enter')

  var submitted = false;
  button.addEventListener('click', function(e){
    e.preventDefault();

    if(submitted) return;
    submitted = true;
    var id = uuid.v4();

    if(code.value) {
      window.location = '/edit/'+(code.value+'').replace(/ /,'_');
    } else {
      api.saveTitle(id,code.value,function(err,data){
        console.log('')
        window.location = '/edit/'+id

      })
    }
  })
}

