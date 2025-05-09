// https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=903507f17d707fecd352d38301efba77&units=metric

let names = document.querySelector(".names")
let temp = document.querySelector(".temp")
let tempfeel = document.querySelector(".tempfeel")
let weathercondition = document.querySelector(".weathercondition")
let humidity = document.querySelector(".humidity")
let pressure = document.querySelector(".pressure")
let wind = document.querySelector(".wind")
let winddirection = document.querySelector(".winddirection")
let visibility = document.querySelector(".visibility")
let div = document.querySelector(".cur")

let input = document.querySelector(".searchbar")

async function currentweather(city){
    div.innerText = "Current : "
    names.innerText = "";
    temp.innerText = "";
    tempfeel.innerText = "";
    weathercondition.innerText = "";
    humidity.innerText = "";
    pressure.innerText = "";
    wind.innerText = "";
    winddirection.innerText = "";
    visibility.innerText = "";


    let api = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=903507f17d707fecd352d38301efba77&units=metric`)
    let data = await api.json()
    div.innerText += data.name
    names.innerText += data.name
    temp.innerText += data.main.temp + "°C"
    tempfeel.innerText += data.main.feels_like + "°C"
    weathercondition.innerText += data.weather[0].description
    humidity.innerText += data.main.humidity + "%"
    pressure.innerText += data.main.pressure +"hPa"
    wind.innerText += (data.wind.speed * 3.6) + "km/h"
    winddirection.innerText += getWindDirection(data.wind.deg)
    visibility.innerText += (data.visibility/1000) + "km"
}

function getWindDirection(degrees) {
    if (degrees >= 0 && degrees <= 22.5) {
        return 'North (N)';
    } else if (degrees > 22.5 && degrees <= 67.5) {
        return 'North-Northeast (NNE)';
    } else if (degrees > 67.5 && degrees <= 112.5) {
        return 'Northeast (NE)';
    } else if (degrees > 112.5 && degrees <= 157.5) {
        return 'East-Northeast (ENE)';
    } else if (degrees > 157.5 && degrees <= 202.5) {
        return 'East (E)';
    } else if (degrees > 202.5 && degrees <= 247.5) {
        return 'East-Southeast (ESE)';
    } else if (degrees > 247.5 && degrees <= 292.5) {
        return 'Southeast (SE)';
    } else if (degrees > 292.5 && degrees <= 337.5) {
        return 'South-Southeast (SSW)';
    } else {
        return 'North-Northwest (NNW)';
    }
}