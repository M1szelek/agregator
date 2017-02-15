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

//render = "";

app.get('/', function(req, res){

    var games = getPagesArray();

    //var render = "";

    // loadPage(games[0]).then(getBestPrice).then(function(chunk){
    //     return chunk;
    // }).then(function(render){
    //     res.send(render);
    // });

    Promise.all(
        games.map(loadPage)
    ).then(function(pages){
        return Promise.all(pages.map(getBestPrice))
    }).then(function(render){

        renderr = render.reduce(function(renderr,i){
            return renderr + i;
        },"")

        res.send(renderr);
    });

    // return Promise.all(
    // // Map our array of chapter urls to
    // // an array of chapter json promises
    // story.chapterUrls.map(getJSON)
    //  );
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

var getBestPrice = function(data){
    
    return new Promise(function(resolve){
        var render = "";

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