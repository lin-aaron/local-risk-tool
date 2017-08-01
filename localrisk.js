var LRTAPI = 'http://tapscore-dev2.us-west-1.elasticbeanstalk.com/api/ground?lat=';
var lat = 18.220833;
var lon = -66.590149;
var JSONResponse;
function generateRisk(lat, lon){
	return LRTAPI + lat + '&lon=' + lon;
}

$('#submit').on('click', function(){
	$.ajax({
	    url: generateRisk(lat, lon), //This URL is for Json file
	    type:"GET",
	    dataType: "json",
	    success: function(data) {
	    	JSONResponse = data;
	        $('#local-risk-container').append('<p>JSON from link: ' +generateRisk(lat,lon) + '</p>');
	        $('#local-risk-container').append('<p>Lat: ' + lat + '<p>');
	        $('#local-risk-container').append('<p>Lon: ' + lon +'</p>');
	        document.getElementById('#local-risk-container').innerHTML(data);
	    }, 
	    error: function() {
	        //Do alert is error
	    }
	});
});
