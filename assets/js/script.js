// Grabbing page elements.
var searchBar = $("#search-city");
var submitButton = $('#submit-city');
var cityMainDisplay = $('#city-main-display');
var cityForecasts = $('#city-forecast');
var errorDisplay = $('#error-display');

function init() {
    submitButton.on("click", onSubmit);

}

async function fetchCityLocation(city) {
    let url = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=81997842e5cf7a516e903b9b2c85145e`;
    let output = await fetch(url)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            console.log(data);
            return [data[0].lat, data[0].lon];
        })
        .catch(function (error) {
            displayError("City could not be found.");
            return null;
        });
    return output;
}

function fetchCityWeather(latLon) {
    let url = `https://api.openweathermap.org/data/2.5/onecall?lat=${latLon[0]}&lon=${latLon[1]}&exclude=hourly,daily&appid=81997842e5cf7a516e903b9b2c85145e`
    fetch(url)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            console.log(data);
        });
}

async function onSubmit(event) {
    event.preventDefault();
    let location = await fetchCityLocation(searchBar.val());
    if (location != null) {
        fetchCityWeather(location);
    }
    else {
        return;
    }

}

function displayError(errorMessage) {
    errorDisplay.text(errorMessage);
    errorDisplay.removeClass("hide");
    setTimeout(function () {
        errorDisplay.addClass("hide");
    }, 2000);
}

init();