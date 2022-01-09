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
            return [data[0].lat, data[0].lon,data[0].name];
        })
        .catch(function (error) {
            displayError("City could not be found.");
            return null;
        });
    return output;
}

async function fetchCityWeather(latLon) {
    let url = `https://api.openweathermap.org/data/2.5/onecall?lat=${latLon[0]}&lon=${latLon[1]}&exclude=hourly,minutely&units=imperial&appid=81997842e5cf7a516e903b9b2c85145e`
    let output = await fetch(url)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            return data;
        });
    return output;
}

async function onSubmit(event) {
    event.preventDefault();
    let location = await fetchCityLocation(searchBar.val());
    let cityWeatherData = "";
    if (location != null) {
        cityWeatherData = await fetchCityWeather(location);
    }
    else {
        return;
    }
    console.log(location);
    console.log(cityWeatherData);
    buildDashboard(location,cityWeatherData);
}

function buildDashboard(city,cityWeather){
    cityMainDisplay.empty();
    
    cityMainDisplay.append(`<h3>${city[2] + moment(cityWeather.current.dt,"X").format(" (MM/DD/YYYY)")}</h3>`);
    cityMainDisplay.append(`<p>Temp: ${cityWeather.current.temp}°F</p>`);
    cityMainDisplay.append(`<p>Wind: ${cityWeather.current.wind_speed}MPH</p>`);
    cityMainDisplay.append(`<p>Humidity: ${cityWeather.current.humidity}%</p>`);
    cityMainDisplay.append(`<p>UV Index: </p>`);

    let weatherIcon = $("<img>");
    weatherIcon.attr("src",`http://openweathermap.org/img/wn/${cityWeather.current.weather[0].icon}.png`);
    cityMainDisplay.children().eq(0).append(weatherIcon);

    let uvDisplay = $("<span>").addClass("px-2 py-1 mx-2 rounded");
    let uvRating = cityWeather.current.uvi;
    uvDisplay.text(uvRating);
    if(uvRating < 3){
        uvDisplay.addClass("text-white favorable");
    }
    else if(uvRating < 6){
        uvDisplay.addClass("text-black moderate");
    }
    else{
        uvDisplay.addClass("text-white severe");
    }
    cityMainDisplay.children().eq(4).append(uvDisplay);
}

function displayError(errorMessage) {
    errorDisplay.text(errorMessage);
    errorDisplay.removeClass("hide");
    setTimeout(function () {
        errorDisplay.addClass("hide");
    }, 2000);
}

init();