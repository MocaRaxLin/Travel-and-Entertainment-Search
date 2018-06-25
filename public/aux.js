//UI controller

var invalidKeyword = true;
var invalidLocation = true;

function disableTf(){
	document.getElementById("tf_place").disabled = true;
	checkSearchBtn();
}
function enableTf(){
	document.getElementById("tf_place").disabled = false;
	checkSearchBtn();
}

function resetForm(){
	//console.log("resetForm()");

	invalidKeyword = true;
	invalidLocation = true;
	nearbySearchData = [];
	cur_page = -1;
	t_lat = 0;
	t_lng = 0;
	gArray = null;
	yArray = null;
	curDetail = null;
	detailData = null;

	yelpReview = null;
	googleReview = null;
	showReviewIn = 'Default Order';

	document.getElementById("form").reset();
	document.getElementById("tf_keyword").value = "";
	document.getElementById("tf_dis").value = "";
	document.getElementById("tf_place").value = "";
	document.getElementById("r1").checked = true;
	disableTf();
	document.getElementById("resultArea").innerHTML = "";
	getLocalLatLon();
	checkSearchBtn();
}

function checkSearchBtn(){
	var textfeild = document.getElementById("tf_place");
	document.getElementById("mySubmit").disabled = CUR_LAT == "" || CUR_LNG == "" || invalidKeyword || (!textfeild.disabled && invalidLocation);
}

function checkValidKeyword(){
	//console.log("checkValidKeyword()");
	var input = document.getElementById("tf_keyword");
	var invalid = /^\s*$/.test(input.value);
	if(invalid){
		input.classList.add('is-invalid');
	}else{
		input.classList.remove('is-invalid');
	}
	invalidKeyword = invalid;
	checkSearchBtn();
}

function checkValidPlace(){
	//console.log("checkValidPlace()");
	var input = document.getElementById("tf_place");
	var invalid = /^\s*$/.test(input.value);
	if(invalid){
		input.classList.add('is-invalid');
	}else{
		input.classList.remove('is-invalid');
	}
	invalidLocation = invalid;
	checkSearchBtn();
}

function showResults(){
	console.log("showResults()");
	$('#favorite_btn').removeClass('btn-primary');
	$('#result_btn').addClass('btn-primary');
	$('#favoriteArea').hide();
	$('#resultArea').show();
}

function getTodayWeekDay(){
	var d = new Date();
	return d.getUTCDay() - 1;
}

function convertGoogleTime(time){
	var ret = luxon.DateTime.fromMillis(time*1000).toFormat("yyyy-MM-dd HH:mm:ss");
	return ret;
}


function sortArrayByRating(arr, ascend){
	if(arr == null) return;
	arr.sort(function(a, b){
        var keyA = a.rating;
        var keyB = b.rating;
        var ascAns = keyA - keyB;
        return ascend ? ascAns : -1*ascAns;
    });
}

function sortArrayByTime(arr, type, ascend){
	if(arr == null) return;
	arr.sort(function(a, b){
		var keyA, keyB;
		if(type == 'y'){
			keyA = new Date(a.time_created);
			keyB = new Date(b.time_created);
		}else if(type == 'g'){
			keyA = a.time;
			keyB = b.time;
		}else{
			console.log("unknown type return");
			return;
		}
        var ascAns = keyA - keyB;
        return ascend ? ascAns : -1*ascAns;
    });
}



