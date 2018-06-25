//server.js
var express = require('express');
var app = express();
var port = process.env.PORT || 3000;
var router = express.Router();
var cors = require('cors');
app.use(cors());



//home page as /public/index.html
app.use(express.static(__dirname + "/public"));

var nearbySearch = require('./controller/nearbySearch');
var specifiedLatlng = require('./controller/specifiedLatlng');
var nextPage = require('./controller/nextPage');
var placeDetail = require('./controller/placeDetail');
var yelpBMatch = require('./controller/yelpBMatch');
var yelpBReview = require('./controller/yelpBReview');


app.use('/nearbySearch', nearbySearch);
app.use('/specifiedLatlng', specifiedLatlng);
app.use('/nextPage', nextPage);
app.use('/placeDetail', placeDetail);
app.use('/yelpBMatch', yelpBMatch);
app.use('/yelpBReview', yelpBReview);

app.listen(port);


