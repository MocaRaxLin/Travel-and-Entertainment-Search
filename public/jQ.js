
var nearbySearchData = [];

var cur_page = -1;
var curDetail = null; //store current item
var pageItems =[];


$(document).ready(function(){
	//Ajax send form data
	$("#mySubmit").click(function(){
		console.log("Ajax: Send Form Data.");

		nearbySearchData = [];
		cur_page = -1;
		$('#resultArea').html('<div class="progress-bar progress-bar-striped progress-bar-animated" style="width: 50%; height: 10px;"></div>');

		//get location lat lng
		if(!$("#r1").is(':checked')){
			console.log("request lat lon of specified location.");
			var jsonLocData = {
				location: $("#tf_place").val()
			}
			jsonLocData = JSON.stringify(jsonLocData);
			$.ajax({
				url: './specifiedLatlng?data=' + jsonLocData,
				type: 'GET',
				contentType: 'application/json',
				//data: jsonLocData,
				async: false,
				success: function (resJSON) {
					//console.log(resJSON);
					CUR_LAT = resJSON.lat;
					CUR_LNG = resJSON.lng;
					//console.log("CUR_LAT: " + CUR_LAT + ",  CUR_LNG: "+ CUR_LNG);
				},
				error: function (errorResponse) { console.log('Get location lat lng error.'); }
			});
		}
		
		//ajax nearby search JSON
		console.log("request nearby search JSON.");
		var jsonData = {
			keyword: $("#tf_keyword").val(),
			category: $("#category").val(),
			distance: $("#tf_dis").val() == "" ? 10 : $("#tf_dis").val(),
			fromLat: CUR_LAT,
			fromLng: CUR_LNG
		}
		jsonData = JSON.stringify(jsonData);
		$.ajax({
			url: './nearbySearch?data=' + jsonData,
			type: 'GET',
			contentType: 'application/json',
			//data: jsonData,
			async: false,
			success: function (data) {
				//console.log(data); // data is JSON Object!
				nearbySearchData.push(data);
			},
			error: function (errorResponse) {
				console.log('Get nearby search error.');
				$('#resultArea').html('<div class="alert alert-danger" role="alert">Fail to get search results.</div>');
			}
		});
		cur_page = 0;
		drawNearbySearchInfoTable(nearbySearchData[0]);

	});

	

});

//go next page
function goNextPage(){
	console.log("Go to the next page.");
	if(cur_page + 1 == nearbySearchData.length){
		// if page not exist request the next page
		var jsonNextPage = { nextPageToken: nearbySearchData[cur_page].next_page_token };
		jsonNextPage = JSON.stringify(jsonNextPage);
		$.ajax({
			url: './nextPage?data=' + jsonNextPage,
			type: 'GET',
			contentType: 'application/json',
			//data: jsonNextPage,
			async: false,
			success: function (data) {
				//console.log(data); // data is JSON Object!
				nearbySearchData.push(data);
			},
			error: function (errorResponse) { console.log('Get next page error.'); }
		});
	}
	cur_page++;
	drawNearbySearchInfoTable(nearbySearchData[cur_page]);
}

//go previous pages
function goPreviousPage(){
	console.log("Go to the previous page.");
	cur_page--;
	drawNearbySearchInfoTable(nearbySearchData[cur_page]);
}

function drawNearbySearchInfoTable(data){
	console.log("drawNearbySearchInfoTable(data)");
	if(data == null){ console.log("no JSON to draw Table"); }else{
		console.log("draw Page JSON");
		if(data.status == "OK"){
			$('#resultArea').html(infoTableHTML(data));
		}else{
			console.log("ZERO_RESULTS");
			$('#resultArea').html('<div class="alert alert-warning" role="alert">No Records.</div>');
		}
	}
}



function infoTableHTML(data){
	var ret = '<div id="itemList">';
	if(curDetail == null){
		ret+='<div class="row float-right"><button id="cornerDetail_btn" class="btn disabled" onclick="moveToDetail()">Details <i class="fas fa-angle-right"></i></button></div>'; 
	}else{
		ret+='<div class="row float-right"><button id="cornerDetail_btn" class="btn" onclick="moveToDetail()">Details <i class="fas fa-angle-right"></i></button></div>'; 
	}
	pageItems = [];
	ret+='<br><br><table class="table table-hover">';
	ret+='<thead><tr><th scope="col">#</th><th scope="col">Category</th><th scope="col">Name</th><th scope="col">Address</th><th scope="col">Favorite</th><th scope="col">Details</th></tr></thead>';
	ret+='<tbody>';
	for(var i = 0; i < data.results.length; i++){
		var item = data.results[i];
		ret += '<tr id="' + i + '" onclick="dataToDetail(this)"><th scope="row" class="align-middle">'+(i+1)+'</th>';
		ret += '<td><img src="'+item.icon+'"></td><td class="align-middle">'+item.name+'</td><td class="align-middle">'+item.vicinity+'</td>';
		ret += '<td class="align-middle"><button class="btn" onclick="toFavorite(this)">';
		var key = item.place_id;
		if(sessionStorage.getItem(key) === null){ //not favorite
			ret+='<i class="far fa-star"></i>';
		}else{ // exist
			ret+='<i class="fas fa-star"></i>';
		}
		ret+='</button></td>';
		ret += '<td class="align-middle"><button class="btn" onclick="itemToDetail(this)"><i class="fas fa-angle-right"></i></button></td>';
		ret += '</tr>';
		pageItems.push(item);
	}
	ret+= '</tbody></table>';
	ret+= '<div class="row justify-content-center">';
	if(cur_page != 0){
		ret += '<button id="prevPage_btn" class="btn" onclick="goPreviousPage()">Previous</button>';
	}
	if(typeof data.next_page_token !== "undefined"){
		ret += '<button id="nextPage_btn" class="btn" onclick="goNextPage()">Next</button>';
	}
	ret += '</div></div>';
	return ret;
}



function moveToDetail(){
	if($('#cornerDetail_btn').hasClass('disabled')){
		console.log('button id disabled!');
		return;
	}
	if(curDetail == null){
		console.log('curDetail == null');
		return;
	}
	console.log("moveToDetail()");

	//TODO: angular move to detail
	$('#itemList').hide();
	$('#detailInfo').show();
}

function moveToList(){
	console.log("moveToList()");

	//TODO: angular move to list
	$('#detailInfo').hide();
	$('#itemList').show();
	drawNearbySearchInfoTable(nearbySearchData[cur_page]);
}

var t_lat = 0;
var t_lng = 0;
var detailData = null;

var yelpReview = null;
var googleReview = null;

function dataToDetail(row){
	console.log("dataToDetail(row)");
	console.log("row.id: "+ row.id);
	var newDetail = pageItems[row.id];
	if(curDetail != null) console.log("curDetail.place_id: " + curDetail.place_id);
	if(newDetail != null) console.log("newDetail.place_id: " + newDetail.place_id);

	if(curDetail != null && curDetail.place_id == newDetail.place_id) return; //same page
	$('#detailInfo').remove();

	$(row).addClass('alert alert-warning text-dark').siblings().removeClass('alert alert-warning text-dark');
	curDetail = newDetail;

	//request place detail
	var jsonDetail = { place_id: curDetail.place_id };
	jsonDetail = JSON.stringify(jsonDetail);
	$.ajax({
		url: './placeDetail?data='+jsonDetail,
		type: 'GET',
		contentType: 'application/json',
		//data: jsonNextPage,
		async: false,
		success: function (data) {
			//console.log(data); // data is JSON Object!
			detailData = data;
		},
		error: function (errorResponse) { console.log('Get next page error.'); }
	});


	$('#cornerDetail_btn').removeClass('disabled');

	var detailHTML = detailInfoHTML(detailData.result)
	$('#resultArea').append(detailHTML);
	$("#tableRate").rateYo({
		rating: detailData.result.rating,
		starWidth: "30px"
	});

	t_lat = detailData.result.geometry.location.lat;
	t_lng = detailData.result.geometry.location.lng;

	drawMap(t_lat, t_lng);

	//get Yelp Id
	var yelpId = null;
	var jsonYlepMatch = {
		name: detailData.result.name,
		address1: getAddress(detailData.result.formatted_address, 0),
		address2: getAddress(detailData.result.formatted_address, 1),
		city: getCity(detailData.result.vicinity),
		state: getState(detailData.result.formatted_address),
	};
	jsonYlepMatch = JSON.stringify(jsonYlepMatch);
	$.ajax({
		url: './yelpBMatch?data='+jsonYlepMatch,
		type: 'GET',
		contentType: 'application/json',
		async: false,
		success: function (data) {
			//console.log(data);
			yelpId = data;
		},
		error: function (errorResponse) { console.log('Get Ylep Match error.'); }
	});
	//console.log(yelpId);

	//catch yelp json
	var yelpJSON = null;
	console.log(yelpId);
	if(yelpId != null && yelpId != "-0"){
		var jsonYlepReviews = {
			id: yelpId
		};
		jsonYlepReviews = JSON.stringify(jsonYlepReviews);
		$.ajax({
			url: './yelpBReview?data='+jsonYlepReviews,
			type: 'GET',
			contentType: 'application/json',
			async: false,
			success: function (data) {
				console.log(data);
				yelpJSON = data;
			},
			error: function (errorResponse) { console.log('Get Ylep Reviews error.'); }
		});
		//console.log(yelpJSON);
	}
	yelpReview = yelpJSON == null ? null: yelpJSON.reviews;
	googleReview = detailData.result.reviews;
	drawReviews(googleReview, yelpReview, 'Default Order');
}

var gArray = null;
var yArray = null;
function drawReviews(gReview, yReview, method){
	// google
	var gHTML = "";
	if(typeof gReview !== "undefined" && gReview != 0 && method == 'Default Order') gArray = gReview;
	if(gArray != null){
		for(var i = 0; i < gArray.length; i++){
			var r = gArray[i];
			var row = '<div class="border border-secondary rounded m-2 p-4 d-flex row w-100 justify-content-start">';
			row+='<div class="col-1"><a target="_blank" href="'+r.author_url+'">';
			row+='<img style="width:50px;height:50px;" src="'+ r.profile_photo_url +'" alt="">';
			row+='</a></div>';
			row+='<div class="col-10">';
			row+='<div class="row"><a target="_blank" href="'+r.author_url+'">'+r.author_name+'</a></div>';
			row+='<div class="row"><div id="gR'+i+'"></div>'+ convertGoogleTime(r.time) +'  </div>';
			row+='<div class="row">'+r.text +'</div>';
			row+='</div>';
			row+='</div>';
			gHTML += row;
		}
	}
	if(gHTML == "") gHTML = '<br><div class="row w-100 alert alert-warning" role="alert">No Records.</div>';
	$('#gReview').html(gHTML);

	//Ylep
	var yHTML = "";
	if(typeof yReview !== "undefined" && yReview != 0 && method == 'Default Order') yArray = yReview;
	if(yArray != null){
		for(var i = 0; i < yArray.length; i++){
			var r = yArray[i];
			var row = '<div class="border border-secondary rounded m-2 p-4 d-flex row w-100 justify-content-start">';
			row+='<div class="col-1"><a target="_blank" href="'+r.url+'">';
			row+='<img style="width:50px;height:50px;" src="'+ r.user.image_url +'" alt="" class="rounded-circle">';
			row+='</a></div>';
			row+='<div class="col-10">';
			row+='<div class="row"><a target="_blank" href="'+r.url+'">'+r.user.name+'</a></div>';
			row+='<div class="row"><div id="yR'+i+'"></div>'+ r.time_created +'  </div>';
			row+='<div class="row">'+r.text +'</div>';
			row+='</div>';
			row+='</div>';
			yHTML += row;
		}
	}
	if(yHTML == "") yHTML = '<br><div class="row w-100 alert alert-warning" role="alert">No Records.</div>';
	$('#yReview').html(yHTML);

	//draw rating stars
	if(gArray != null){
		for(var i = 0; i < gArray.length; i++){
			$('#gR'+i).rateYo({
				rating: gArray[i].rating,
				starWidth: "20px"
			});
		}
	}
	if(yArray != null){
		for(var i = 0; i < yArray.length; i++){
			$('#yR'+i).rateYo({
				rating: yArray[i].rating,
				starWidth: "20px"
			});
		}
	}
	$('#yReview').hide();
}


function getAddress(address, index){
	var res = address.split(', ');
	return res[index];
}

function getState(fuck){
	var res = fuck.split(', ');
	var res = res[res.length - 2].split(' ');
	return res[0];
}

function getCity(vicinity){
	var res = vicinity.split(', ');
	return res[res.length - 1];
}

var map, panorama, marker, directionsService, directionsDisplay;
function drawMap(t_lat, t_lng){
	var uluru = {lat: t_lat, lng: t_lng};

	var mapContent = document.getElementById('map');
	map = new google.maps.Map(mapContent, {
		zoom: 18,
		center: uluru
	});
	marker = new google.maps.Marker({
		position: uluru,
		map: map
	});


	directionsService = new google.maps.DirectionsService;
	directionsDisplay = new google.maps.DirectionsRenderer;
	directionsDisplay.setMap(map);
	var mapResult = document.getElementById('mapResult');
	directionsDisplay.setPanel(mapResult);

	mapContent.style.display = "block";
}

function switchView(btn){
	if($('#map').is(':visible')){
		$(btn).html('<img style="width:30px;height:30px;" src="http://cs-server.usc.edu:45678/hw/hw8/images/Map.png"></img>');
		$('#map').hide();
		$('#pano').show();
		var pano = document.getElementById('pano');
		var uluru = {lat: t_lat, lng: t_lng};
		panorama = new google.maps.StreetViewPanorama( pano, {
			position: uluru,
			pov: {
				heading: 165,
				pitch: 0
			}
		});
	}else{
		$(btn).html('<img style="width:30px;height:30px;" src="http://cs-server.usc.edu:45678/hw/hw8/images/Pegman.png"></img>');
		$('#pano').html("");
		$('#pano').hide();
		$('#map').show();
	}
}

function getDirection(){
	var fromLoc = $('#fromLocation').val();
	fromLoc = fromLoc == "My Location" || /^\s*$/.test(fromLoc)? new google.maps.LatLng(CUR_LAT, CUR_LNG): fromLoc;
	var toLoc = new google.maps.LatLng(t_lat, t_lng);
	var trvlMode = $('#travelMode').val();
	console.log("getDirection(): from: "+fromLoc+", to: "+toLoc+ ", with "+ trvlMode);
	marker.setMap(null);
	directionsService.route({
		origin: fromLoc,
		destination: toLoc,
		travelMode: trvlMode,
		provideRouteAlternatives: true
	}, function(response, status) {
		if (status === 'OK') {
			directionsDisplay.setDirections(response);
			console.log(response);
		} else { window.alert('Directions request failed due to ' + status); }
	});
}


function detailInfoHTML(data){
	var ret = '<div id="detailInfo" class="container" style="display:none;">';
	ret+='<div class="row justify-content-center font-weight-bold">'+data.name+'</div>';
	
	ret+='<div class="row">';
	ret+='<div class="col align-self-start"><button id="cornerList_btn" class="btn" onclick="moveToList(this)"><i class="fas fa-angle-left"></i> List</button></div>';
	ret+='<div class="col text-right">';
	ret+='<button id="favorite_btn" class="btn" onclick="itemToFavorite(this)">';
	
	var key = data.place_id;
	if(sessionStorage.getItem(key) === null){ //not favorite
		ret+='<i class="far fa-star"></i>';
	}else{ // exist
		ret+='<i class="fas fa-star"></i>';
	}

	ret+='</button>';
	var txt = '?text=Check out '+data.name+' located at '+data.formatted_address+', Website: '+data.url;
	txt += '&hashtags=damn_csci571';
	ret+='<a class="twitter-share-button" href="https://twitter.com/intent/tweet'+txt+'"><img style="width:40px;height:40px;" src="http://cs-server.usc.edu:45678/hw/hw8/images/Twitter.png"></img></a>';
	ret+='</div>';
	ret+='</div>';

	ret+='<br><div class="row justify-content-end">';
	ret+='<ul class="nav nav-tabs justify-content-end">';
	ret+='<li class="nav-item"><a class="nav-link active" onclick="tabOn(this)">Info</a></li>';
	ret+='<li class="nav-item"><a class="nav-link text-primary" onclick="tabOn(this)">Photos</a></li>';
	ret+='<li class="nav-item"><a class="nav-link text-primary" onclick="tabOn(this)">Map</a></li>';
	ret+='<li class="nav-item"><a class="nav-link text-primary" onclick="tabOn(this)">Reviews</a></li></ul></div>';
  
	ret+='<br><div id="tab_content" class="w-100 row justify-content-center">';

	// Tab Info Table
	ret+='<div id="tab_info" class="w-100 row justify-content-center">';
	ret+='<table class="w-100 table table-striped">';
	ret+='<tbody>';
	if(typeof data.formatted_address !== "undefined"){
		ret+='<tr><th>Address</th><td>'+data.formatted_address+'</td></tr>';
	}
	if(typeof data.international_phone_number !== "undefined"){
		ret+='<tr><th>Phone Number</th><td>'+data.international_phone_number+'</td></tr>';
	}
	if(typeof data.price_level !== "undefined"){
		var moneyIcon = "";
		for(var i = 0; i < data.price_level;i++) moneyIcon+="$";
		ret+='<tr><th>Price Level</th><td>'+moneyIcon+'</td></tr>';
	}
	if(typeof data.rating !== "undefined"){
		ret+='<tr><th>Rating</th><td>'+data.rating+'  <div id="tableRate"></div></td></tr>';
	}
	if(typeof data.url !== "undefined"){
		ret+='<tr><th>Google Page</th><td><a target="_blank" href="'+data.url+'">'+data.url+'</a></td></tr>';
	}
	if(typeof data.website !== "undefined"){
		ret+='<tr><th>Website</th><td><a target="_blank" href="'+data.website+'">'+data.website+'</a></td></tr>';
	}
	var weekDay = -1;
	if(typeof data.opening_hours !== "undefined"){
		weekDay = getTodayWeekDay();
		var txt = data.opening_hours.weekday_text[weekDay];
		txt = txt.split(': ');
		ret+='<tr><th>Hours</th><td>'+ (data.opening_hours.open_now ? 'Open now: '+ txt[1]+'    ' : 'Closed    ');
		ret+='<a href="#" data-toggle="modal" data-target="#openhoursModal">Daily open hours</a></td></tr>';
	}
	ret+='</tbody>';
	ret+='</table>';
	ret+='</div>';

	// Tab Photos
	ret+='<div id="tab_photos" class="w-100 row justify-content-center" style="display:none;">';
	if(typeof data.photos !== "undefined"){
		for(var i = 0; i < 4;i++){
			ret+='<div class="col">';
			ret+=makePhotoColHTML(i, data);
			ret+='</div>';
		}
	}else{
		ret+='<div class="w-100 alert alert-warning" role="alert">No Records.</div>';
	}
	ret+='</div>';

	// Tab Map
	ret+='<div id="tab_map" class="w-100" style="display:none;">';

	ret+='<form class="w-100">';
	ret+='<div class="row form-row w-100 align-items-end">';
	ret+='<div class="form-group col"><label class="row" for="fromLocation">From</label>';
	ret+='<input type="text" class="form-control row" id="fromLocation" placeholder="Your Location">';
	ret+='<script type="text/javascript">var fromLocAutocomplete = new google.maps.places.Autocomplete((document.getElementById("fromLocation")),{types: ["geocode"]});</script>';
	ret+='</div>';
	ret+='<div class="form-group col"><label class="row" for="toLocation">To</label>';
	ret+='<input type="text" class="form-control row" id="toLocation" value="'+data.formatted_address+'" disabled></div>';
	ret+='<div class="form-group col"><label class="row" for="travelMode">Travel Mode</label>';
	ret+='<select class="form-control row custom-select" id="travelMode" value="Driving">';
	ret+='<option value="DRIVING">Driving</option>';
	ret+='<option value="BICYCLING">Bicycling</option>';
	ret+='<option value="TRANSIT">Transit</option>';
	ret+='<option value="WALKING">Walking</option>';
	ret+='</select></div>';
	
	ret+='<div class="form-group col">';
	ret+='<button class="form-control btn btn-primary" id="getDirect" type="button" onclick="getDirection()">Get Direction</div>';
	ret+='</div>';
	ret+='</form>';

	ret+='<div class="row justify-content-start">';
	ret+='<button class="btn" onclick="switchView(this)"><img style="width:40px;height:40px;" src="http://cs-server.usc.edu:45678/hw/hw8/images/Pegman.png"></img></button>';
	ret+='</div><br>';

	ret+='<div class="row w-100" style="height:500px"><div id="map" class="w-100 h-100"></div>';
	ret+='<div id="pano" class="w-100 h-100"></div></div>';
	ret+='<div id="mapResult" class="row w-100"></div>';

	ret+='</div>';

	// Tab Reviews
	ret+='<div id="tab_reviews" class="w-100 row" style="display:none;">';
	ret+='<div class="row justify-content-start">';

	ret+='<div class="input-group-prepend mr-4">';
	ret+='<button id="review_dp_btn" class="btn btn-secondary dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Google Reviews</button>';
    ret+='<div class="dropdown-menu"><a class="dropdown-item" onclick="showGoogleReview()">Google Reviews</a>';
    ret+='<a class="dropdown-item" onclick="showYelpReview()">Yelp Reviews</a></div>';
    ret+='</div>';

    ret+='<br><div class="input-group-prepend mr-4">';
	ret+='<button id="review_dp_sort_btn" class="btn btn-secondary dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Default Order</button>';
    ret+='<div class="dropdown-menu"><a class="dropdown-item" onclick="sortReview(this)">Default Order</a>';
    ret+='<a class="dropdown-item" onclick="sortReview(this)">Heightest Rating</a>';
    ret+='<a class="dropdown-item" onclick="sortReview(this)">Lowest Rating</a>';
    ret+='<a class="dropdown-item" onclick="sortReview(this)">Most Recent</a>';
    ret+='<a class="dropdown-item" onclick="sortReview(this)">Least Recent</a></div>';
    ret+='</div>';

	ret+='</div>';

	ret+='<br><div id="reviewArea" class="w-100 row">';
	ret+='<div id="gReview" class="w-100 row">';
	ret+='</div>';
	ret+='<div id="yReview" class="w-100 row">';
	ret+='</div>';
	ret+='</div>';

	ret+='</div>';


	ret+='</div>';//tab content

	ret+='</div>';

	//Open hour Modal
	if(typeof data.opening_hours !== "undefined"){
		var modal = makeOpenHourModalHTML(weekDay, data.opening_hours);
		$('#openhoursPanel').html(modal);
	}

	return ret;
	
}

var showReviewIn = 'Default Order';
function sortReview(item){
	var method = $(item).html();
	$('#review_dp_sort_btn').html(method);
	showReviewIn = method;
	console.log('sortReview(item), method: '+method);
	if(method == 'Heightest Rating'){
		sortArrayByRating(gArray, false);
		sortArrayByRating(yArray, false);
	}else if(method == 'Lowest Rating'){
		sortArrayByRating(gArray, true);
		sortArrayByRating(yArray, true);
	}else if(method == 'Most Recent'){
		sortArrayByTime(gArray, 'g', false);
		sortArrayByTime(yArray, 'y', false);
	}else if(method == 'Least Recent'){
		sortArrayByTime(gArray, 'g', true);
		sortArrayByTime(yArray, 'y', true);
	}
	// else Default Order
	$('#gReview').show();
	$('#gReview').show();
	drawReviews(googleReview, yelpReview, method);
	$('#review_dp_btn').html('Google Reviews');
}

function makeOpenHourModalHTML(weekDay, openingTime){
	//console.log('makeOpenHourModalHTML('+weekDay+', '+openingTime+')');
	var ret = "";
	ret+='<div class="modal fade" id="openhoursModal" tabindex="-1" role="dialog" aria-labelledby="openhoursModalTitle" aria-hidden="true">';
	ret+='<div class="modal-dialog modal-dialog-centered" role="document">';
	ret+='<div class="modal-content">';
	ret+='<div class="modal-header">';
	ret+='<h5 class="modal-title" id="openhoursModalTitle">Open hours</h5>';
	ret+='<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>';
	ret+='</div>';

	ret+='<div class="modal-body">';
	for(var i = 0; i < 7; i++){
		var txt = openingTime.weekday_text[i];
		txt = txt.split(': ');
		ret+='<hr>';
		if(i == weekDay - 1) ret+='<b>';
		ret+='<div class="row"><div class="col">'+txt[0]+'</div><div class="col">'+txt[1]+'</div></div>';
		if(i == weekDay - 1) ret+='</b>';
	}
	ret+='</div>';

	ret+='<div class="modal-footer"><button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button></div>';
	ret+='</div></div></div>';
	return ret;
}

function showGoogleReview(){
	//console.log('showGoogleReview()');
	$('#review_dp_btn').html('Google Reviews');
	$('#yReview').hide();
	$('#gReview').show();
}

function showYelpReview(){
	//console.log('showYelpReview()');
	$('#review_dp_btn').html('Yelp Reviews');
	$('#gReview').hide();
	$('#yReview').show();
}

function itemToDetail(arrow_btn){
	console.log("itemToDetail(arrow_btn)");
	var row = $(arrow_btn).parent().parent();
	//console.log(row);
	dataToDetail(row[0]);
	moveToDetail();
}


function makePhotoColHTML(offset, data){
	var ret = '';
	for(var i = offset; i < data.photos.length; i+=4){
		var pUrl = "https://maps.googleapis.com/maps/api/place/photo?";
		var pMW = "maxwidth="+data.photos[i].width+"&";
		var pRef = "photoreference="+data.photos[i].photo_reference+"&";
		var pKey = "key=AIzaSyAG-wpJvCaAJvJTzOT48bIyj9ozHWWDJng";
		//var pKey = "key=AIzaSyC6_ltiNkHEz4YJVLpvTJH548GgJNk4DOM";
		pUrl = pUrl + pMW + pRef + pKey;
		ret+='<div class="border border-secondary rounded mb-2" style="padding:2px;"><a target="_blank" href="'+pUrl+'"><img src="'+pUrl+'" style="width:100%;"></img></a></div>';
	}
	return ret;
}
function tabOn(tab){
	$(tab).addClass('active').removeClass('text-primary').parent().siblings().children().removeClass('active').addClass('text-primary');
	var index = $(tab).parent().prevAll().length;
	//console.log(index);
	$('#tab_content').children().eq(index).show().siblings().hide();
}


function toFavorite(star_btn){
	console.log("toFavorite(star_btn)");
	var row = $(star_btn).parent().parent();

	var index = row[0].id;
	var key = pageItems[index].place_id;
	if(sessionStorage.getItem(key) === null){ //not favorite then add
		$(star_btn).html('<i class="fas fa-star"></i>');
		//console.log(pageItems[index])
		var JString = JSON.stringify(pageItems[index]);
		sessionStorage.setItem(key, JString);
		//console.log("save: " + key);
		console.log(sessionStorage);
	}else{ // exist then remove
		$(star_btn).html('<i class="far fa-star"></i>');
		sessionStorage.removeItem(key);
		//console.log("remove: " + key);
		console.log(sessionStorage);
	}

}

function itemToFavorite(star_btn){ // TODO pageItems[row.id]
	// inDetail
	console.log("itemToFavorite(star_btn)");
	var key = curDetail.place_id;
	if(sessionStorage.getItem(key) === null){ //not favorite then add
		$(star_btn).html('<i class="fas fa-star"></i>');
		var JString = JSON.stringify(curDetail);
		sessionStorage.setItem(key, JString);
	}else{ // exist then remove
		$(star_btn).html('<i class="far fa-star"></i>');
		sessionStorage.removeItem(key);
	}
}





