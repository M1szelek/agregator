var express = require('express');
var http = require('http');
var app = express();

var cheerio = require('cheerio');

app.get('/', function(req, res){
	var options = {
  		host: 'salenauts.com',
  		port: 80,
  		path: '/pl/game/shenzhen-io/'
	};

	var respond;

	http.get(options, function(http_res) {
  			var data = "";

		    http_res.on("data", function (chunk) {
		        data += chunk;
		    });

		    http_res.on("end", function () {
		        var $ = cheerio.load(data);
		    	respond = $('.local-price-column').eq(1).text();
		    	res.send(respond);
		    });


		}).on('error', function(e) {
  			console.log("Got error: " + e.message);
		});

		
});

app.listen(process.env.PORT || 5000, function(){
	console.log("Example app listening on port 3000!");
});