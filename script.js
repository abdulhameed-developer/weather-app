// Theme toggle functionality
      const themeToggle = document.getElementById('themeToggle');
      const themeIcon = themeToggle.querySelector('i');
      
      // Check for saved theme preference or default to dark theme
      const currentTheme = localStorage.getItem('theme') || 'dark';
      
      if (currentTheme === 'dark') {
          document.body.classList.add('dark-theme');
          themeIcon.classList.remove('fa-moon');
          themeIcon.classList.add('fa-sun');
      }
      
      themeToggle.addEventListener('click', () => {
          document.body.classList.toggle('dark-theme');
          
          if (document.body.classList.contains('dark-theme')) {
              localStorage.setItem('theme', 'dark');
              themeIcon.classList.remove('fa-moon');
              themeIcon.classList.add('fa-sun');
          } else {
              localStorage.setItem('theme', 'light');
              themeIcon.classList.remove('fa-sun');
              themeIcon.classList.add('fa-moon');
          }
      });

      // Update current date
      const currentDateElement = document.getElementById('currentDate');
      const now = new Date();
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      currentDateElement.textContent = now.toLocaleDateString('en-US', options);

      // Weather code to description mapping
      const weatherCodeMap = {
          0: "Clear sky",
          1: "Mainly clear",
          2: "Partly cloudy",
          3: "Overcast",
          45: "Fog",
          48: "Depositing rime fog",
          51: "Light drizzle",
          53: "Moderate drizzle",
          55: "Dense drizzle",
          56: "Light freezing drizzle",
          57: "Dense freezing drizzle",
          61: "Slight rain",
          63: "Moderate rain",
          65: "Heavy rain",
          66: "Light freezing rain",
          67: "Heavy freezing rain",
          71: "Slight snow fall",
          73: "Moderate snow fall",
          75: "Heavy snow fall",
          77: "Snow grains",
          80: "Slight rain showers",
          81: "Moderate rain showers",
          82: "Violent rain showers",
          85: "Slight snow showers",
          86: "Heavy snow showers",
          95: "Thunderstorm",
          96: "Thunderstorm with slight hail",
          99: "Thunderstorm with heavy hail"
      };

      // Weather code to icon mapping
      function getWeatherIcon(code, isDay) {
          if (isDay === 0) { // Night
              if (code === 0) return "fas fa-moon";
              if (code === 1) return "fas fa-cloud-moon";
              if (code === 2 || code === 3) return "fas fa-cloud";
              if (code >= 51 && code <= 67) return "fas fa-cloud-moon-rain";
              if (code >= 71 && code <= 86) return "fas fa-snowflake";
              if (code >= 95 && code <= 99) return "fas fa-bolt";
              return "fas fa-cloud";
          } else { // Day
              if (code === 0) return "fas fa-sun";
              if (code === 1) return "fas fa-cloud-sun";
              if (code === 2 || code === 3) return "fas fa-cloud";
              if (code >= 51 && code <= 67) return "fas fa-cloud-rain";
              if (code >= 71 && code <= 86) return "fas fa-snowflake";
              if (code >= 95 && code <= 99) return "fas fa-bolt";
              return "fas fa-cloud";
          }
      }

      // Function to update UI with weather data
      function updateWeatherUI(weatherData, locationName, country) {
          const currentWeather = weatherData.current_weather;
          
          // Update location
          document.getElementById('location').textContent = `${locationName}, ${country}`;
          
          // Update temperature
          document.getElementById('temperature').textContent = 
              `${currentWeather.temperature} ${weatherData.current_weather_units.temperature}`;
          
          // Update weather description and icon
          const description = weatherCodeMap[currentWeather.weathercode] || "Unknown";
          document.getElementById('description').textContent = description;
          document.getElementById('weatherIcon').className = 
              getWeatherIcon(currentWeather.weathercode, currentWeather.is_day);
          
          // Update weather details
          document.getElementById('windSpeed').textContent = 
              `${currentWeather.windspeed} ${weatherData.current_weather_units.windspeed}`;
          document.getElementById('windDirection').textContent = 
              `${currentWeather.winddirection} ${weatherData.current_weather_units.winddirection}`;
          document.getElementById('isDay').textContent = currentWeather.is_day ? "Day" : "Night";
          document.getElementById('elevation').textContent = `${weatherData.elevation} m`;
      }

      // Function to generate forecast cards
      function generateForecastCards(forecastData) {
          const forecastSection = document.getElementById('forecastSection');
          
          // Clear existing forecast cards (except the heading)
          const existingCards = forecastSection.querySelectorAll('.forecast-card');
          existingCards.forEach(card => card.remove());
          
          // For demo purposes, we'll create some sample forecast data
          // In a real app, you would use actual forecast data from the API
          const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
          
          days.forEach((day, index) => {
              const forecastCard = document.createElement('div');
              forecastCard.className = 'forecast-card';
              
              // Generate random temperature for demo (in a real app, use actual data)
              const temp = Math.floor(Math.random() * 15) + 15; // 15-30°C
              const weatherCode = Math.floor(Math.random() * 4); // 0-3 for demo
              
              forecastCard.innerHTML = `
                  <div class="forecast-day">${day}</div>
                  <div class="forecast-icon"><i class="${getWeatherIcon(weatherCode, 1)}"></i></div>
                  <div class="forecast-temp">${temp}°C</div>
                  <div class="forecast-desc">${weatherCodeMap[weatherCode] || "Unknown"}</div>
              `;
              
              forecastSection.appendChild(forecastCard);
          });
      }

      // Function to show error message
      function showError(message) {
          const errorElement = document.getElementById('errorMessage');
          errorElement.textContent = message;
          errorElement.style.display = 'block';
          
          // Hide error after 5 seconds
          setTimeout(() => {
              errorElement.style.display = 'none';
          }, 5000);
      }

      // Function to show loading indicator
      function showLoading() {
          document.getElementById('loading').style.display = 'block';
      }

      // Function to hide loading indicator
      function hideLoading() {
          document.getElementById('loading').style.display = 'none';
      }

      // Search functionality
      const searchButton = document.getElementById('searchButton');
      const searchInput = document.getElementById('searchInput');
      
      searchButton.addEventListener('click', () => {
          const city = searchInput.value.trim();
          if (city) {
              getWeather(city);
          } else {
              showError("Please enter a city name");
          }
      });
      
      searchInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
              searchButton.click();
          }
      });

      // Main weather fetching function
      const getWeather = async (city) => {
          showLoading();
          hideError();
          
          try {
              // Step 1: Get coordinates for the city
              const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${city}`;
              const geoRes = await fetch(geoUrl);
              const geoData = await geoRes.json();

              if (!geoData.results || geoData.results.length === 0) {
                  showError("City not found. Please try another city.");
                  hideLoading();
                  return;
              }

              const { name, country, latitude, longitude } = geoData.results[0];

              // Step 2: Get weather data using coordinates
              const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=auto`;
              const weatherRes = await fetch(weatherUrl);
              const weatherData = await weatherRes.json();

              // Update the UI with the weather data
              updateWeatherUI(weatherData, name, country);
              
              // Generate forecast cards (using demo data for now)
              generateForecastCards(weatherData);
              
              hideLoading();
              
          } catch (err) {
              console.error("Weather Fetching Error: ", err);
              showError("Failed to fetch weather data. Please try again.");
              hideLoading();
          }
      };

      // Function to hide error message
      function hideError() {
          document.getElementById('errorMessage').style.display = 'none';
      }

      // Initialize with Lahore by default
      window.addEventListener('DOMContentLoaded', () => {
          getWeather('Lahore');
      });