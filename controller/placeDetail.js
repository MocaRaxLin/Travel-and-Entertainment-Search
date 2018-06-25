//placeDetail
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

	var pdUrl = "https://maps.googleapis.com/maps/api/place/details/json?";
	var pdPlaceId = "placeid=" + data.place_id + "&";
	var pdKey = "key=?";
	pdUrl = pdUrl + pdPlaceId + pdKey;
	console.log("pdUrl: " + pdUrl);
	request(pdUrl, function (error, response, body) {
		var data = JSON.parse(body);
		res.send(data);
	});
});

module.exports = router2;