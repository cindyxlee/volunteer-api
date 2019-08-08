'use strict';

let map;
const apiURL = 'https://api.eventful.com/json/events/search?keywords=volunteer';
const apiKey = 'f2G3vcVXQmfbbTGG';

function initMap() {
    console.log(`initMap ran`);

    const latlng = new google.maps.LatLng(34.0522, -118.2437);
    const mapOptions = {
        zoom: 8,
        center: latlng
    }
    map = new google.maps.Map(document.getElementById('map'), mapOptions);
}

function timeConversion(time) {
    console.log(`timeConversion ran`);

    return moment(time).format('MMMM Do YYYY, h:mm a');
}

function showMapMarkers(responseJson) {
    console.log(`showMapMarkers ran`);

    let mapData = responseJson.events.event;
    let bounds = new google.maps.LatLngBounds();

    for (let i = 0; i < mapData.length; i++) {
        let eventURL = mapData[i].url;
        let eventTitle = mapData[i].title;
        let eventStart = timeConversion(mapData[i].start_time);
        let eventVenue = mapData[i].venue_name;
        let eventDescription = mapData[i].description;
        let eventLat = mapData[i].latitude;
        let eventLong = mapData[i].longitude;
        let latlng = new google.maps.LatLng(mapData[i].latitude, mapData[i].longitude);

        newMapMarkers(latlng, title, eventVenue);

        bounds.extend(latlng);
    }
    map.fitBounds(bounds);
}

function newMapMarkers(latlng, title, eventVenue) {
    console.log(`newMapMarkers ran`);

    const marker = new google.maps.Marker({
        map: map,
        position: latlng,
        title: title,
        animation: google.maps.Animation.DROP
    });

    const clicked = false;

    google.maps.event.addListener(marker, "mouseover", function (e) {
        if (!clicked) {
            const showInfo = `<div>${title}<br>${eventVenue}</div>`;
            infoWindow.setContent(popUpContent);
            infoWindow.open(map, marker);
        }
    });
    google.maps.event.addListener(marker, "mouseout", function (e) {
        if (!clicked) {
            infoWindow.close();
        }
    });
}

function initializeMap(responseJson) {
    console.log(`initializeMap ran`);

    const mapOptions = {
        center: new google.maps.LatLng(34.0522, -118.2437),
        zoom: 8,
        mapTypeId: 'roadmap',
    }

    map = new google.maps.Map(document.getElementById('map'), mapOptions);

    infoWindow = new google.maps.InfoWindow();

    google.maps.event.addListener(map, 'click', function () {
        infoWindow.close();
    });

    showMapMarkers(responseJson);
}

function revealMap() {
    console.log(`revealMap ran`);

    $('.search-button').on('click', function () {
        $('#map').show();
    });
}

function eventSearch() {
    console.log(`eventSearch ran`);

    $('.search-results').html('');
    $('#map').html('');
    $('.search-results').show();
}

function formatQueryParams(params) {
    console.log(`formatQueryParams ran`);
    const queryItems = Object.keys(params).map(key => `${[encodeURIComponent(key)]}=${encodeURIComponent(params[key])}`);
    return queryItems.join('&');
}

function displayResults(responseJson, maxResults = 10) {
    console.log(`displayResults ran`);
    console.log(responseJson);

    initializeMap(repsonseJson);

    $('#results-list').empty();

    if (responseJson.total_items === 0) {
        $('#results-list').append(`<p class="no-results">No events found, please try a different location.</p>`)
    } else {
        for (let i = 0; i < responseJson.events.event.length & i < maxResults; i++) {
            $('#results-list').append(`<li class="result-display"><h3><a href="${responseJson.events.event[i].url}">${responseJson.events.event[i].title}</a></h3>
      <p class="result-time">${timeConversion(responseJson.events.event[i].start_time)}</p>
      <p class="result-venue">${responseJson.events.event[i].venue_name}</p>
      <p class="result-description">${responseJson.events.event[i].description}</p></li>`);
        }
        $('#search-results').removeClass('hidden');
    }
}

function getEvents(userLoc) {
    console.log(`getEvents ran`);

    const params = {
        location: userLoc,
    };
    const queryString = formatQueryParams(params);
    const url = apiURL + '&' + queryString + '&app_key=' + apiKey;
    console.log(url);

    fetch(url)
        .then(response => {
            console.log(`this is okay too`)
            if (response.ok) {
                console.log(`response ok`);
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => displayResults(responseJson))
        .catch(err => {
            $('#js-error-message').text(`Something went wrong: ${err.message}`);
        });
}

function watchForm() {
    console.log(`watchForm ran`);

    $('form').submit(event => {
        event.preventDefault();
        let userLoc = $('#js-search-loc').val();
        getEvents(userLoc);
    });

    revealMap();
}

$(watchForm);