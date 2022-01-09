// Grabbing page elements.
var searchBar = $("#search-city");
var submitButton = $('#submit-city');
var prevButtonDisplay = $('#prev-cities');
var dashBoard = $('#dashboard');
var cityMainDisplay = $('#city-main-display');
var cityForecasts = $('#city-forecast');
var errorDisplay = $('#error-display');

var prevCities = "";

function init() {
    submitButton.on("click", onSubmit);
    if(localStorage.getItem("prevCities") !== null){
        prevCities = JSON.parse(localStorage.getItem("prevCities"));
        for (let i = 0; i < prevCities.length; i++) {
            addPrevSearchButton(prevCities[i]);
            
        }
    }
    else{
        prevCities = [];
    }
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
    
    let length = prevCities.length;
    let remove = "";
    for(let i=0; i<length; i++){
        if(location[2] === prevCities[i][2])
        {
            remove = i;
        }
    }
    if(remove !== ""){
        prevCities.pop(remove);
        prevButtonDisplay.children().eq(remove).remove();
    }
    
    prevCities.push(location);
    addPrevSearchButton(location);
    localStorage.setItem("prevCities", JSON.stringify(prevCities));
    buildDashboard(location,cityWeatherData);
}

function buildDashboard(city,cityWeather){
    dashBoard.removeClass("hide");
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


    for(let i=0; i<5; i++){
        let forcastCard = cityForecasts.children().eq(i);
        let dayData = cityWeather.daily[i];
        forcastCard.empty();

        forcastCard.append(`<h5>${moment(dayData.dt,"X").format(" MM/DD/YYYY")}</h5>`).addClass("pt-1");
        
        let weatherIcon = $("<img>");
        weatherIcon.attr("src",`http://openweathermap.org/img/wn/${dayData.weather[0].icon}.png`);
        forcastCard.append(weatherIcon);
        
        forcastCard.append(`<p>Temp: ${dayData.temp.day}°F</p>`);
        forcastCard.append(`<p>Wind: ${dayData.wind_speed}MPH</p>`);
        forcastCard.append(`<p>Humidity: ${dayData.humidity}%</p>`);
    }
}

function addPrevSearchButton(cityInfo){
    let newButton = $("<button>");
    newButton.attr("type","button");
    newButton.attr("lat",cityInfo[0]);
    newButton.attr("lon",cityInfo[1]);
    newButton.attr("name",cityInfo[2]);
    newButton.addClass("btn btn-light w-100 my-1 text-white gray city-button");
    newButton.text(cityInfo[2]);
    prevButtonDisplay.append(newButton);
}

function displayError(errorMessage) {
    errorDisplay.text(errorMessage);
    errorDisplay.removeClass("hide");
    setTimeout(function () {
        errorDisplay.addClass("hide");
    }, 2000);
}

init();