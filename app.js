var express = require('express');
var http = require('http');
var app = express();
var cheerio = require('cheerio');
var path = require('path');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

var games = [
'shenzhen-io',
'undertale',
'doom',
'gang-beasts',
'redout',
'domina',
'beat-cop'
]

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){



    var games = getPagesArray();

    Promise.all(
        games.map(loadPage)
        ).then(function(pages){
            return Promise.all(pages.map(getBestPrice))
        }).then(function(render){
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

function connectToDb(){
    return MongoClient.connect(process.env.MONGODB_URI);
}

var getGamesFromDb = function(db) {

  return new Promise(function(resolve){
    var collection = db.collection('games');

    collection.findOne(
        {},{}
        , function(err, result) {
            assert.equal(err, null);
            console.log("Fetched game list.");
            resolve(result);
        });
})

  
}

connectToDb()
    .then(
        function(db){
            return getGamesFromDb(db)
        })
    .then(
        function(result){
            console.log(result);
        }
    );
