//specifiedLatlng
var express = require('express');
var app = express();
var port = process.env.PORT || 3000;
var request = require('request');

var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false });

var router2 = express.Router();

router2.get('/', jsonParser, urlencodedParser, function(req, res) {
	if(!req.body || req.body.length === 0) {
		console.log('request body not found');
		return res.sendStatus(400);
	}
	//console.log('req.originalUrl: '+ req.originalUrl);
	console.log('req.query.data: '+ req.query.data);
	var data = JSON.parse(req.query.data);

	var geoUrl = "https://maps.googleapis.com/maps/api/geocode/json?address=";
	var loc = data.location.replace(/\s+/g, '+');
	loc = loc.replace(/,/g, '');
	var geoKey = "&key=?";
	geoUrl = geoUrl+loc+geoKey;
	console.log("geoUrl: " + geoUrl);
	request(geoUrl, function (error, response, body) {
			var data = JSON.parse(body);
			if(data['status'] == "OK"){
				//console.log('body:', JSON.stringify(data));
				var firstResult = data['results'][0];
				fromLat = firstResult['geometry']['location']['lat'];
				fromLng = firstResult['geometry']['location']['lng'];
				//console.log('----> fromLat: ' + fromLat + ",  fromLng: " + fromLng);
				var resJsonData = '{\"lat\":' + fromLat + ',\"lng\":' + fromLng+'}';
				resJsonData = JSON.parse(resJsonData);
				res.send(resJsonData);
			}else{
				res.send('noResults');
			}
		});
});

module.exports = router2;