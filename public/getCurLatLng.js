//get current IP
var CUR_LAT = "";
var CUR_LNG = "";

function getLocalLatLon(){
	//console.log("getLocalLatLon()");
	$.get('http://ip-api.com/json', function(resJSON, status){
        //console.log("Data: " + resJSON + "\nStatus: " + status);
        if(status == 'success'){
        	CUR_LAT = resJSON.lat;
			CUR_LNG = resJSON.lon;
			if(CUR_LAT == null || CUR_LNG == null){
				//disable search button
				document.getElementById("mySubmit").disabled = true;
			}else{
				//enable search button
				document.getElementById("mySubmit").disabled = false;
			}
        }else{
        	console.log('Get local lat lng error.');
        	document.getElementById("mySubmit").disabled = true;
        }
        console.log("CUR_LAT: " + CUR_LAT + ",  CUR_LNG: "+ CUR_LNG);
    });
}