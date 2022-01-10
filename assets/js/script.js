// Grabbing page elements.
var searchBar = $("#search-city");
var submitButton = $('#submit-city');
var prevButtonDisplay = $('#prev-cities');
var clearButton = $("#remove-cities");
var dashBoard = $('#dashboard');
var cityMainDisplay = $('#city-main-display');
var cityForecasts = $('#city-forecast');
var errorDisplay = $('#error-display');

// Used to store the local storage items.
var prevCities = "";
// Globally stores the value of whether the prev buttons are searching.
var prevButtonRunning = false;

// Runs the setup and adds event listeners to buttons.
function init() {
    submitButton.on("click", onSearch);
    prevButtonDisplay.on("click", "button", onPrevButton);
    clearButton.on("click", "button", clearCities);
    // Makes the buttons of the previously saved cities.
    if (localStorage.getItem("prevCities") !== null) {
        prevCities = JSON.parse(localStorage.getItem("prevCities"));
        clearButton.removeClass("hide");
        for (let i = 0; i < prevCities.length; i++) {
            addPrevSearchButton(prevCities[i]);

        }
    }
    else {
        prevCities = [];
    }
}
// Get the lat and long positions of the inputed city.
async function fetchCityLocation(city) {
    let url = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=81997842e5cf7a516e903b9b2c85145e`;
    // Outputs fetch with an await to be able to run async throughout all the files.
    let output = await fetch(url)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            return [data[0].lat, data[0].lon, data[0].name];
        })
        .catch(function (error) {
            // Runs if it was not able to find a city.
            displayError("City could not be found.");
            return null;
        });
    return output;
}
// Gets the weather date for the lat long inputed in the array.
async function fetchCityWeather(latLon) {
    let url = `https://api.openweathermap.org/data/2.5/onecall?lat=${latLon[0]}&lon=${latLon[1]}&exclude=hourly,minutely&units=imperial&appid=81997842e5cf7a516e903b9b2c85145e`
    // Outputs fetch with an await to be able to run async throughout all the files.
    let output = await fetch(url)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            return data;
        })
        .catch(function (error) {
            // Runs if it was not able to find a city.
            displayError("Weather data could not be pulled at this time.");
            return null;
        });
    return output;
}
// Will get the city lat, long, and weather data, then if sucessful, build the dashboard.
async function onSearch(event) {
    event.preventDefault();
    let location = await fetchCityLocation(searchBar.val());
    let cityWeatherData = "";
    // If the location or the weather data returned an error, it will come as null. So we end the function if either is null, as we have no data to use.
    if (location != null) {
        cityWeatherData = await fetchCityWeather(location);
    }
    else {
        return;
    }

    if (cityWeatherData === null) {
        return;
    }
    // Creates buttons and dashboard.
    enterWeatherData(location, cityWeatherData);
    // Clear the search bar.
    searchBar.val("");
}
// Will get the weather data, using the lat and long saved to the button object, then build the dashboard.
async function onPrevButton(event) {
    // This stops someone spamming the buttons and confusing the program if it takes to long to load.
    if (!prevButtonRunning) {
        prevButtonRunning = true;
        event.preventDefault();
        let location = [$(event.target).attr("lat"), $(event.target).attr("lon"), $(event.target).attr("name")];
        let cityWeatherData = await fetchCityWeather(location);
        //If the weather data returned an error, it will come as null. So we end the function if it is a null, as we have no data to use.
        if (cityWeatherData === null) {
            return;
        }

        enterWeatherData(location, cityWeatherData);
        prevButtonRunning = false;
    }
}
// Creates the buttons and dashboard with the location and weather data.
function enterWeatherData(location, cityWeatherData) {
    // Add the city and cooridnates to local storage (After removing duplicates), and give it a button. 
    removeDups(location);
    prevCities.push(location);
    addPrevSearchButton(location);
    localStorage.setItem("prevCities", JSON.stringify(prevCities));
    // Builds the dashboard with the data.
    buildDashboard(location, cityWeatherData);
}
// Builds the dashboard, using the weather data.
function buildDashboard(city, cityWeather) {
    // Shows the dashboard if it was hidden.
    dashBoard.removeClass("hide");
    // empties the main display of all it's contents.
    cityMainDisplay.empty();

    // Appends all base elements, in order, using regular expressions to put in data.
    cityMainDisplay.append(`<h3>${city[2] + moment(cityWeather.current.dt, "X").format(" (MM/DD/YYYY)")}</h3>`);
    cityMainDisplay.append(`<p>Temp: ${cityWeather.current.temp}°F</p>`);
    cityMainDisplay.append(`<p>Wind: ${cityWeather.current.wind_speed}MPH</p>`);
    cityMainDisplay.append(`<p>Humidity: ${cityWeather.current.humidity}%</p>`);
    cityMainDisplay.append(`<p>UV Index: </p>`);

    // Adds the image icon, and appends to the already created header.
    let weatherIcon = $("<img>");
    weatherIcon.attr("src", `https://openweathermap.org/img/wn/${cityWeather.current.weather[0].icon}.png`);
    cityMainDisplay.children().eq(0).append(weatherIcon);

    // Adds the ux index, giving it a speific class depending on how severe it is. Appends to the last child.
    let uvDisplay = $("<span>").addClass("px-2 py-1 mx-2 rounded");
    let uvRating = cityWeather.current.uvi;
    uvDisplay.text(uvRating);
    if (uvRating < 3) {
        uvDisplay.addClass("text-white favorable");
    }
    else if (uvRating < 6) {
        uvDisplay.addClass("text-black moderate");
    }
    else {
        uvDisplay.addClass("text-white severe");
    }
    cityMainDisplay.children().eq(4).append(uvDisplay);

    // Loops through the children of the forcast display, and adds the data and images accordingly.
    for (let i = 0; i < 5; i++) {
        let forcastCard = cityForecasts.children().eq(i);
        let dayData = cityWeather.daily[i+1];
        forcastCard.empty();

        forcastCard.append(`<h5>${moment(dayData.dt, "X").format(" MM/DD/YYYY")}</h5>`).addClass("pt-1");

        let weatherIcon = $("<img>");
        weatherIcon.attr("src", `https://openweathermap.org/img/wn/${dayData.weather[0].icon}.png`);
        forcastCard.append(weatherIcon);

        forcastCard.append(`<p>Temp: ${dayData.temp.day}°F</p>`);
        forcastCard.append(`<p>Wind: ${dayData.wind_speed}MPH</p>`);
        forcastCard.append(`<p>Humidity: ${dayData.humidity}%</p>`);
    }
}
// Add a button holding the lat, long, and name of a previously used city.
function addPrevSearchButton(cityInfo) {
    let newButton = $("<button>");
    newButton.attr("type", "button");
    newButton.attr("lat", cityInfo[0]);
    newButton.attr("lon", cityInfo[1]);
    newButton.attr("name", cityInfo[2]);
    newButton.addClass("btn btn-light w-100 my-1 text-white gray city-button");
    newButton.text(cityInfo[2]);
    prevButtonDisplay.append(newButton);
    // Shows the clear button if it was hidden.
    clearButton.removeClass("hide");
}
// Removes duplicate cities from the previous city list, and the button created to represent it.
function removeDups(location) {
    let length = prevCities.length;
    let remove = "";
    for (let i = 0; i < length; i++) {
        if (location[2] === prevCities[i][2]) {
            prevCities.splice(i, 1);
            prevButtonDisplay.children().eq(i).remove();
            break;
        }
    }
}
// Removes all buttons, and saved city data, including local stoarge.
function clearCities(event) {
    event.preventDefault();
    prevCities = [];
    prevButtonDisplay.empty();
    localStorage.removeItem("prevCities");
    clearButton.addClass("hide");
}
// Display a short error message under the search button.
function displayError(errorMessage) {
    errorDisplay.text(errorMessage);
    errorDisplay.removeClass("hide");
    setTimeout(function () {
        errorDisplay.addClass("hide");
    }, 2000);
}

// Runs the setup.
init();