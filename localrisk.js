var LRTAPI = 'https://tapscore-dev2.us-west-1.elasticbeanstalk.com/api/ground?lat=';
var lat = 18.220833;
var lon = -66.590149;
var currPlaceAddress = '';
var currentLocation;
var autocomplete;
autocomplete = new google.maps.places.Autocomplete(document.getElementById('autocomplete'), { types: ['geocode'] });
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

function createRiskURL(lat, lon) { return LRTAPI + lat + '&lon=' + lon; }

function updateLatLon() {
    var place = autocomplete.getPlace();
    lat = place.geometry.location.lat();
    lon = place.geometry.location.lng();
    currPlaceAddress = place.formatted_address;
}

function geolocate() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            lat = position.coords.latitude;
            lon = position.coords.longitude;
        });
    }
}

function start() {
    var container = $('#local-risk-container');
    $.when(container.children().fadeOut()).then(function() {
        $('#location').fadeIn();
    })
}

function newPage(current, next, restart) {
    var n = $('#' + next);
    n.siblings('#' + current).fadeOut(function() {
        n.fadeIn();
        if (restart) { $('#restart').fadeIn(); }
    })
}

$('#submit-location').on('click', function() {
    getWellResults();
    newPage('location', 'ground', true);
})

function getWellResults() {
    $.ajax({
        url: createRiskURL(lat, lon), //This URL is for Json file
        type: "GET",
        dataType: "json",
        success: function(data) {
            newPage('source', 'ground', true);
            currentLocation = new Location(lat, lon, data);
            console.log(currentLocation);
            $('#ground-results-header').html('We Found <span class= "bold">' + currentLocation.tested + ' Contaminants</span> Tested Within ~10 Miles of ' + currPlaceAddress);
            var results = $('#ground-results');
            var high = $('#high-risk');

            high.empty().append('<p class="number">' + currentLocation.total_high_risk + '</p><p class="info-text">were found above potentially harmful levels</p>');
            var list = $('<ul>', {});
            currentLocation.high_risk.forEach(function(contam) {
                list.append('<li>' + contam + '</li>');
            })
            high.append(list);
            var medium = $('#medium-risk');
            medium.empty().append('<p class="number">' + (currentLocation.tested - currentLocation.total_high_risk - currentLocation.non_Detect) + '</p><p class="info-text">were found below potentially harmful levels</p>');
            var nonDetect = $('#nonDetect');
            nonDetect.empty().append('<p class="number">' + currentLocation.non_Detect + '</p><p class="info-text">were not detected</p>');

            var untested = $('#untested');
            untested.empty().append('<p class="number">' + currentLocation.untested + '</p><p class="info-text">Tap Score contaminants haven\'t been tested near this address.</p>');

            // Uncomment to show JSON 
            // $('#ground-results').append(JSON.stringify(data));
        },
        error: function() {
            window.alert('ERROR: ajax call from #submit button failed');
        }
    });

}

function getPWSInfoCard(data) {
    return '<p>' + data.pws_name + ' serves ' + data.pop_served + '</p>';
}

function findCounty() {
    var API = 'https://simplewaterdata.com/api/water-system/get?address=&system=pws';
    var country, county, state_code;
    var geocoder = new google.maps.Geocoder();
    var latlng = new google.maps.LatLng(lat, lon);
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
	                $('#pws-results-header').text('Closest Public Water Systems near you:');
	                $('#pws-results').empty();
	                for (var i = 0; i < data.data.data.length && i < 5; i++) {
	                    $('#pws-results').append(getPWSInfoCard(data.data.data[i]));
	                }
	            }
	        });
	    } else {
	        window.alert('Geocoder failed due to: ' + status);
	    }
	newPage('source', 'pws', true);
	});
}

$('#restart').on('click', function() {
    $.when($('#local-risk-container').children().fadeOut()).then(start);
});

start();

// old findCounty stuff : good for reference on how to use navigator in future:
// if (navigator.geolocation) {
//     navigator.geolocation.getCurrentPosition(function(position) {
//         var geocoder = new google.maps.Geocoder();
//         var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
//         geocoder.geocode({ 'location': latlng }, function(results, status) {
//             if (status === 'OK') {
//                 console.log($.inArray('administrative_area_level_2', results[0].address_components[3].types) > -1);
//                 results[0].address_components.forEach(function(component) {
//                     if ($.inArray("administrative_area_level_2", component.types) > -1) {
//                         county = component.short_name;
//                     } else if ($.inArray("country", component.types) > -1) {
//                         country = component.short_name;
//                     } else if ($.inArray("administrative_area_level_1", component.types) > -1) {
//                         state_code = component.short_name;
//                     }
//                 })