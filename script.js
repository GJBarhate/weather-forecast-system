const API_KEY = "903507f17d707fecd352d38301efba77";
const NEWS_API_KEY = "fd889f44af164814baa8858527994ed9";

const elements = {
  names: document.querySelector(".names"),
  temp: document.querySelector(".temp"),
  tempfeel: document.querySelector(".tempfeel"),
  weathercondition: document.querySelector(".weathercondition"),
  humidity: document.querySelector(".humidity"),
  pressure: document.querySelector(".pressure"),
  wind: document.querySelector(".wind"),
  winddirection: document.querySelector(".winddirection"),
  visibility: document.querySelector(".visibility"),
  div: document.querySelector(".cur"),
  input: document.querySelector(".searchbar"),
  loader: document.getElementById("loader"),
  error: document.getElementById("error"),
  alerts: document.getElementById("alerts")
};

document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
  setupThemeToggle();
  document.getElementById('location-btn').addEventListener('click', getUserLocation);
  document.querySelector('.citynews').addEventListener('click', handleNewsRequest);
  setupCityAutocomplete();
  setupChartButton();
}

function setupThemeToggle() {
  const themeToggle = document.getElementById('theme-toggle');
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    themeToggle.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
    localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
  });
  
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark');
    themeToggle.textContent = '☀️';
  }
}

function handleNewsRequest() {
  const city = elements.input.value.trim();
  city ? fetchCityNews(city) : showError("Please enter a city name first");
}

async function currentweather(city) {
  if (!city?.trim()) {
    showError("Please enter a city name");
    return;
  }
  
  showLoading();
  showWeatherView();
  
  try {
    const api = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
    if (!api.ok) throw new Error(api.status === 404 ? "City not found" : "Weather data unavailable");
    
    const data = await api.json();
    displayWeather(data);
    checkAlerts(data.coord.lat, data.coord.lon);
    showForecast(data.name);
  } catch (err) {
    showError(err.message);
  } finally {
    hideLoading();
  }
}

function displayWeather(data) {
  elements.div.innerText = "Current Weather";
  elements.names.innerText = data.name;
  elements.temp.innerText = Math.round(data.main.temp) + "°C";
  elements.tempfeel.innerText = Math.round(data.main.feels_like) + "°C";
  elements.weathercondition.innerText = data.weather[0].description;
  elements.humidity.innerText = data.main.humidity + "%";
  elements.pressure.innerText = data.main.pressure + "hPa";
  elements.wind.innerText = (data.wind.speed * 3.6).toFixed(1) + "km/h";
  elements.winddirection.innerText = getWindDirection(data.wind.deg);
  elements.visibility.innerText = (data.visibility/1000) + "km";
  setWeatherBackground(data.weather[0].main);
}

function getWindDirection(degrees) {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return directions[Math.round(degrees / 45) % 8];
}

function setWeatherBackground(condition) {
  document.body.style.background = 
    condition === 'Clear' ? '#ffe066' : 
    ['Rain', 'Drizzle', 'Thunderstorm'].includes(condition) ? '#7e92cf' :
    condition === 'Snow' ? '#d3d3d3' : '#f4f4f9';
}

function getUserLocation() {
  if (!navigator.geolocation) {
    showError("Geolocation not supported by your browser");
    return;
  }
  
  showLoading();
  navigator.geolocation.getCurrentPosition(
    pos => getWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
    err => showError("Location error: " + err.message)
  );
}

async function getWeatherByCoords(lat, lon) {
  try {
    const api = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
    if (!api.ok) throw new Error("Weather data unavailable");
    
    const data = await api.json();
    displayWeather(data);
    checkAlerts(lat, lon);
    showForecast(data.name);
  } catch (err) {
    showError(err.message);
  } finally {
    hideLoading();
  }
}

async function checkAlerts(lat, lon) {
  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,daily&appid=${API_KEY}`);
    if (!response.ok) return;
    
    const data = await response.json();
    elements.alerts.style.display = "none";
    
    if (data.alerts?.length) {
      elements.alerts.textContent = `Alert: ${data.alerts[0].event} - ${data.alerts[0].description}`;
      elements.alerts.style.display = "block";
    }
  } catch (err) {}
}

async function fetchCityNews(city) {
  showLoading();
  
  try {
    const response = await fetch(`https://newsapi.org/v2/everything?q=${encodeURIComponent(city)}&pageSize=4&language=en&sortBy=publishedAt&apiKey=${NEWS_API_KEY}`);
    if (!response.ok) throw new Error();
    
    const data = await response.json();
    displayNews(data.articles || [], city);
  } catch (err) {
    displayStaticNews(city);
  } finally {
    hideLoading();
  }
}

function displayStaticNews(city) {
  const newsSection = document.getElementById('news-section');
  const newsContent = document.getElementById('news-content');
  
  document.querySelector('.main').style.display = "none";
  document.getElementById('forecast-section').style.display = "none";
  newsSection.style.display = "block";
  
  document.getElementById('news-title').textContent = `News for ${city}`;
  newsContent.innerHTML = `
    <div class="news-card">
      <p>News for ${city} not available.</p>
      <div class="search-links">
        <a href="https://news.google.com/search?q=${encodeURIComponent(city)}" target="_blank">Google News</a> | 
        <a href="https://www.bing.com/news/search?q=${encodeURIComponent(city)}" target="_blank">Bing News</a>
      </div>
    </div>
  `;
}

function displayNews(articles, city) {
  const newsSection = document.getElementById('news-section');
  const newsContent = document.getElementById('news-content');
  
  document.querySelector('.main').style.display = "none";
  document.getElementById('forecast-section').style.display = "none";
  newsSection.style.display = "block";
  
  document.getElementById('news-title').textContent = `News for ${city}`;
  
  if (!articles?.length) {
    displayStaticNews(city);
    return;
  }
  
  newsContent.innerHTML = articles
    .filter(a => a.title)
    .map(article => {
      const date = article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : 'Recent';
      return `
        <div class="news-card">
          <h3><a href="${article.url}" target="_blank">${article.title}</a></h3>
          <p class="news-source">${article.source?.name || ''} · ${date}</p>
        </div>
      `;
    })
    .join('');
}

async function showForecast(city) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data.list) return;
    
    const days = {};
    data.list.forEach(item => {
      const day = item.dt_txt.split(' ')[0];
      if (!days[day]) days[day] = item;
    });
    
    const cards = Object.values(days).slice(0, 5).map(item => {
      const date = new Date(item.dt_txt);
      const formattedDate = date.toLocaleDateString(undefined, {weekday:'short', day: 'numeric'});
      return `
        <div class="forecast-card">
          <div class="date">${formattedDate}</div>
          <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png" alt="${item.weather[0].description}">
          <div class="temp">${Math.round(item.main.temp)}°C</div>
        </div>
      `;
    }).join('');
    
    document.getElementById('forecast-cards').innerHTML = cards;
  } catch (err) {}
}

function setupCityAutocomplete() {
  const cityInput = document.getElementById('city');
  let debounceTimeout;
  let autocompleteList;
  
  cityInput.addEventListener('input', function() {
    clearTimeout(debounceTimeout);
    removeAutocomplete();
    
    const query = this.value.trim();
    if (query.length < 3) return;
    
    debounceTimeout = setTimeout(async () => {
      try {
        const res = await fetch(`https://api.teleport.org/api/cities/?search=${encodeURIComponent(query)}&limit=5`);
        const data = await res.json();
        const results = data._embedded?.['city:search-results'] || [];
        
        if (results.length === 0) return;
        
        autocompleteList = document.createElement('ul');
        autocompleteList.id = 'city-autocomplete';
        
        const rect = cityInput.getBoundingClientRect();
        autocompleteList.style.left = rect.left + window.scrollX + 'px';
        autocompleteList.style.top = (rect.bottom + window.scrollY) + 'px';
        autocompleteList.style.width = rect.width + 'px';
        
        results.forEach(item => {
          const li = document.createElement('li');
          li.textContent = item.matching_full_name;
          li.onclick = () => {
            cityInput.value = item.matching_full_name;
            removeAutocomplete();
            currentweather(cityInput.value);
          };
          autocompleteList.appendChild(li);
        });
        
        document.body.appendChild(autocompleteList);
      } catch (err) {}
    }, 300);
  });
  
  document.addEventListener('mousedown', e => {
    if (autocompleteList && !autocompleteList.contains(e.target) && e.target !== cityInput) {
      removeAutocomplete();
    }
  });
  
  function removeAutocomplete() {
    if (autocompleteList) {
      autocompleteList.remove();
      autocompleteList = null;
    }
  }
}

function setupChartButton() {
  let weatherChart;
  document.getElementById('showChartBtn').onclick = async function() {
    const canvas = document.getElementById('weatherChart');
    
    if (canvas.style.display === 'none') {
      const city = elements.input.value.trim();
      if (!city) return;
      
      try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`);
        const data = await res.json();
        if (!data.list) return;
        
        const labels = [], temps = [], hums = [];
        for (let i = 0; i < data.list.length; i += 8) {
          const d = new Date(data.list[i].dt_txt);
          labels.push(d.toLocaleString('en-US', {weekday:'short'}));
          temps.push(data.list[i].main.temp);
          hums.push(data.list[i].main.humidity);
        }
        
        const ctx = canvas.getContext('2d');
        if (weatherChart) weatherChart.destroy();
        weatherChart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: labels.slice(0, 5),
            datasets: [
              {
                label: 'Temperature (°C)',
                data: temps.slice(0, 5),
                borderColor: 'orange',
                backgroundColor: 'rgba(255,165,0,0.1)',
                yAxisID: 'y',
              },
              {
                label: 'Humidity (%)',
                data: hums.slice(0, 5),
                borderColor: 'blue',
                backgroundColor: 'rgba(0,0,255,0.1)',
                yAxisID: 'y1',
              }
            ]
          },
          options: {
            responsive: true,
            scales: {
              y: { position: 'left', title: { display: true, text: '°C' } },
              y1: { position: 'right', title: { display: true, text: '%' }, grid: { drawOnChartArea: false } }
            }
          }
        });
        
        canvas.style.display = 'block';
        this.textContent = '❌ Hide Chart';
      } catch (e) {}
    } else {
      canvas.style.display = 'none';
      this.textContent = '📊 Show Chart';
    }
  };
}

function showWeatherView() {
  document.querySelector('.main').style.display = "block";
  document.getElementById('forecast-section').style.display = "block";
  document.getElementById('news-section').style.display = "none";
}

function showLoading() {
  elements.error.style.display = "none";
  elements.loader.style.display = "block";
}

function hideLoading() {
  elements.loader.style.display = "none";
}

function showError(message) {
  elements.error.textContent = message;
  elements.error.style.display = "block";
}