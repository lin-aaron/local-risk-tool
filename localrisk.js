var LRTAPI = 'http://tapscore-dev2.us-west-1.elasticbeanstalk.com/api/ground?lat=';
var lat = 18.220833;
var lon = -66.590149;
var currentLocation;
function Location(lat, lon, data){
	this.lat = lat;
	this.lon = lon;
	this.data = data;
	this.untested = data['untested'];
	this.tested = data['tested'];
	this.non_Detect = data['non_Detect'];
	this.high_risk = data['high_risk'];
	this.total_high_risk = data['total_high_risk'];

	console.log(this.tested);

}
function generateRisk(lat, lon) {
    return LRTAPI + lat + '&lon=' + lon;
}


$('#submit').on('click', function() {
    $.ajax({
        url: generateRisk(lat, lon), //This URL is for Json file
        type: "GET",
        dataType: "json",
        success: function(data) {
            currentLocation = new Location(lat, lon, data);
            $('#ground').append('<p>JSON from link: ' + generateRisk(lat, lon) + '</p>');
            $('#ground').append('<p>Lat: ' + lat + '<p>');
            $('#ground').append('<p>Lon: ' + lon + '</p>');
            
            // $('#ground').append(JSON.stringify(data));
        },
        error: function() {
            //Do alert is error
            window.alert('ERRRORRRORRRRR ajax call from #submit button failed');
        }
    });
});

$(function() {
    $( "#local-risk-container" ).tabs();
  } );