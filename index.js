'use strict';

const apiURL = 'http://api.eventful.com/json/events/search?keywords=volunteer';
const apiKey = 'f2G3vcVXQmfbbTGG';

function formatQueryParams(params) {
    console.log(`formatQueryParams ran`);
    const queryItems = Object.keys(params).map(key => `${[encodeURIComponent(key)]}=${encodeURIComponent(params[key])}`);
    return queryItems.join('&');
}

function displayResults(responseJson, maxResults = 10) {
    console.log(`displayResults ran`);
    console.log(responseJson);

    $('#results-list').empty();

    if (responseJson.total_items === 0) {
        $('#results-list').append(`<p class="no-results">No events found, please try a different location.</p>`)
    } else {
        for (let i = 0; i < responseJson.events.event.length & i < maxResults; i++) {
            $('#results-list').append(`<li class="result-display"><h3><a href="${responseJson.events.event[i].url}">${responseJson.events.event[i].title}</a></h3>
      <p class="result-time">${responseJson.events.event[i].start_time}</p>
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
}

$(watchForm);