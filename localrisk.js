var LRTAPI = 'http://tapscore-dev2.us-west-1.elasticbeanstalk.com/api/ground?lat=';
var lat = 18.220833;
var lon = -66.590149;
var currentLocation;
var autocomplete;

var input = document.getElementById('ground-autocomplete');
autocomplete = new google.maps.places.Autocomplete(input, { types: ['geocode'] });
google.maps.event.addListener(autocomplete, 'place_changed', updateLatLon);

function Location(lat, lon, data) {
    this.lat = lat;
    this.lon = lon;
    this.untested = data.untested;
    this.tested = data.tested;
    this.non_Detect = data.non_detect;
    this.high_risk = data.high_risk;
    this.total_high_risk = data.total_high_risk;
    this.riskURL = createRiskURL(lat, lon);

}

function createRiskURL(lat, lon) {
    return LRTAPI + lat + '&lon=' + lon;
}

function updateLatLon() {
    var place = autocomplete.getPlace();
    lat = place.geometry.location.lat();
    lon = place.geometry.location.lng();
}

$('#submit').on('click', function() {
    $.ajax({
        url: createRiskURL(lat, lon), //This URL is for Json file
        type: "GET",
        dataType: "json",
        success: function(data) {
            currentLocation = new Location(lat, lon, data);
            $('#results-header').text('Showing results from lat: ' + lat + ' lon: ' + lon);
            console.log(currentLocation);
            $('#results').append('<p>Untested: ' + currentLocation.untested + '</p>');
            $('#results').append('<p>Tested: ' + currentLocation.tested + '<p>');
            $('#results').append('<p>Undetected Contaminants: ' + currentLocation.non_Detect + '</p>');
            $('#results').append('<ul>High-risk Contaminants Found: ' + currentLocation.total_high_risk + '</ul>');
            currentLocation.high_risk.forEach(function(contam) {
                $('#results>ul').append('<li>' + contam + '</li>');
            })

            // Uncomment to show JSON 
            // $('#results').append(JSON.stringify(data));
        },
        error: function() {
            //Do alert is error
            window.alert('ERROR: ajax call from #submit button failed');
        }
    });
});

$(function() {
    $("#local-risk-container").tabs();
});