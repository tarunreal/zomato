var FB = require('fb'),
    http = require('http'),
    path = require('path'),
    request = require('request'),
    Promise = require('bluebird')
    MongoClient = require('mongodb').MongoClient;
var accessToken = '';
var user_id = '';
var uuid = '';
var userLikes = [];
var userEvents = [];
var dataBaseName = 'facebookApp'
var today = new Date();
var eventCount = 0;
var dd = today.getDate();
var mm = today.getMonth() + 1; //January is 0!
var yyyy = today.getFullYear();
var returned = 0;
if (dd < 10)
    dd = '0' + dd;
if (mm < 10)
    mm = '0' + mm;
var date = yyyy + '' + mm + '' + dd;
function executeQuery(query, requestedItem, pageId, collection, callback) {
    FB.api(query, function(res) {
        if (res && res.error) {
          eventCount++;
            if (res.error.code === 'ETIMEDOUT') {
                console.log('request timeout');
            } else {
                // console.log("query" + query);
            }
        } else {
            switch (requestedItem) {
                case 'likes':
                    for (var r of res.data) {
                      if (r.category.indexOf('Restaurant') > -1||r.category.indexOf('Cafe') > -1||r.category.indexOf('Bar') > -1||r.category.indexOf('Movie') > -1||r.category.indexOf('Nightlife') > -1||r.category.indexOf('Musician') > -1) {
                            if (r) {
                                r._id = r.id;
                                delete r.id;
                                r.nDate = date;
                                r.pagePicture = r.picture.data.url;
                                delete r.picture;
                                userLikes.push(r._id);
                                collection.save(r);
                            }
                        }
                        returned++;
                    }
                    if(res.data.length==0){
                      callback(false)
                    }
                    break;
                case 'pageDetails':
                    var obj = {
                        _id: res.id,
                        nDate: date,
                        userId: res.id,
                        uuid : uuid,
                        likes: res.likes,
                        about: res.about,
                        name: res.name,
                        phone: res.phone,
                        picture: res.picture.data.url,
                        cover: res.cover?res.cover.source:null
                    }
                    collection.save(obj);
                    break;
                case 'events':
                    for (var r of res.data) {
                      var start_time = new Date(r.start_time);
                      var dateToday = new Date(yyyy,today.getMonth(),dd);
                          if (r && start_time.getTime() >= dateToday.getTime()) {
                              userEvents.push({_id:r.id,start_time:r.start_time});
                            r._id = r.id;
                            r.nDate = date;
                            r.pagePicture = pageId;
                            if(r.place){
                              r.place = r.place.name
                              if(r.place.location){
                                if(r.place.location.street){
                                  r.place+=', '+r.place.location.street;
                                }
                                if(r.place.location.city){
                                    r.place+=', '+r.place.location.city;
                                  }
                                    if(r.place.location.country){
                                      r.place+=', '+r.place.location.country;
                                    }
                                      if(r.place.location.zip){
                                        r.place+=', '+r.place.location.zip;
                                      }
                                if(r.place.location.latitude){
                                  r.latLong = r.place.location.latitude + ':' + r.place.location.longitude;
                                }else {
                                  r.latLong = 0;
                                }
                              }
                            }
                            delete r.id;
                            r.pageId = query.slice(0, query.indexOf('/'));
                            if (r.cover)
                                r.cover = r.cover.source;
                            console.log(r);
                            collection.save(r);
                        }else{
                          eventCount++;
                          callback(undefined);
                        }
                    }
                    break;
                case 'eventUsers':
                    for (var r of res.data) {
                        if (r) {
                            var eventId = query.slice(0, query.indexOf('/'));
                            switch (r.rsvp_status) {
                                case 'declined':
                                    r.rsvp_status = 0;
                                    break;
                                case 'unsure':
                                    r.rsvp_status = 1;
                                    break;
                                case 'attending':
                                    r.rsvp_status = 2;
                                    break;
                                default:
                                    break;
                            }
                            r._id = pageId + '_' + eventId + '_' + r.id;
                            r.nDate = date;
                            r.eventId = eventId;
                            r.pageId = pageId;
                            r.uuid = uuid;
                            r.userId = r.id;
                            delete r.id;
                            collection.save(r)
                        }
                    }
                    break;
                case 'posts':
                    var obj = res.data;
                    for( r of obj ){
                      r._id = r.id;
                      r.pageId = pageId;
                      r.likes_count = r.likes.summary.total_count;
                      r.comments_count = r.comments.summary.total_count;
                      r.uuid = uuid;
                      delete r.id;
                      delete r.likes;
                      delete r.comments;
                      collection.save(r);
                    }
                    if (callback) {
                        if (res.paging && res.paging.next)
                            callback(res.paging.next);
                    }
                    break;
                default:
                    console.log('Requested Item error');
            }
            if (callback) {
                if (res.paging && res.paging.cursors && res.paging.cursors.after)
                    callback(res.paging.cursors.after);
            }
        }
    });
}
function savePageDetails(query, dbName) {
  return new Promise(function(resolve, reject){
    MongoClient.connect('mongodb://161.202.191.134:27017/' + dataBaseName, function(err, db) {
        var collection = db.collection(dbName);
        var likesCollection = db.collection('likes');
        likesCollection.find({}).toArray(function(err, docs) {
            for (var r of docs) {
                var id = r.pageId;
                executeQuery('/' + id + query, 'pageDetails', '', collection,'')
            }
        });
    });
});
}
exports.saveLikes = function(query, dbName,access_token,id,uuid_string,callback) {
  accessToken=access_token;
  user_id = id;
  uuid = uuid_string;
  var counter = 0;
  userLikes=[];
  FB.setAccessToken(accessToken);
  console.log('running');
    MongoClient.connect('mongodb://161.202.191.134:27017/' + dataBaseName, function(err, db) {
        var collection = db.collection(dbName);
        var userCollection = db.collection('appUsers');
        userCollection.find({_id :user_id}).toArray(function(err, docs) {
          if(docs.likes)
           userLikes=docs[0].likes;
        })
        console.log('likes running');
        getLikes(query, collection,function(res){
          if(res){
            console.log(res);
              console.log('_____________________likes saved');
              userCollection.update({ _id : user_id} , { $set: {likes : userLikes } });
              if(callback)
              callback(true);
              }
        });
    });
}
// function savePagePicture(dbName) {
//   return new Promise(function(resolve, reject) {
//     MongoClient.connect('mongodb://127.0.0.1:27017/' + dataBaseName, function(err, db) {
//         var collection = db.collection(dbName);
//         collection.find({}).toArray(function(err, items) {
//           for( var u of items){
// testSave(u.pageId,u,collection)
//           }
//     });
//     });
// });
// }
// function testSave(id,u,collection){
//   FB.api(id+'?fields=picture', function(res) {
//     if (res && res.error) {
//         if (res.error.code === 'ETIMEDOUT') {
//             console.log('request timeout');
//         } else {
//             // console.log("query" + query);
//         }
//     } else {
//       console.log(id);
//             if(res.picture.data.url)
//             {
//               u.pagePicture=res.picture.data.url
//             }else {
//               u.pagePicture=0;
//             }
//             collection.save(u);
//     }
//   });
// }
function getLikes(query, collection,callback) {
    executeQuery(query, 'likes', '', collection, function(res) {
        if (res) {
            if (query.indexOf('&after=') > -1) {
                query = query.slice(0, query.indexOf('&after='))
            }
            getLikes(query + '&after=' + res, collection, function(res){
              if(res){
                if(callback)
                callback(true);
              }
            })
        } else {
          console.log('returned 0');
          if(callback)
            callback(true);
        }
    });
}
exports.saveEvents = function(query, dbName,access_token,id,uuid_string,callback) {
  accessToken=access_token;
  user_id = id;
  uuid = uuid_string;
  var counter = 0;
  eventCount = 0
  userEvents = [];
  FB.setAccessToken(accessToken);
    MongoClient.connect('mongodb://161.202.191.134:27017/' + dataBaseName, function(err, db) {
        var collection = db.collection(dbName);
        var userCollection = db.collection('appUsers');
        var likesCollection =db.collection('likes')
        userCollection.find({_id :user_id}).toArray(function(err, docs) {
          console.log('Saving Events');
          var likesArray=[];
          if(docs[0].events){
            userEvents=docs[0].events
          }
          if(docs[0].likes){
                 likesArray=docs[0].likes;
          }
          var docsLength = likesArray.length;
          console.log(docsLength);
            for (var r of likesArray) {
                recallEvents(r,likesCollection,id,query,collection,docsLength,userCollection,function(){
                  if(eventCount == docsLength&&callback){
                    callback(true);
                  }
                });
              }
        });
});
}
function recallEvents(r,likesCollection,id,query,collection,docsLength,userCollection,callback){
  likesCollection.find({_id :r}).toArray(function(err, item) {
    var id = r;
    console.log(r);
  getEvents(query, id,item[0].pagePicture, collection,function(res){
      if(eventCount == docsLength&&res&&callback){
        callback(true);
        userCollection.update({ _id : user_id} , { $set: {events : userEvents } });
      }
    });
  })
}
function getEvents(query, id,pagePicture, collection, callback) {
    executeQuery(id + query, 'events', pagePicture, collection, function(res) {
        if (res) {
            if (query.indexOf('&after=') > -1) {
                query = query.slice(0, query.indexOf('&after='))
            }
            getEvents(query + '&after=' + res, id, collection,function(res){
              if(res){
                if(callback)
                 callback(true);
              }
            });
        } else {
          if(callback)
            callback(true);
        }
    });
}
function saveEventUsers(query, dbName) {
  return new Promise(function(resolve, reject){
    MongoClient.connect('mongodb://127.0.0.1:27017/' + dataBaseName, function(err, db) {
        var collection = db.collection(dbName);
        var eventCollection = db.collection('events');
        eventCollection.find({}).toArray(function(err, docs) {
            for (var r of docs) {
                var id = r.eventId;
                getEventUsers(query, id, r.pageId, collection);
            }
        });
    });
});
}

function getEventUsers(query, id, pageId, collection) {
    executeQuery(id + query, 'eventUsers', pageId, collection,'', function(res) {
        if (res) {
            if (query.indexOf('&after=') > -1) {
                query = query.slice(0, query.indexOf('&after='))
            }
            getEventUsers(query + '&after=' + res, collection);
        } else {
            return;
        }
    });
}
function savePosts(query, dbName) {
  return new Promise( function(resolve, reject){
    MongoClient.connect('mongodb://127.0.0.1:27017/' + dataBaseName, function(err, db) {
        var collection = db.collection(dbName);
        var likesCollection = db.collection('likes');
        likesCollection.find({}).toArray(function(err, docs) {
            for (var r of docs) {
                var id = r.pageId;
                executeQuery(id + query, 'posts', id, collection,'', function(res) {
                    if (res)
                        getPosts(res, id, collection);
                });
            }
        });
    });
});
}
function getPosts(url, pageId, collection) {
    request({
        url: url,
        json: true
    }, function(error, response, body) {
        if (!error && response.statusCode === 200) {
          var obj = body.data;
          for( r of obj ){
            r._id = r.id + '_' + date;
            r.pageId = pageId;
            r.likes_count = r.likes.summary.total_count;
            r.comments_count = r.comments.summary.total_count;
            delete r.id;
            delete r.likes;
            delete r.comments;
            collection.save(r);
          }
          if(body.paging&&body.paging.next)
          getPosts(body.paging.next,pageId,collection);
          else
          return;
        }
    });
}
function mergeUsersCollections(collections, dbName) {
  return new Promise(function(resolve, reject){
    MongoClient.connect('mongodb://127.0.0.1:27017/'  + dataBaseName, function(err, db) {
        var eventUsers = db.collection(dbName);
        for (var r of collections) {
            var collection = db.collection(r);
            collection.find({}).toArray(function(err, docs) {
                for (var u of docs) {
                    eventUsers.save(u);
                }
            });
        }
    });
  });
}
exports.saveData = function(access_token,command,id,uuid_string,callback){
  accessToken=access_token;
  user_id = id;
  uuid = uuid_string;
  FB.setAccessToken(accessToken);
  console.log(command);
  console.log('running');
  switch(command){
    case 'saveLikes':
    saveLikes('me/likes?pretty=0&fields=new_like_count%2Ccategory%2Cname%2Cpicture&limit=100','likes');
    return callback(true);
    break;
    case 'saveEvents':
    saveEvents('/events?pretty=0&fields=description%2Cplace%2Cname%2Cattending_count%2Cinterested_count%2Cdeclined_count%2Cstart_time%2Ccover&limit=1000','events');
    break;
  }
  // savePagePicture('rEvents')
  // savePosts('/posts?fields=id%2Ccreated_time%2Cdescription%2Cstory%2Cname%2Cpicture%2Clikes.limit(0).summary(true)%2Ccomments.limit(0).summary(true)%2Cmessage_tags%2Cstory_tags%2Cstatus_type&limit=100','posts');
  // mergeUsersCollections(['interested','declined','attending'],'eventMembers');
  // savePageDetails('?fields=picture,likes,new_like_count,about,name,contact_address,phone,cover','pageDetails')
  // saveEvents('/events?pretty=0&fields=description%2Cplace%2Cname%2Cattending_count%2Cinterested_count%2Cdeclined_count%2Cstart_time%2Ccover&limit=1000','restEventsTest');
  // saveEventUsers('/declined?pretty=0&limit=1000','declined');
  // saveEventUsers('/attending?pretty=0&limit=1000','attending');
  // saveEventUsers('/interested?pretty=0&limit=1000','interested');
  // saveLikes('me/likes?pretty=0&fields=new_like_count%2Ccategory%2Cname&limit=100','al')
}
function uniq_fast(a) {
    var seen = {};
    var out = [];
    var len = a.length;
    var j = 0;
    for(var i = 0; i < len; i++) {
         var item = a[i];
         if(seen[item] !== 1) {
               seen[item] = 1;
               out[j++] = item;
         }
    }
    return out;
}
