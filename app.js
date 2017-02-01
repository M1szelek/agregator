var express = require('express');
var http = require('http');
var app = express();

var cheerio = require('cheerio');

var options = {
        host: 'salenauts.com',
        port: 80,
        path: '/pl/game/shenzhen-io/',
        res: undefined,
        data: undefined
};

var games = [
    'shenzhen-io',
    'undertale'
]

var sites = [
    {
        host: 'salenauts.com',
        port: 80,
        path: '/pl/game/shenzhen-io/'
    }
]

app.get('/', function(req, res){

    //var games = getPagesArray();

    //console.log(games);

    //games.forEach(function(options){
   //     loadPage(options)
    //})

    options.res = res;
    loadPage(options, getBestPrice);

});

app.listen(process.env.PORT || 5000, function(){
    console.log("App started!");
});

var loadPage = function(options, callback){
    http.get(options, function(http_res) {
            var data = "";

            http_res.on("data", function (chunk) {
                data += chunk;
            });

            http_res.on("end", function () {
                options.data = data;
                callback(options);
            });
    }).on('error', function(e) {
        options.res.send("Got error: " + e.message);
    });;
}

var getBestPrice = function(data){
    var $ = cheerio.load(data.data);

                
    price = $('.game-title').text() + " ";
    price += $('.local-price-column').eq(1).text();
    price += ' <a href="https://salenauts.com' + $('.price-button').eq(2).attr('href') + '">link</a>';

    data.res.send(price);
}

var getJadiscoStatus = function(data){

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

// var getBestPrice = function(options,res){
//     var price;

//     http.get(options, function(http_res) {
//             var data = "";

//             http_res.on("data", function (chunk) {
//                 data += chunk;
//             });

            

//             http_res.on("end", function () {
//                 var $ = cheerio.load(data);

                
//                 price = $('.game-title').text() + " ";
//                 price += $('.local-price-column').eq(1).text();
//                 price += ' <a href="https://salenauts.com' + $('.price-button').eq(2).attr('href') + '">link</a>';

//                 res.send(price);
//             });




//         }).on('error', function(e) {
//             console.log("Got error: " + e.message);
//         });

//     return price;
// }