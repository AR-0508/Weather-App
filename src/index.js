import "./styles.css";

const weatherIcons = {
    "clear-day": "☀️",
    "clear-night": "🌙",
    "partly-cloudy-day": "🌤️",
    "partly-cloudy-night": "☁️",
    "cloudy": "☁️",
    "rain": "🌧️",
    "showers-day": "🌦️",
    "showers-night": "🌧️",
    "thunder-rain": "⛈️",
    "thunder-showers-day": "⛈️",
    "thunder-showers-night": "⛈️",
    "snow": "❄️",
    "snow-showers-day": "🌨️",
    "snow-showers-night": "🌨️",
    "fog": "🌫️",
    "wind": "💨"
};

const API_KEY = "YOUR_API_KEY";

const header = document.querySelector(".header");
const weatherContainer = document.querySelector(".weather-container");

const forecastDays = document.querySelectorAll(".forecast-day");
const searchForm = document.querySelector(".search-form");
const locationInput = document.querySelector("#location-input");
const unitBtns = document.querySelectorAll(".unit-button");

const loading = document.querySelector("#loading");
const errorMessage = document.querySelector("#error-message");

let currentWeatherData;

async function getWeatherData(location){
    const responseObject = await fetch(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}?unitGroup=metric&key=${API_KEY}&contentType=json`);      //returns Response Object

    if(responseObject.ok === false)
    throw new Error(`Unable to find weather data for ${location}.Please enter a valid location`);

    const weatherData = await responseObject.json();        //returns a promise,then JSON string, then ultimately, a JS object
    
    return weatherData;
}

function processWeatherData(weatherData){
    const unformattedDate = new Date(weatherData.days[0].datetime);
    
    const weekday = unformattedDate.toLocaleDateString('en-US', { weekday: 'long' });
    const currentDate = new Intl.DateTimeFormat('en-US').format(unformattedDate);

    return{
        location : weatherData.address,

        forecast : weatherData.days.slice(0, 7).map((day) => {
            const previousDate = new Date(day.datetime);

            const forecastDay = previousDate.toLocaleDateString('en-US', { weekday: 'long' });
            const forecastDate = new Intl.DateTimeFormat('en-US').format(previousDate);

            return {
                date : forecastDate,
                day : forecastDay,
                temperature : String(day.temp.toFixed(0)),
                maxTemp : String(day.tempmax.toFixed(0)),
                minTemp : String(day.tempmin.toFixed(0)),
                precipitation : day.precip,
                humidity : day.humidity,
                wind : day.windspeed,
                icon : day.icon,
                condition : day.conditions,
                description : day.description
            };
        }),
    };
}

function renderWeather(processedWeatherData){
    const locationName = document.querySelector("#location-name");

    const currentTemp = document.querySelector("#current-temperature");
    const precipitation = document.querySelector("#precipitation");
    const humidity = document.querySelector("#humidity");
    const wind = document.querySelector("#wind");
    const currentWeatherIcon = document.querySelector("#current-weather-icon");
    
    const selectedDay = document.querySelector("#selected-day");
    const selectedDate = document.querySelector("#selected-date");
    const currentConditions = document.querySelector("#current-condition");

    const dayName = document.querySelectorAll(".forecast-day h3");
    const forecastIcon = document.querySelectorAll(".forecast-icon");
    const maxTemp = document.querySelectorAll(".maxTemp")
    const minTemp = document.querySelectorAll(".minTemp");

    const dailySummary = document.querySelector("#daily-summary");

    locationName.textContent = processedWeatherData.location.toUpperCase();

    for(let i = 0; i < processedWeatherData.forecast.length; i++){

    if(forecastDays[i].classList.contains("active")){
    currentTemp.textContent = processedWeatherData.forecast[i].temperature;

    if(!processedWeatherData.forecast[i].precipitation)
    precipitation.textContent = '0%';
    else
    precipitation.textContent = `${processedWeatherData.forecast[i].precipitation}%`;

    humidity.textContent = `${processedWeatherData.forecast[i].humidity}%`;
    wind.textContent = `${processedWeatherData.forecast[i].wind} km/h`;
    currentWeatherIcon.textContent = weatherIcons[processedWeatherData.forecast[i].icon] || "🌤️";

    selectedDay.textContent = processedWeatherData.forecast[i].day;
    selectedDate.textContent = processedWeatherData.forecast[i].date;
    currentConditions.textContent = processedWeatherData.forecast[i].condition;
    }

    if(i === 0)
    dayName[i].textContent = "Today";
    else
    dayName[i].textContent = processedWeatherData.forecast[i].day;

    forecastIcon[i].textContent = weatherIcons[processedWeatherData.forecast[i].icon] || "🌤️";
    maxTemp[i].textContent = `${processedWeatherData.forecast[i].maxTemp}°`;
    minTemp[i].textContent = `${processedWeatherData.forecast[i].minTemp}°`;

    if(forecastDays[i].classList.contains("active"))
    dailySummary.textContent = processedWeatherData.forecast[i].description;
    }
}

function convertCtoF(currentWeatherData){
    for(let i = 0; i < currentWeatherData.forecast.length; i++){
    currentWeatherData.forecast[i].temperature = String( Number( ((currentWeatherData.forecast[i].temperature * 9 / 5) + 32)).toFixed(0) );
    currentWeatherData.forecast[i].maxTemp = String( Number( ((currentWeatherData.forecast[i].maxTemp * 9 / 5) + 32)).toFixed(0) );
    currentWeatherData.forecast[i].minTemp = String( Number( ((currentWeatherData.forecast[i].minTemp * 9 / 5) + 32)).toFixed(0) );
    }
}

function convertFtoC(currentWeatherData){
     for(let i = 0; i < currentWeatherData.forecast.length; i++){
      currentWeatherData.forecast[i].temperature = String( Number( ((currentWeatherData.forecast[i].temperature - 32) * 5 / 9)).toFixed(0) );
      currentWeatherData.forecast[i].maxTemp = String( Number( ((currentWeatherData.forecast[i].maxTemp - 32) * 5 / 9)).toFixed(0) );
      currentWeatherData.forecast[i].minTemp = String( Number( ((currentWeatherData.forecast[i].minTemp - 32) * 5 / 9)).toFixed(0) );
      }
}

searchForm.addEventListener("submit", (e) => {
    e.preventDefault();

    errorMessage.classList.add("hidden");
    weatherContainer.classList.add("hidden");
    loading.classList.remove("hidden");

    getWeatherData(locationInput.value).then((weatherData) => {
        const processedWeatherData = processWeatherData(weatherData);
        currentWeatherData = processedWeatherData;
        
        renderWeather(currentWeatherData);
        loading.classList.add("hidden");
        header.classList.add("weather-mode");
        weatherContainer.classList.remove("hidden");
    })
    .catch(() => {
        loading.classList.add("hidden")
        weatherContainer.classList.add("hidden");
        header.classList.add("weather-mode");

        errorMessage.classList.remove("hidden");
        errorMessage.textContent = `Unable to find weather data for "${locationInput.value}". Please enter a valid location.`;
    });
});

unitBtns.forEach((unitBtn) => {
    unitBtn.addEventListener("click", (e) => {
        if(!currentWeatherData)
        return;

        if(e.currentTarget.classList.contains("active"))
        return;

        unitBtns.forEach((btn) => {
        if(btn !== e.currentTarget)
        btn.classList.remove("active");
        });

        if(e.currentTarget.dataset.unit === "fahrenheit")
        convertCtoF(currentWeatherData);

        else
        convertFtoC(currentWeatherData);

        e.currentTarget.classList.add("active");
        renderWeather(currentWeatherData);
    })
});

forecastDays.forEach((forecastDay) => {
    forecastDay.addEventListener("click", (e) => {
        e.currentTarget.classList.add("active");

        forecastDays.forEach((day) => {
            if(day !== e.currentTarget)
            day.classList.remove("active");
        });

        renderWeather(currentWeatherData);
    });
});