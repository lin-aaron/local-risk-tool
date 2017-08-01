var LRTAPI = 'http://tapscore-dev2.us-west-1.elasticbeanstalk.com/api/ground?lat=';
var lat = 18.220833;
var lon = -66.590149;
var currentLocation;
var groundAutocomplete;
var pwsAutocomplete;
groundAutocomplete = new google.maps.places.Autocomplete(document.getElementById('ground-autocomplete'), { types: ['geocode'] });
google.maps.event.addListener(groundAutocomplete, 'place_changed', updateLatLon);
// pwsAutocomplete = new google.maps.places.Autocomplete(document.getElementById('pws-autocomplete'), { types: ['geocode'] });
// google.maps.event.addListener(pwsAutocomplete, 'place_changed', updateLatLon);

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
    var place = groundAutocomplete.getPlace();
    lat = place.geometry.location.lat();
    lon = place.geometry.location.lng();
}

function geolocate() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            lat = position.coords.latitude;
            lon = position.coords.longitude;
        });
    }
}

$('#ground-locate').on('click', function() {
    geolocate();
    $('#ground-autocomplete').text()
});

$('#ground-submit').on('click', function() {
    $.ajax({
        url: createRiskURL(lat, lon), //This URL is for Json file
        type: "GET",
        dataType: "json",
        success: function(data) {
            currentLocation = new Location(lat, lon, data);
            $('#ground-results-header').text('Showing results from lat: ' + lat + ' lon: ' + lon);
            console.log(currentLocation);
            $('#ground-results').empty();
            $('#ground-results').append('<p>Untested: ' + currentLocation.untested + '</p>');
            $('#ground-results').append('<p>Tested: ' + currentLocation.tested + '<p>');
            $('#ground-results').append('<p>Undetected Contaminants: ' + currentLocation.non_Detect + '</p>');
            $('#ground-results').append('<ul>High-risk Contaminants Found: ' + currentLocation.total_high_risk + '</ul>');
            currentLocation.high_risk.forEach(function(contam) {
                $('#ground-results>ul').append('<li>' + contam + '</li>');
            })

            // Uncomment to show JSON 
            // $('#ground-results').append(JSON.stringify(data));
        },
        error: function() {
            //Do alert is error
            window.alert('ERROR: ajax call from #submit button failed');
        }
    });
});

$('#pws-locate').on('click', function() {
    findCounty();
});

function findCounty() {
    var API = 'https://simplewaterdata.com/api/water-system/get?address=&system=pws';
    var country, county, state_code;
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var geocoder = new google.maps.Geocoder();
            var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            geocoder.geocode({ 'location': latlng }, function(results, status) {
                if (status === 'OK') {
                    console.log($.inArray('administrative_area_level_2', results[0].address_components[3].types) > -1);
                    results[0].address_components.forEach(function(component) {
                        if ($.inArray("administrative_area_level_2", component.types) > -1) {
                            county = component.short_name;
                        } else if ($.inArray("country", component.types) > -1) {
                            country = component.short_name;
                        } else if ($.inArray("administrative_area_level_1", component.types) > -1) {
                            state_code = component.short_name;
                        }
                    })
                    $.ajax({
                        url: API + '&country=' + country + '&county=' + county + '&state_code=' + state_code,
                        type: "GET",
                        dataType: "json",
                        success: function(data) {
                            $('#pws-results.header').text('Closest Public Water Systems near you:');
                            $('#pws-results').empty();
                            for (var i = 0; i < data.data.data.length && i < 5; i++) {
                                $('#pws-results').append(PWSInfoCard(data.data.data[i]));
                            }
                        }
                    });
                } else {
                    window.alert('Geocoder failed due to: ' + status);
                }
            });
        });
    }
}

// $('#pws-submit').on('click ', function(county, state_code, country) {

// });

function PWSInfoCard(data) {
    return '<p>' + data.pws_name + ' serves ' + data.pop_served + '</p>';
}

$(function() {
    $("#local-risk-container").tabs();
});