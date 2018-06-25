//yelpBMatch
var express = require('express');
var app = express();
var port = process.env.PORT || 3000;
var request = require('request');

var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false });

const yelp = require('yelp-fusion');
const apiKey = "?";
const client = yelp.client(apiKey);

var router2 = express.Router();

router2.get('/', jsonParser, urlencodedParser, function(req, res) {
	if(!req.body || req.body.length === 0) {
		console.log('request body not found');
		return res.sendStatus(400);
	}
	//console.log('req.originalUrl: '+ req.originalUrl);
	console.log('req.query.data: '+ req.query.data);
	var data = JSON.parse(req.query.data);

	// matchType can be 'lookup' or 'best'
	client.businessMatch('best', {
		name: data.name,
		address1: data.address1,
		address2: data.address2,
		city: data.city,
  		state: data.state,
  		country: 'US' // by default
	}).then(response => {
		console.log(response.jsonBody);
		if(response.jsonBody.businesses.length == 0){
			res.send("-0");
		} else {
			res.send(response.jsonBody.businesses[0].id);
		}
	}).catch(e => {
  		console.log(e);
  		res.send(null);
	});

});

module.exports = router2;