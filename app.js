var portNumber = 12000;
var express = require('express'),
    bodyParser = require('body-parser'),
    dateFormat = require('dateformat');
    http = require('http'),
    path = require('path'),
    request = require("request"),
    url = require('url'),
    api = require('./routes/api')
    MongoClient = require('mongodb').MongoClient,
    uuid = require('uuid'),
    Step = require('step'),
    app = express(),
    server = app.listen(portNumber),
    io = require('socket.io').listen(server, function() {
        console.log('server listening at ' + portNumber);
    });
uuid.v4({
  random: [
    0x10, 0x91, 0x56, 0xbe, 0xc4, 0xfb, 0xc1, 0xea,
    0x71, 0xb4, 0xef, 0xe1, 0x67, 0x1c, 0x58, 0x36
  ]
});
app.use(bodyParser.json());
app.use(express.static('public'));
app.get( '/',  function(req,res){
  res.sendFile(__dirname + "/public/views/index.html")
});
app.post('/saveEvents',function(req,res){
  var r=req.body;
  api.saveData(r.values.accessToken,'saveEvents',r.values._id);
  res.json({status : '1'});
  })
  app.post('/sensSMS',function(req,res){
    var r=req.body;
    url ='http://www.myvaluefirst.com/smpp/sendsms?username=realboxtrans&password=realbox123&to='+r.values.phoneNumber+'&from=REALBX&text='+r.values.text;
    request.post(
        url,
          function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(body)
            }
        }
    );
    res.json({status : '1'});
    })
// app.post('/saveUser',function(req,res){
//   var r=req.body;
//   MongoClient.connect('mongodb://127.0.0.1:27017/facebookApp', function(err, db) {
//       var collection = db.collection('appUsers');
//       collection.find(r.query).toArray(function(err, item) {
//           if(item.length != 0){
//             console.log("Already a member");
//             res.json({status : '1'});
//          }else{
//            var buffer = new Array(32); // (or 'new Buffer' in node.js)
//            uuid.v4(null, buffer, 0);
//            uuid.v4(null, buffer, 16);
//            var uuid_string = uuid.unparse(buffer);
//             obj ={
//               _id : r.query._id,
//               name : r.values.name,
//               picture : r.values.picture,
//               uuid : uuid_string,
//               isActive : 1
//             }
//             collection.save(obj);
//             Step(
//               function saveLikes(){
//             api.saveLikes('me/likes?pretty=0&fields=new_like_count%2Ccategory%2Cname%2Cpicture&limit=100','likes',r.values.accessToken,r.query._id,uuid_string,this);
//           } ,
//            function saveEvents(err ,result){
//              api.saveEvents('/events?pretty=0&fields=description%2Cplace%2Cname%2Cattending_count%2Cinterested_count%2Cdeclined_count%2Cstart_time%2Ccover&limit=1000','events',r.values.accessToken,r.query._id,uuid_string);
//            }
//          );
//             // api.saveData(r.values.accessToken,'saveLikes',r.query._id,uuid_string);
//             res.json({status : '0'})
//             console.log("New User Added + Saving Likes");
//           }
//   });
// })
// })
io.on('connection', function(socket){

});
app.post('/authenticateUser', function(req,res){
  var r=req.body;
  MongoClient.connect('mongodb://161.202.191.134:27017/facebookApp', function(err, db) {
      var collection = db.collection('appUsers');
      console.log(r.query);
      collection.find(r.query).toArray(function(err, item) {
        if(item&&item.length == 0){
          console.log("Not a user of app,Saving Details");
          // saveUser(r,collection);
          //New User Saving Details
          var buffer = new Array(32); // (or 'new Buffer' in node.js)
          uuid.v4(null, buffer, 0);
          uuid.v4(null, buffer, 16);
          var uuid_string = uuid.unparse(buffer);
           obj ={
             _id : r.query._id,
             name : r.values.name,
             picture : r.values.picture,
             uuid : uuid_string,
             isActive : 1
           }
           collection.save(obj);
           res.json({'status' : '0','authenticationCode' : uuid_string});
           Step(
             function saveLikes(){
           api.saveLikes('me/likes?pretty=0&fields=new_like_count%2Ccategory%2Cname%2Cpicture&limit=100','likes',r.values.accessToken,r.query._id,uuid_string,this);
         } ,
          function saveEvents(err ,result){
            api.saveEvents('/events?pretty=0&fields=description%2Cplace%2Cname%2Cattending_count%2Cinterested_count%2Cdeclined_count%2Cstart_time%2Ccover&limit=50','events',r.values.accessToken,r.query._id,uuid_string,this);
          } ,
          function sendResponse(err,result){
             console.log("Now you can run Dear");
               io.emit('event',{status:1});
          }
        );
        //new User
       }else if(item&&item.length != 0){
         console.log("User Active : "+ r.query._id);
         collection.update({ _id : r.query._id} , { $set: {isActive : 1 } });
         res.json({'status' : '1','authenticationCode' : item[0].uuid});
         console.log(item);
       } else {
         res.json({status : '-1'});
         console.log("Empty request");
       }
      })
  })
})
app.post('/checkSaveStatus', function(req,res){
  var r=req.body;
  MongoClient.connect('mongodb://161.202.191.134:27017/facebookApp', function(err, db) {
      var collection = db.collection('appUsers');
      console.log(r.query);
      collection.find(r.query).toArray(function(err, item) {
        console.log(item);
        if(item&&item.length == 0){
            res.json({status : '0'});
        }
        else if(item&&item[0].isSaved==1){
          res.json({status : '1'});
        }else{
          res.json({status : '0'});
        }
      })
    });
})
app.get('/events', function(req, res) {
    res.sendFile(__dirname + "/public/views/events.html")
  });
app.post('/getEvent', function(req, res){
  var r=req.body;
  MongoClient.connect('mongodb://161.202.191.134:27017/facebookApp', function(err, db) {
      var collection = db.collection('events');
      collection.find(r.query).toArray(function(err, item) {
          console.log(item);
          res.json(item[0]);
          db.close();
      });
});
})
app.post('/getEvents', function(req, res){
  var r=req.body;
  var events=[];
  var query={};
  MongoClient.connect('mongodb://161.202.191.134:27017/facebookApp', function(err, db) {
    var collection = db.collection('events');
    collection.find(r.query).skip(r.skipItems).limit(16).toArray(function(err, item) {
        console.log(item);
        res.json(item[0]);
        db.close();
    });
});
});
// function saveUser(r,collection,res){
//
// }
// app.listen(portNumber, function() {
//     console.log('server listening at ' + portNumber);
// });
