//J Favorite
// use sessionStorage
var curDetail_f = null
var cur_page_f = 0;
var pageItems_f =[];

function showFavorites(){
	console.log("showFavorites()");
	$('#favorite_btn').addClass('btn-primary');
	$('#result_btn').removeClass('btn-primary');
	$('#resultArea').hide();
	$('#favoriteArea').show();
	drawFavoriteTable(cur_page_f);
}

function drawFavoriteTable(cur_page_f){
	var favoriteHTML = makeFavoriteTableHTML(cur_page_f);
	$('#favoriteArea').html(favoriteHTML);
}

function makeFavoriteTableHTML(cur_page_f){
	var ret = "";
	if(sessionStorage.length == 0){
		ret+='<div class="row w-100 alert alert-warning" role="alert">No Records.</div>'
	}else{
		ret += '<div id="itemList_f">';
		if(curDetail_f == null){
			ret+='<div class="row float-right"><button id="cornerDetail_btn_f" class="btn disabled" onclick="moveToDetail_f()">Details <i class="fas fa-angle-right"></i></button></div>'; 
		}else{
			ret+='<div class="row float-right"><button id="cornerDetail_btn_f" class="btn" onclick="moveToDetail_f()">Details <i class="fas fa-angle-right"></i></button></div>'; 
		}
		ret+='<br><br><table class="table table-hover">';
		ret+='<thead><tr><th scope="col">#</th><th scope="col">Category</th><th scope="col">Name</th><th scope="col">Address</th><th scope="col">Favorite</th><th scope="col">Details</th></tr></thead>';
		ret+='<tbody>';
		pageItems_f =[];
		var offset = 20*cur_page_f;
		//console.log(sessionStorage);
		for(var i = offset; i < offset + 20 && i < sessionStorage.length; i++){
			var item = Object.values(sessionStorage)[i];
			//console.log("Favorite: "+i);
			item = JSON.parse(item);
			//console.log(item);
			ret += '<tr id="'+i+'_f" onclick="dataToDetail_f(this)"><th scope="row" class="align-middle">'+(i+1)+'</th>';
			ret += '<td><img src="'+item.icon+'"></td><td class="align-middle">'+item.name+'</td><td class="align-middle">'+item.vicinity+'</td>';
			ret += '<td class="align-middle"><button class="btn" onclick="toTrash(this)">';
			ret += '<i class="fas fa-trash-alt"></i>'
			ret += '</button></td>';
			ret += '<td class="align-middle"><button class="btn" onclick="itemToDetail_f(this)"><i class="fas fa-angle-right"></i></button></td>';
			ret += '</tr>';
			pageItems_f.push(item);
		}
		ret+= '</tbody></table>';
		ret+= '<div class="row justify-content-center">';
		if(cur_page_f != 0){
			ret += '<button class="btn" onclick="goPreviousPage_f()">Previous</button>';
		}
		if(offset + 20 < sessionStorage.length){
			ret += '<button class="btn" onclick="goNextPage_f()">Next</button>';
		}
		ret += '</div></div>';
	}
	return ret;
}

function itemToDetail_f(arrow_btn){
	console.log("itemToDetail_f(arrow_btn)");
	var row = $(arrow_btn).parent().parent();
	//console.log(row);
	dataToDetail_f(row[0]);
	moveToDetail_f();
}

//go next page
function goNextPage_f(){
	console.log("Go to the next page _f.");
	cur_page++;
	drawFavoriteTable(cur_page);
}

//go previous pages
function goPreviousPage_f(){
	console.log("Go to the previous page. _f");
	cur_page--;
	drawFavoriteTable(cur_page);
}


var t_lat_f = 0;
var t_lng_f = 0;
var detailData_f = null;

var yelpReview_f = null;
var googleReview_f = null;
function dataToDetail_f(row){
	console.log("dataToDetail_f(row)");
	var d = row.id;
	var index = d.substring(0, d.length - 2);
	console.log("row.id_f: "+ row.id);
	var newDetail_f = pageItems_f[index];
	if(curDetail_f != null) console.log("curDetail_f.place_id: " + curDetail_f.place_id);
	if(newDetail_f != null) console.log("newDetail_f.place_id: " + newDetail_f.place_id);

	if(curDetail_f != null && curDetail_f.place_id == newDetail_f.place_id) return; //same page in Favorite
	$('#detailInfo_f').remove();
	
	$(row).addClass('alert alert-warning text-dark').siblings().removeClass('alert alert-warning text-dark');
	curDetail_f = newDetail_f;

	//request place detail
	var jsonDetail_f = { place_id: curDetail_f.place_id };
	jsonDetail_f = JSON.stringify(jsonDetail_f);
	$.ajax({
		url: './placeDetail?data='+jsonDetail_f,
		type: 'GET',
		contentType: 'application/json',
		//data: jsonNextPage,
		async: false,
		success: function (data) {
			console.log(data); // data is JSON Object!
			detailData_f = data;
		},
		error: function (errorResponse) { console.log('Get next page error _f.'); }
	});


	$('#cornerDetail_btn_f').removeClass('disabled');

	var detailHTML_f = detailInfoHTML_f(detailData_f.result)
	$('#favoriteArea').append(detailHTML_f);
	$("#tableRate_f").rateYo({
		rating: detailData_f.result.rating,
		starWidth: "30px"
	});

	t_lat_f = detailData_f.result.geometry.location.lat;
	t_lng_f = detailData_f.result.geometry.location.lng;

	drawMap_f(t_lat_f, t_lng_f);

	//get Yelp Id
	var yelpId = null;
	var jsonYlepMatch = {
		name: detailData_f.result.name,
		address1: getAddress(detailData_f.result.formatted_address, 0),
		address2: getAddress(detailData_f.result.formatted_address, 1),
		city: getCity(detailData_f.result.vicinity),
		state: getState(detailData_f.result.formatted_address),
	};
	jsonYlepMatch = JSON.stringify(jsonYlepMatch);
	$.ajax({
		url: './yelpBMatch?data='+jsonYlepMatch,
		type: 'GET',
		contentType: 'application/json',
		async: false,
		success: function (data) {
			console.log(data);
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
	var yelpReview_f = yelpJSON == null ? null: yelpJSON.reviews;
	var googleReview_f = detailData_f.result.reviews;
	drawReviews_f(googleReview_f, yelpReview_f, 'Default Order');
}

function detailInfoHTML_f(data){
	var ret = '<div id="detailInfo_f" class="container" style="display:none;">';
	ret+='<div class="row justify-content-center font-weight-bold">'+data.name+'</div>';
	
	ret+='<div class="row">';
	ret+='<div class="col align-self-start"><button id="cornerList_btn" class="btn" onclick="moveToList_f(this)"><i class="fas fa-angle-left"></i> List</button></div>';
	ret+='<div class="col text-right">';
	ret+='<button id="favorite_btn_f" class="btn" onclick="itemToTrash(this)">';
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
	ret+='<li class="nav-item"><a class="nav-link active" onclick="tabOn_f(this)">Info</a></li>';
	ret+='<li class="nav-item"><a class="nav-link text-primary" onclick="tabOn_f(this)">Photos</a></li>';
	ret+='<li class="nav-item"><a class="nav-link text-primary" onclick="tabOn_f(this)">Map</a></li>';
	ret+='<li class="nav-item"><a class="nav-link text-primary" onclick="tabOn_f(this)">Reviews</a></li></ul></div>';
  
	ret+='<br><div id="tab_content_f" class="w-100 row justify-content-center">';

	// Tab Info Table
	ret+='<div id="tab_info_f" class="w-100 row justify-content-center">';
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
		ret+='<tr><th>Rating</th><td>'+data.rating+'  <div id="tableRate_f"></div></td></tr>';
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
		ret+='<a href="#" data-toggle="modal" data-target="#openhoursModal_f">Daily open hours</a></td></tr>';
	}
	ret+='</tbody>';
	ret+='</table>';
	ret+='</div>';

	// Tab Photos
	ret+='<div id="tab_photos_f" class="w-100 row justify-content-center" style="display:none;">';
	if(typeof data.photos !== "undefined"){
		for(var i = 0; i < 4;i++){
			ret+='<div class="col">';
			ret+=makePhotoColHTML_f(i, data);
			ret+='</div>';
		}
	}else{
		ret+='<div class="w-100 alert alert-warning" role="alert">No Records.</div>';
	}
	ret+='</div>';

	// Tab Map
	ret+='<div id="tab_map_f" class="w-100" style="display:none;">';

	ret+='<form class="w-100">';
	ret+='<div class="row form-row w-100 align-items-end">';
	ret+='<div class="form-group col"><label class="row" for="fromLocation_f">From</label>';
	ret+='<input type="text" class="form-control row" id="fromLocation_f" placeholder="Your Location">';
	ret+='<script type="text/javascript">var fromLocAutocomplete = new google.maps.places.Autocomplete((document.getElementById("fromLocation_f")),{types: ["geocode"]});</script>';
	ret+='</div>';
	ret+='<div class="form-group col"><label class="row" for="toLocation_f">To</label>';
	ret+='<input type="text" class="form-control row" id="toLocation_f" value="'+data.formatted_address+'" disabled></div>';
	ret+='<div class="form-group col"><label class="row" for="travelMode_f">Travel Mode</label>';
	ret+='<select class="form-control row custom-select" id="travelMode_f" value="Driving">';
	ret+='<option value="DRIVING">Driving</option>';
	ret+='<option value="BICYCLING">Bicycling</option>';
	ret+='<option value="TRANSIT">Transit</option>';
	ret+='<option value="WALKING">Walking</option>';
	ret+='</select></div>';
	
	ret+='<div class="form-group col">';
	ret+='<button class="form-control btn btn-primary" id="getDirect_f" type="button" onclick="getDirection_f()">Get Direction</div>';
	ret+='</div>';
	ret+='</form>';

	ret+='<div class="row justify-content-start">';
	ret+='<button class="btn" onclick="switchView_f(this)"><img style="width:30px;height:30px;" src="http://cs-server.usc.edu:45678/hw/hw8/images/Pegman.png"></img></button>';
	ret+='</div><br>';

	ret+='<div class="row w-100" style="height:500px"><div id="map_f" class="w-100 h-100"></div>';
	ret+='<div id="pano_f" class="w-100 h-100"></div></div>';
	ret+='<div id="mapResult_f" class="row w-100"></div>';

	ret+='</div>';

	// Tab Reviews
	ret+='<div id="tab_reviews_f" class="w-100 row" style="display:none;">';
	ret+='<div class="row justify-content-start">';

	ret+='<div class="input-group-prepend mr-4">';
	ret+='<button id="review_dp_btn_f" class="btn btn-secondary dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Google Reviews</button>';
    ret+='<div class="dropdown-menu"><a class="dropdown-item" onclick="showGoogleReview_f()">Google Reviews</a>';
    ret+='<a class="dropdown-item" onclick="showYelpReview_f()">Yelp Reviews</a></div>';
    ret+='</div>';

    ret+='<br><div class="input-group-prepend mr-4">';
	ret+='<button id="review_dp_sort_btn_f" class="btn btn-secondary dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Default Order</button>';
    ret+='<div class="dropdown-menu"><a class="dropdown-item" onclick="sortReview_f(this)">Default Order</a>';
    ret+='<a class="dropdown-item" onclick="sortReview_f(this)">Heightest Rating</a>';
    ret+='<a class="dropdown-item" onclick="sortReview_f(this)">Lowest Rating</a>';
    ret+='<a class="dropdown-item" onclick="sortReview_f(this)">Most Recent</a>';
    ret+='<a class="dropdown-item" onclick="sortReview_f(this)">Least Recent</a></div>';
    ret+='</div>';

	ret+='</div>';

	ret+='<br><div id="reviewArea_f" class="w-100 row">';
	ret+='<div id="gReview_f" class="w-100 row">';
	ret+='</div>';
	ret+='<div id="yReview_f" class="w-100 row">';
	ret+='</div>';
	ret+='</div>';

	ret+='</div>';

	ret+='</div>';//tab content

	ret+='</div>';

	//Open hour Modal
	if(typeof data.opening_hours !== "undefined"){
		var modal = makeOpenHourModalHTML_f(weekDay, data.opening_hours);
		$('#openhoursPanel_f').html(modal);
	}


	return ret;
	
}

function makeOpenHourModalHTML_f(weekDay, openingTime){
	var ret = "";
	ret+='<div class="modal fade" id="openhoursModal_f" tabindex="-1" role="dialog" aria-labelledby="openhoursModalTitle_f" aria-hidden="true">';
	ret+='<div class="modal-dialog modal-dialog-centered" role="document">';
	ret+='<div class="modal-content">';
	ret+='<div class="modal-header">';
	ret+='<h5 class="modal-title" id="openhoursModalTitle_f">Open hours</h5>';
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



var map_f, panorama_f, marker_f, directionsService_f, directionsDisplay_f;
function drawMap_f(t_lat_f, t_lng_f){
	var uluru_f = {lat: t_lat_f, lng: t_lng_f};

	var mapContent_f = document.getElementById('map_f');
	map_f = new google.maps.Map(mapContent_f, {
		zoom: 18,
		center: uluru_f
	});
	marker_f = new google.maps.Marker({
		position: uluru_f,
		map: map_f
	});


	directionsService_f = new google.maps.DirectionsService;
	directionsDisplay_f = new google.maps.DirectionsRenderer;
	directionsDisplay_f.setMap(map_f);
	var mapResult_f = document.getElementById('mapResult_f');
	directionsDisplay_f.setPanel(mapResult_f);

	mapContent_f.style.display = "block";
}

function switchView_f(btn){
	if($('#map_f').is(':visible')){
		$(btn).html('<img style="width:30px;height:30px;" src="http://cs-server.usc.edu:45678/hw/hw8/images/Map.png"></img>');
		$('#map_f').hide();
		$('#pano_f').show();
		var pano_f = document.getElementById('pano_f');
		var uluru_f = {lat: t_lat_f, lng: t_lng_f};
		panorama_f = new google.maps.StreetViewPanorama( pano_f, {
			position: uluru_f,
			pov: {
				heading: 165,
				pitch: 0
			}
		});
	}else{
		$(btn).html('<img style="width:30px;height:30px;" src="http://cs-server.usc.edu:45678/hw/hw8/images/Pegman.png"></img>');
		$('#pano_f').html("");
		$('#pano_f').hide();
		$('#map_f').show();
	}
}


function getDirection_f(){
	var fromLoc = $('#fromLocation_f').val();
	fromLoc = fromLoc == "My Location" || /^\s*$/.test(fromLoc)? new google.maps.LatLng(CUR_LAT, CUR_LNG): fromLoc;
	var toLoc = new google.maps.LatLng(t_lat_f, t_lng_f);
	var trvlMode = $('#travelMode_f').val();
	//console.log("getDirection_f(): from: "+fromLoc+", to: "+toLoc+ ", with "+ trvlMode);
	marker_f.setMap(null);
	directionsService_f.route({
		origin: fromLoc,
		destination: toLoc,
		travelMode: trvlMode,
		provideRouteAlternatives: true
	}, function(response, status) {
		if (status === 'OK') {
			directionsDisplay_f.setDirections(response);
			//console.log(response);
		} else { window.alert('Directions request failed due to ' + status); }
	});
}



var gArray_f = null;
var yArray_f = null;
function drawReviews_f(gReview, yReview, method){
	// google
	var gHTML = "";
	if(typeof gReview !== "undefined" && gReview != 0 && method == 'Default Order') gArray_f = gReview;
	if(gArray_f != null){
		for(var i = 0; i < gArray_f.length; i++){
			var r = gArray_f[i];
			var row = '<div class="border border-secondary rounded m-2 p-4 d-flex row w-100 justify-content-start">';
			row+='<div class="col-1"><a target="_blank" href="'+r.author_url+'">';
			row+='<img style="width:50px;height:50px;" src="'+ r.profile_photo_url +'" alt="">';
			row+='</a></div>';
			row+='<div class="col-10">';
			row+='<div class="row"><a target="_blank" href="'+r.author_url+'">'+r.author_name+'</a></div>';
			row+='<div class="row"><div id="gR_f'+i+'"></div>'+ convertGoogleTime(r.time)+'</div>';
			row+='<div class="row">'+r.text +'</div>';
			row+='</div>';
			row+='</div>';
			gHTML += row;
		}
	}
	if(gHTML == "") gHTML = '<br><div class="row w-100 alert alert-warning" role="alert">No Records.</div>';
	$('#gReview_f').html(gHTML);

	//Ylep
	var yHTML = "";
	if(typeof yReview !== "undefined" && yReview != 0 && method == 'Default Order') yArray_f = yReview;
	if(yArray_f != null){
		for(var i = 0; i < yArray_f.length; i++){
			var r = yArray_f[i];
			var row = '<div class="border border-secondary rounded m-2 p-4 d-flex row w-100 justify-content-start">';
			row+='<div class="col-1"><a target="_blank" href="'+r.url+'">';
			row+='<img style="width:50px;height:50px;" src="'+ r.user.image_url +'" alt="" class="rounded-circle">';
			row+='</a></div>';
			row+='<div class="col-10">';
			row+='<div class="row"><a target="_blank" href="'+r.url+'">'+r.user.name+'</a></div>';
			row+='<div class="row"><div id="yR_f'+i+'"></div>'+ r.time_created +'</div>';
			row+='<div class="row">'+r.text +'</div>';
			row+='</div>';
			row+='</div>';
			yHTML += row;
		}
	}
	if(yHTML == "") yHTML = '<br><div class="row w-100 alert alert-warning" role="alert">No Records.</div>';
	$('#yReview_f').html(yHTML);

	//draw rating stars
	if(gArray_f != null){
		for(var i = 0; i < gArray_f.length; i++){
			$('#gR_f'+i).rateYo({
				rating: gArray_f[i].rating,
				starWidth: "20px"
			});
		}
	}
	if(yArray_f != null){
		for(var i = 0; i < yArray_f.length; i++){
			$('#yR_f'+i).rateYo({
				rating: yArray_f[i].rating,
				starWidth: "20px"
			});
		}
	}

	$('#yReview_f').hide();
}

var showReviewIn_f = 'Default Order';
function sortReview_f(item){
	var method_f = $(item).html();
	$('#review_dp_sort_btn_f').html(method_f);
	showReviewIn_f = method_f;
	console.log('sortReview_f(item), method: '+method_f);
	if(method_f == 'Heightest Rating'){
		sortArrayByRating(gArray_f, false);
		sortArrayByRating(yArray_f, false);
	}else if(method_f == 'Lowest Rating'){
		sortArrayByRating(gArray_f, true);
		sortArrayByRating(yArray_f, true);
	}else if(method_f == 'Most Recent'){
		sortArrayByTime(gArray_f, 'g', false);
		sortArrayByTime(yArray_f, 'y', false);
	}else if(method_f == 'Least Recent'){
		sortArrayByTime(gArray_f, 'g', true);
		sortArrayByTime(yArray_f, 'y', true);
	}
	// else Default Order
	$('#gReview_f').show();
	$('#gReview_f').show();
	drawReviews_f(googleReview_f, yelpReview_f, method_f);
	$('#review_dp_btn_f').html('Google Reviews');
}

function showGoogleReview_f(){
	//console.log('showGoogleReview_f()');
	$('#review_dp_btn_f').html('Google Reviews');
	$('#yReview_f').hide();
	$('#gReview_f').show();
}

function showYelpReview_f(){
	//console.log('showYelpReview()_f');
	$('#review_dp_btn_f').html('Yelp Reviews');
	$('#gReview_f').hide();
	$('#yReview_f').show();
}

function makePhotoColHTML_f(offset, data){
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
function tabOn_f(tab){
	$(tab).addClass('active').removeClass('text-primary').parent().siblings().children().removeClass('active').addClass('text-primary');
	var index = $(tab).parent().prevAll().length;
	//console.log(index);
	$('#tab_content_f').children().eq(index).show().siblings().hide();
}

function moveToDetail_f(){
	if($('#cornerDetail_btn_f').hasClass('disabled')){
		console.log('button id disabled!');
		return;
	}
	if(curDetail_f == null){
		console.log('curDetail_f == null');
		return;
	}
	console.log("moveToDetail_f()");

	//TODO: angular move to detail
	$('#itemList_f').hide();
	$('#detailInfo_f').show();
}

function moveToList_f(){
	console.log("moveToList_f()");

	//TODO: angular move to list
	$('#detailInfo_f').hide();
	$('#itemList_f').show();
	drawFavoriteTable(cur_page_f);
}

function toTrash(star_btn){
	// toFavorite_f
	console.log("toTrash(star_btn)");
	var row = $(star_btn).parent().parent();

	var d = row[0].id;
	var index = d.substring(0, d.length - 2);
	var key = pageItems_f[index].place_id;
	sessionStorage.removeItem(key);
	drawFavoriteTable(cur_page_f);
}

function itemToTrash(star_btn){
	// itemToFavorite_f inDetail
	console.log("itemToTrash(star_btn)");
	var key = curDetail_f.place_id;
	if(sessionStorage.getItem(key) === null){ //not favorite then add
		$(star_btn).html('<i class="fas fa-star"></i>');
		var JString = JSON.stringify(curDetail_f);
		sessionStorage.setItem(key, JString);
	}else{ // exist then remove
		$(star_btn).html('<i class="far fa-star"></i>');
		sessionStorage.removeItem(key);
	}

}



