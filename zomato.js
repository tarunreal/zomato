var portNumber = 25000;
var serverName = '192.168.8.201/';
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var request = require('request');
var url = require('url');
var user_key = "b7b54ece20fead34c8c9156027a1cfb2";
var host = "https://developers.zomato.com/api/v2.1";
var accessToken = 'EAAOO48QpaWEBAD03lwkfdFPHFD7cuiiZAE6ZAIz6Lnv2QUAYFrqOZAtPqZARVgGlzph1vM4pSpI8u5XSiN7iOwjZAY6DrD1y7qJZCZBLZB8ZCEFZBFd1ma1WKC2XK0vS9cF2Yguan50qx8xTJjo92NDgJSO2SkYMGPtPcZD';
var decodeNumbers = {
  'A' : '0',
  'B' : '1',
  'C' : '2',
  'D' : '3',
  'E' : '4',
  'F' : '5',
  'G' : '6',
  'H' : '7',
  'I' : '8',
  'J' : '9'
}
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.get('/home', function(req, res) {
    res.sendFile(__dirname + "/public/views/index.html")
});
app.get('/:id/website', function(req, res) {
  res.sendFile(__dirname + "/public/views/website.html")
});
app.post('/:id/website',function(req, res){
  var id = req.params.id
  console.log(id)
  decodeUrl(id,function(r){
    if(r[0]!='0'&&r[1]!='0'){
      getFbPageDetails(r[0],function(r1){
        var data = {}
        data.fb = r1
        getZomatoPageDetails(r[1],function(r2){
        data.zomato = r2
        console.log("+++++++++++++++++++++");
        console.log(data);
        res.json(data)
        })
      })
    }else if(r[0]!='0'&&r[1]=='0'){
      getFbPageDetails(r[0],function(r){
        res.json({fb:r})
      })
    } else if(r[0]=='0'&&r[1]!='0'){
      getZomatoPageDetails(r[1],function(r){
      //r
      })
    }else{
      //invalid
    }
  })
})
app.post('/searchZomato', function(req, response, next) {
    var r = req.body;
    var url = host + '/search';
    var query = r.query.name;
    var search = '?q=' + query + '&count=30';
    var options = {
        url: url + search,
        headers: {
            'user-key': user_key,
            'content-type': 'application/json'
        }
    };
    request(options, function(req, res, error) {
      if(res){
        r = JSON.parse(res.body);
      }else{
        r = {'error':error}
      }
        var data = []
        for( var i=0; i< r.restaurants.length;i++){
        var obj = {
          id:r.restaurants[i].restaurant.id,
          name:r.restaurants[i].restaurant.name,
          location:r.restaurants[i].restaurant.location.address,
          rating:r.restaurants[i].restaurant.user_rating.aggregate_rating
        }
        data.push(obj);
        if(i==r.restaurants.length-1)
        response.json(data)
      }
        console.log(obj);
    });
});
app.post('/getFacebookList', function(req, res) {
    console.log('getRestaurant');
    var r = req.body;
    fetchFacebookData(r.query.name,function(r){
      res.json(r);
      console.log(r);
    });
});
function fetchFacebookData(name,callback){
  var options = {
      url: 'https://graph.facebook.com/search?q='+name+'&type=page&fields=id,name,likes,category,picture,location&access_token='+accessToken
  };
  request(options, function(req, res, error) {
    if(res){
      r = JSON.parse(res.body);
    }else{
      r = {'error':error}
    }
      if(r.data){
      filterPages(r.data,function(r){
          if(callback)
          callback(r)
      });
    }else{
      return []
    }
  });
}
function filterPages(data,callback){
  var objs = [];
  for(var r of data){
      if(r.location&&r.location.country=='India')
        objs.push(r)
      else if(r.location == undefined||r.location.country == undefined){
        objs.push(r)
      }
  }
  objs.sort(function(a,b) {return (a.likes > b.likes) ? 1 : ((b.likes > a.likes) ? -1 : 0);});
  if(callback)
  callback(objs.reverse());
}
function decodeUrl(id,callback){
  var url = id.split('-');
  var fb = convertToId(url[0]);
  var zomato = convertToId(url[1]);
  if(callback&&fb&&zomato)
  callback([fb,zomato])
}
function convertToId(value){
  var id = '';
  for( var i = 0;i<value.length; i++){
    id+=decodeNumbers[value[i]];
  }
  return id;
}
function getFbPageDetails(id,callback){
  var options = {
      url: 'https://graph.facebook.com/'+id+'/?fields=name,id,likes,about,phone,hours,description,albums.limit(2){photos.limit(9).height(300){images}},restaurant_services,cover,picture,events.limit(6){cover,name,start_time,place},posts.limit(6){message,full_picture,description},location&access_token='+accessToken
  };
  request(options, function(req, res, error) {
    var r;
    if(res){
      r = JSON.parse(res.body);
    }else{
      r = {'error':error}
    }
    if(callback)
    callback(r);
  });
}
function getZomatoPageDetails(id,callback){
  getRestaurantDetails(id,'restaurant',function(r){
    var obj = {};
    obj.restaurant = r;
    getRestaurantDetails(id,'reviews',function(r){
      obj.reviews = r;
      if(callback)
      callback(obj)
    })
  })
}
function getRestaurantDetails(id,detailType,callback){
  var url = host + '/' + detailType;
  var search = '?res_id=' + id;
  if(detailType === 'reviews')
  search += '&count=10';
  var options = {
      url: url + search,
      headers: {
          'user-key': user_key,
          'content-type': 'application/json'
      }
  };
  request(options, function(req, res, error) {
    if(res){
      r = JSON.parse(res.body);
    }else{
      r = {'error':error}
    }
      if(callback)
      callback(r)
  });
}
app.listen(portNumber, function() {
    console.log('server listening at ' + portNumber);
});
