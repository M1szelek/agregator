let express = require('express');
let http = require('http');
let app = express();
let cheerio = require('cheerio');
let path = require('path');
let MongoClient = require('mongodb').MongoClient;
let assert = require('assert');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){

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
            let games = {
                games: render
            }
            res.render('index', games);
        });
    });

app.listen(process.env.PORT || 5000, function(){
    console.log("App started!");
});

let loadPage = function(options){
    return new Promise(function(resolve, reject){
        http.get(options, function(http_res) {
            let data = "";

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

let getBestPrice = function(data){
    return new Promise(function(resolve){
        let $ = cheerio.load(data);

        let title = $('.game-title').text();
        title = replaceAll(title, '\t', '');
        title = replaceAll(title, '\n', '');

        let price = $('.local-price-column').eq(1).text();
        let cut = $('.discount-column').eq(1).text();
        let link = "https://salenauts.com" + $('.price-button').eq(2).attr('href')


        let render = {
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

let getPage = function(game){

    return new Promise(function(resolve){
        let result = [];
        if(!game.type){
            game.type = 'game';
        }
        result['host'] = 'salenauts.com';
        result['port'] = 80;
        result['path'] = `/pl/${game.type}/${game.name}/`;
        resolve(result);
    });

    
}

function connectToDb(){
    return MongoClient.connect(process.env.MONGODB_URI);
}

let getGamesFromDb = function(db) {

  return new Promise(function(resolve){
    let collection = db.collection('games');

    collection.find(
        {},{}
        , function(err, result) {
            assert.equal(err, null);
            console.log("Fetched game list.");
            resolve(result.toArray());
        });
})

  
}
