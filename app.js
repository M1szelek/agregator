var express = require('express');
var http = require('http');
var app = express();
var cheerio = require('cheerio');
var path = require('path');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

// var games = [
// 'shenzhen-io',
// 'undertale',
// 'doom',
// 'gang-beasts',
// 'redout',
// 'domina',
// 'beat-cop'
// ]

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){



    //var games = getPagesArray();

    connectToDb()
    .then(
        function(db){
            return getGamesFromDb(db)
        })
    .then(
        function(games){
            return Promise.all(games.map(getPage));
            
        }
        )
    .then(
        function(pages){
            return Promise.all(pages.map(loadPage));
        }
        )
    .then(function(pages){
        return Promise.all(pages.map(getBestPrice));
    })
    .then(function(render){
            var games = {
                games: render
            }
            res.render('index', games);
        });
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
        var $ = cheerio.load(data);

        var title = $('.game-title').text();
        title = replaceAll(title, '\t', '');
        title = replaceAll(title, '\n', '');

        var price = $('.local-price-column').eq(1).text();
        var cut = $('.discount-column').eq(1).text();
        var link = "https://salenauts.com" + $('.price-button').eq(2).attr('href')


        var render = {
            title: title,
            price: price,
            cut: cut,
            link: link
        }

        resolve(render);
    });  
}

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, 'g'), replace);
}

var getPage = function(game){

    return new Promise(function(resolve){
        var result = [];
        result['host'] = 'salenauts.com';
        result['port'] = 80;
        result['path'] = '/pl/game/' + game.name +'/';
        resolve(result);
    });

    
}

function connectToDb(){
    return MongoClient.connect('mongodb://heroku_kgcb215t:8hn2sb254p5lenpekom4vmmcj@ds151070.mlab.com:51070/heroku_kgcb215t');
}

var getGamesFromDb = function(db) {

  return new Promise(function(resolve){
    var collection = db.collection('games');

    collection.find(
        {},{}
        , function(err, result) {
            assert.equal(err, null);
            console.log("Fetched game list.");
            resolve(result.toArray());
        });
})

  
}

// connectToDb()
// .then(
//     function(db){
//         return getGamesFromDb(db)
//     })
// .then(
//     function(games){
//             //console.log(result);
//             return Promise.all(games.map(getPage));
            
//         }
//         )
// .then(
//     function(pages){
//         return Promise.all(pages.map(getBestPrice))
//     }
//     ).then(function(render){
//         var games = {
//             games: render
//         }
//         res.render('index', games);
//     });
