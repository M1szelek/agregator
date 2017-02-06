var express = require('express');
var http = require('http');
var app = express();

var cheerio = require('cheerio');

//var render = "";

var games = [
    'shenzhen-io',
    'undertale'
]

var jadiscoOptions = {
    'host': 'jadisco.pl',
    'port': 80,
    'path': '/'
}

app.get('/', function(req, res){

    // var p1 = new Promise(function(resolve, reject) {
    //   resolve('Success!');
    //   // or
    //   // reject ("Error!");
    // });

    // p1.then(function(value) {
    //   console.log(value); // Success!
    //   res.send(value);
    // }, function(reason) {
    //   console.log(reason); // Error!
    //   res.send(reason);
    // });

    var games = getPagesArray();

    loadPage(games[1]).then(getBestPrice).then(function(render){
        res.send(render);
    });

    
    
    //games.forEach(function(options){
    //    loadPage(options, getBestPrice);
    //})

    //options.res = res;
    //loadPage(options, getBestPrice);

    //res.send(render);

});

app.listen(process.env.PORT || 5000, function(){
    console.log("App started!");
});

var loadPage = function(options){
    return new Promise(function(resolve, reject){
            http.get(options, function(http_res) {
                var data = "";

                http_res.on("data", function (chunk) {
                    data += chunk;
                });

                http_res.on("end", function () {
                    resolve(data);
                });
        }).on('error', function(e) {
            reject("Got error: " + e.message);
        });
    });
    
}

function get(url) {
  // Return a new promise.
  return new Promise(function(resolve, reject) {
    // Do the usual XHR stuff
    var req = new XMLHttpRequest();
    req.open('GET', url);

    req.onload = function() {
      // This is called even on 404 etc
      // so check the status
      if (req.status == 200) {
        // Resolve the promise with the response text
        resolve(req.response);
      }
      else {
        // Otherwise reject with the status text
        // which will hopefully be a meaningful error
        reject(Error(req.statusText));
      }
    };

    // Handle network errors
    req.onerror = function() {
      reject(Error("Network Error"));
    };

    // Make the request
    req.send();
  });
}

var getBestPrice = function(data){
    return new Promise(function(resolve, reject){
        render = "";

        var $ = cheerio.load(data);

                
        render += $('.game-title').text() + " ";
        render += $('.local-price-column').eq(1).text();
        render += ' <a href="https://salenauts.com' + $('.price-button').eq(2).attr('href') + '">link</a></br>';

        resolve(render);
    });

   

    //data.res.send(price);
}

var getPagesArray = function(){
    var result;

    result = games.map(function(item){
        var row = [];
        row['host'] = 'salenauts.com';
        row['port'] = 80;
        row['path'] = '/pl/game/' + item +'/';
        return row;
    });

    return result;
}