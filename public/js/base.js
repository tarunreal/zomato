﻿var eventToUse = 'tap';
var appUrl = 'http://192.168.8.233:25000/';

function makeTemplates() {
    var templateName = '';

    $('script[type="text/x-jquery-tmpl"]').each(function (index, item) {
        templateName = $(item).attr("id");
        $.template(templateName.replace("Template", ""), $(item).html());
    });
}

 function render(element,template,data){
    $(element).html('');
    $.tmpl(template, data).appendTo(element);
 }

function bind(element, func, eventName) {
  if (eventName)
    $(element).unbind().bind(eventName, func);
  else
    $(element).unbind().bind(eventToUse, func);
}

function slideIn(element, func) {
    $(element).show().transition({ x: w * -1 }, func);
}

function slideOut(element, func) {
    $(element).show().transition({ x: w * 1 }, func);
}

function swapIn(elementFrom, elementTo, func) {
    $(elementTo).show().transition({ x: w * -1 }, function () {
        $(elementFrom).transition({ x: w * 1 },10, function () {
            $(this).hide();
        });

        func();
    });
}
function createMap(d) {
  if (d.displayMap == undefined) {
    var jj;

    if (d.data==undefined)
        jj = d;
    else {
        jj = d.data[0];
    }

    var map = [];
    for (var propt in jj) {
      map.push({
        key: propt,
        w: 20,
        align: 'left'
      });
    }
  } else {
    map = d.displayMap;
  }

  return map;
}
function swapOut(elementFrom, elementTo, func) {
    $(elementTo).show().transition({ x: w *-1 },10, function () {

        $(elementFrom).transition({ x: w * 1 }, function () {
            $(this).hide();
        });

        func();
    });
}

function hideKeyboard() {
    document.activeElement.blur();
    $("input").blur();

    //if (isiOS) {
    //    document.activeElement.blur();
    //    $("input").blur();
    //} else {
    try {
        Android.HideKeyboard();
    } catch (e) {

    }
}

function logResult(d) {
    console.log(d);
}
function preloadImages(arr) {
    var newimages = [], loadedimages = 0
    var postaction = function () { }
    var arr = (typeof arr != "object") ? [arr] : arr
    function imageloadpost() {
        loadedimages++
        if (loadedimages == arr.length) {
            postaction(newimages) //call postaction and pass in newimages array as parameter
        }
    }
    for (var i = 0; i < arr.length; i++) {
        newimages[i] = new Image()
        newimages[i].src = '../dishes/' + arr[i] + '.jpg';
        newimages[i].onload = function () {
            imageloadpost()
        }
        newimages[i].onerror = function () {
            imageloadpost()
        }
    }
    return { //return blank object with done() method
        done: function (f) {
            postaction = f || postaction //remember user defined callback functions to be called when images load
        }
    }
}

function execute(command ,request_path , requestData, success, fail, timeout) {
    fail = ((fail == undefined) ? function () {
        //handle error
    } : fail);

    //$.ajax({
    //    type: "POST",
    //    url: appUrl + command,
    //    data: requestData,
    //    dataType: "json",

    //    timeout: timeout == undefined ? 10000 : timeout, // in milliseconds
    //    success: success,
    //    error: fail
    //});

    $.ajax({
        type: request_path,
        url: appUrl + command,
        data: JSON.stringify(requestData),
        dataType: "json",
        contentType:"application/json; charset=utf-8",
        timeout: timeout == undefined ? 10000 : timeout, // in milliseconds
        success: success,
        error: fail
    });
}
function isEmpty(parameter) {
  for(var key in parameter) {
    if(parameter.hasOwnProperty(key)){
      return false;
    }
  }
  return true;
}
