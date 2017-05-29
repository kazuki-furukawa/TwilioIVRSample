var mongoose = require('mongoose');
var url = 'mongodb://ff-project:sOh3Hj7stHjaFjxvj8bwiNXWfLJfK6N3fSUnXqtcOgwbL2U9P9ODL4sIzFnLmoM0TGn28Rd4DVNdcNisjnIjCA==@ff-project.documents.azure.com:10250/?ssl=true';
var db = mongoose.createConnection(url, function(err, res){
if(err){
    console.log('Error connected:' + url + '-' + err);
}else{
    console.log('Success connected:' + url);
}
});

var SessionSchema = new mongoose.Schema({
    sid: String,
    digits: Number,
    Month: Number,
    Date: Number,
    Time:Number
},{collection:'info'});

exports.Session = db.model('Session', SessionSchema);