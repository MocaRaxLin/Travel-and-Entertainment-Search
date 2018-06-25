//yelpBReview
var express = require('express');
var app = express();
var port = process.env.PORT || 3000;
var request = require('request');

const yelp = require('yelp-fusion');
const apiKey = "?";
const client = yelp.client(apiKey);

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
	
	client.reviews(data.id).then(response => {
  		console.log(response.jsonBody);
  		res.send(response.jsonBody);
  	}).catch(e => {
  		console.log(e);
  		res.send(null);
  	});

});

module.exports = router2;