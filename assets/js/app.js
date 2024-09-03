let currentLocation = document.querySelector("#currentLocation");
/////////////////////////////////////
// Get Current Longitude and Latitude
////////////////////////////////////

currentLocation.addEventListener("click", () => {
    if (navigator.geolocation)
        navigator.geolocation.getCurrentPosition((location) => {
            currentWeather(`https://api.openweathermap.org/data/2.5/weather?lat=${location.coords.latitude}&lon=${location.coords.longitude}&appid=453a343814df442e692a139f23ee4314&units=metric`)

        }, (error) => {
            console.log(error.message)
        })
})

/////////////////////////////////////
// Auto Complete API
////////////////////////////////////
const url = 'https://wft-geo-db.p.rapidapi.com/v1/geo/cities?minPopulation=30000&limit=4&namePrefix=';
const options = {
    method: 'GET',
    headers: {
        'x-rapidapi-key': 'dd70bd2fbfmsh6e2d5fa9ecb1859p1c49a8jsn59a7310a08cd',
        'x-rapidapi-host': 'wft-geo-db.p.rapidapi.com'
    }
};

async function autoCompleteapi(city) {
    try {
        const response = await fetch(url + city, options);
        const result = await response.json();
        return (result.data);
    } catch (error) {
        console.error(error);
    }
}


let searchField = document.querySelector(".searchField");
let autoCompleteUL = document.querySelector(".autoCompleteUL");
let searchButton = document.querySelector(".fa-circle-chevron-right");
let starter_page = document.querySelector("#starter_page");
let section = document.querySelector("section");


//////////////// Search Button and enter button event listener /////////////////////


searchButton.addEventListener("click", (e) => {
    searchField.focus()
    console.log(searchField.value)
    currentWeather(`https://api.openweathermap.org/data/2.5/weather?q=${searchField.value}&appid=453a343814df442e692a139f23ee4314&units=metric`)
    autoCompleteUL.innerHTML = "";
    searchField.style.borderRadius = "20px";
})
searchField.addEventListener("keypress", (e) => {
    if (e.code === "Enter") {
        console.log(searchField.value)
        currentWeather(`https://api.openweathermap.org/data/2.5/weather?q=${searchField.value}&appid=453a343814df442e692a139f23ee4314&units=metric`)
        autoCompleteUL.innerHTML = "";
        searchField.style.borderRadius = "20px";
    }
})

///////////////////////////////////////

let debounceTimeout;

searchField.addEventListener("input", () => {
    clearTimeout(debounceTimeout);

    let query = searchField.value;

    if (query.length < 3) {
        autoCompleteUL.innerHTML = "";
        searchField.style.borderRadius = "20px";
    }

    debounceTimeout = setTimeout(() => {
        if (query.length > 3) {

            autoCompleteUL.innerHTML = "";
            autoCompleteapi(query).then((results) => {

                results.forEach(result => {
                    let autoLI = document.createElement("li");
                    let autoDiv = document.createElement("div");
                    let autoSpan = document.createElement("span");
                    let autoImg = document.createElement("img");
                    autoDiv.innerText = result.city;
                    autoSpan.innerText = `${result.region} ${result.countryCode}`
                    autoSpan.classList.add("sizer")
                    autoImg.src = "/assets/weather_icons/location.png"
                    autoLI.appendChild(autoImg)
                    autoLI.appendChild(autoDiv)
                    autoDiv.appendChild(autoSpan)
                    autoCompleteUL.appendChild(autoLI);
                    searchField.style.borderRadius = "20px 20px 0px 0px";

                    // click event

                    autoLI.addEventListener("click", () => {
                        autoCompleteUL.innerHTML = "";
                        searchField.style.borderRadius = "20px";
                        currentWeather(`https://api.openweathermap.org/data/2.5/weather?lat=${result.latitude}&lon=${result.longitude}&appid=453a343814df442e692a139f23ee4314&units=metric`)

                    })

                });
            })
        }
    }, 300);
})

/////////////////////////////////////
// Current data
////////////////////////////////////

let currentDate = document.querySelector("#location .date");

const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const today = new Date();
let month = months[today.getMonth()];
let date = today.getDate();
let day = weekday[today.getDay()];
currentDate.innerText = `${day} ${date} ${month}`

/////////////////////////////////////
// Date Format
////////////////////////////////////

function dateFormat(day) {
    let year = day.getFullYear();
    let month = (day.getMonth() + 1).toString().padStart(2, "0");
    let date = day.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${date}`;
}

/////////////////////////////////////
// Weather API
////////////////////////////////////

let currentTemp = document.querySelector(".currentDegree .degree");
let currentWeatherType = document.querySelector(".currentDegree .weatherType");
let currentWeatherImg = document.querySelector(".currentWeatherImg");
let locationCity = document.querySelector("#location .city");
let current_stats_max = document.querySelector(".current-stats-max");
let current_stats_min = document.querySelector(".current-stats-min");
let current_stats_rain = document.querySelector(".current-stats-rain");
let current_stats_feelsLike = document.querySelector(".current-stats-feelsLike");
let current_stats_sunrise = document.querySelector(".current-stats-sunrise");
let current_stats_sunset = document.querySelector(".current-stats-sunset");

//////////////////////////////////


async function currentWeather(api) {
    try {
        const current_response = await fetch(api);
        const currentResult = await current_response.json();
        console.log(currentResult.name);
        const days_response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${currentResult.coord.lat}&lon=${currentResult.coord.lon}&appid=453a343814df442e692a139f23ee4314&units=metric`);
        const daysResult = await days_response.json();

        // Starter page //
        starter_page.style.transform = "translateY(100%)"
        section.style.transform = "translateX(0%)"

        autoCompleteUL.innerHTML = "";
        searchField.style.borderRadius = "20px";

        // header//
        searchField.value = currentResult.name;
        locationCity.innerText = currentResult.name;
        //current temp //
        currentTemp.innerText = `${Math.floor(currentResult.main.temp)}°`;
        // currunt weather type and image
        currentWeatherType.innerText = weatherType(currentResult.weather[0].icon);
        currentWeatherImg.src = weatherImg(currentResult.weather[0].icon);
        //today max min //
        let today_max_min = minMaxTemp(dateFormat(today), daysResult.list);
        current_stats_max.innerText = `${today_max_min[0]}°`;
        current_stats_min.innerText = `${today_max_min[1]}°`;
        //Rain //
        current_stats_rain.innerText = `${Math.floor(rainCal(daysResult.list))}%`;
        //feels like//
        current_stats_feelsLike.innerText = `${Math.floor(currentResult.main.feels_like)}°`;
        //current sunrise and sunset
        let finalSunTime = sunrise_set_cal(currentResult.timezone, currentResult.sys.sunrise, currentResult.sys.sunset);
        current_stats_sunrise.innerText = `${finalSunTime[0]}`;
        current_stats_sunset.innerText = `${finalSunTime[1]}`;


        hoursDetail(daysResult.list)

        next_5_days(daysResult.list);


    } catch (error) {
        console.error(error);
    }
}


/////////////////////////////////////
// Weather Conditions
////////////////////////////////////

function weatherImg(iconCode) {

    if (iconCode === "01d") {
        return "/assets/weather_icons/01d.png"
    } else if (iconCode === "01n") {
        return "/assets/weather_icons/01n.png"
    } else if (iconCode === "02d") {
        return "/assets/weather_icons/02d.png"
    } else if (iconCode === "02n") {
        return "/assets/weather_icons/02n.png"
    } else if (iconCode === "03d" || iconCode == "03n") {
        return "/assets/weather_icons/03d.png"
    } else if (iconCode === "04d" || iconCode == "04n") {
        return "/assets/weather_icons/04d.png"
    } else if (iconCode === "09d" || iconCode == "09n") {
        return "/assets/weather_icons/09d.png"
    } else if (iconCode === "10d") {
        return "/assets/weather_icons/10d.png"
    } else if (iconCode === "10n") {
        return "/assets/weather_icons/10n.png"
    } else if (iconCode === "11d" || iconCode == "11n") {
        return "/assets/weather_icons/11d.png"
    } else if (iconCode === "13d" || iconCode == "13n") {
        return "/assets/weather_icons/13d.png"
    } else if (iconCode === "50d" || iconCode == "50n") {
        return "/assets/weather_icons/50d.png"
    } else {
        return "/assets/weather_icons/02d.png"
    }
}


function weatherType(iconCode) {

    if (iconCode === "01d" || iconCode == "01n") {
        return "Clear Sky"
    } else if (iconCode === "02d" || iconCode == "02n") {
        return "Few Clouds"
    } else if (iconCode === "03d" || iconCode == "03n") {
        return "Some Clouds"
    } else if (iconCode === "04d" || iconCode == "04n") {
        return "Mostly Cloudy"
    } else if (iconCode === "09d" || iconCode == "09n") {
        return "Light Rain"
    } else if (iconCode === "10d" || iconCode == "10n") {
        return "Rain"
    } else if (iconCode === "11d" || iconCode == "11n") {
        return "Thunderstorm"
    } else if (iconCode === "13d" || iconCode == "13n") {
        return "Snow"
    } else if (iconCode === "50d" || iconCode == "50n") {
        return "Fog"
    } else {
        return "Mostly Sunny"
    }
}

/////////////////////////////////////
// Min Max Temp
////////////////////////////////////

function minMaxTemp(date, tempDeta) {

    let max_temp = [];
    let min_temp = [];
    tempDeta.forEach(singalData => {
        let data_date = singalData.dt_txt.split(" ")[0];
        if (data_date === date) {
            max_temp.push(Math.floor(singalData.main.temp_max));
            min_temp.push(Math.floor(singalData.main.temp_min));

        }
    });
    let max = Math.max(...max_temp);
    let min = Math.min(...min_temp);
    return [max, min];

}
/////////////////////////////////////
// Today Rain Calculate
////////////////////////////////////
function rainCal(object) {

    let todayDate = dateFormat(today)
    let totalRain = [];
    object.forEach(data => {
        let date = data.dt_txt.split(" ")[0];
        if (date == todayDate) {
            totalRain.push(data.pop);
        }
    })

    return (totalRain.reduce((sum, pop) => sum + pop, 0) / totalRain.length) * 100;

}

/////////////////////////////////////
//  Sunrise and sunset
////////////////////////////////////

function sunrise_set_cal(timezone, sunrise, sunset) {

    let finalSunrise = moment.utc(sunrise, 'X').add(timezone, 'seconds').format('HH:mm');
    let finalSunset = moment.utc(sunset, 'X').add(timezone, 'seconds').format('HH:mm');

    return [finalSunrise, finalSunset]
}

/////////////////////////////////////
//  hours card Detail
////////////////////////////////////
let hourCard_Time = document.querySelectorAll(".hourCard_Time");
let hourCard_Img = document.querySelectorAll(".hourCard_Img");
let hourCard_Temp = document.querySelectorAll(".hourCard_Temp");

///////////////////////////////////

function hoursDetail(data) {

    let time = [];
    let icon = [];
    let temp = [];

    data.forEach(object => {
        time.push(object.dt_txt.split(" ")[1]);
        icon.push(object.weather[0].icon);
        temp.push(Math.floor(object.main.temp));

    })

    for (let i = 0; i < 6; i++) {
        hourCard_Time[i].innerText = timeConverter(time[i]);
        hourCard_Img[i].src = weatherImg(icon[i]);
        hourCard_Temp[i].innerText = `${temp[i]}°`;

    }

}

/////////////////////////////////////
//  Time Converter 10:00:00 => 10 am
////////////////////////////////////

function timeConverter(time) {
    let [h, m, s] = time.split(":")
    let hour = parseInt(h)
    let formet = hour >= 12 ? "pm" : "am";
    let final = hour % 12 || 12
    return `${final} ${formet}`
}

/////////////////////////////////////
//  Next 5 days
////////////////////////////////////
let dayCard_day = document.querySelectorAll(".dayCard_day");
let dayCard_date = document.querySelectorAll(".dayCard_date");
let dayCard_Img = document.querySelectorAll(".dayCard_Img");
let dayCard_maxTemp = document.querySelectorAll(".dayCard_maxTemp");
let dayCard_minTemp = document.querySelectorAll(".dayCard_minTemp");
let dayCard_rain = document.querySelectorAll(".dayCard_rain");
let dayCard_wind = document.querySelectorAll(".dayCard_wind");

//////////////////////////////////
const weeks = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function next_5_days(object) {

    let day = [];
    let fullDate = [];
    let formatDate = [];
    let minMax = [];


    for (let i = 1; i < 6; i++) {
        let day5 = new Date();
        day5.setDate(today.getDate() + i);
        day.push(weeks[date_5_days_formet(day5)[0]]);
        fullDate.push(date_5_days_formet(day5)[1]);
        formatDate.push(dateFormat(day5));
        minMax.push(minMaxTemp(dateFormat(day5), object));

    }

    for (let i = 0; i < 5; i++) {
        dayCard_day[i].innerText = day[i];
        dayCard_date[i].innerText = fullDate[i];
        dayCard_maxTemp[i].innerText = `${minMax[i][0]}°`;
        dayCard_minTemp[i].innerText = `${minMax[i][1]}°`;


        let iconArr = [];
        let totalRain = [];
        let wind = [];

        object.forEach(data => {
            let date = data.dt_txt.split(" ")[0];
            if (date == formatDate[i]) {
                iconArr.push(data.weather[0].icon);
                totalRain.push(data.pop);
                wind.push(data.wind.speed)
            }
        })

        let newarr = []

        for (let i = 0; i < iconArr.length; i++) {
            let dod = iconArr[i].split("d")[0];
            newarr.push(Math.max(dod.split("n")[0]));
        }

        let maxNum = Math.max(...newarr);
        let finalImg = maxNum.toString().padStart(2, "0").padEnd(3, "d");
        dayCard_Img[i].src = `/assets/weather_icons/${finalImg}.png`;


        let rainAvg = (totalRain.reduce((sum, pop) => sum + pop, 0) / totalRain.length) * 100;
        dayCard_rain[i].innerText = `${Math.floor(rainAvg)}%`


        let finalWindSpeed = Math.floor(Math.max(...wind) * 3.6)
        dayCard_wind[i].innerText = `${finalWindSpeed}kph`
    }

}

function date_5_days_formet(day) {
    let year = day.getFullYear();
    let month = (day.getMonth() + 1);
    let date = day.getDate();
    let days = day.getDay()
    return [days, `${date}/${month}`];
}











