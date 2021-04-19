// !!! EACH DIFFERENT PART OF JS IS IN IT'S OWN BLOCK SCOPE SO THEY DO NOT INTERACT WITH EACH OTHER NOR ARE THEY GLOBAL OBJECTS !!!

// IN FUTURE USE OTHER DATA THE API GIVES YOU ONLY IF WANT TO, DON'T HAVE TO JUST AN IDEA

// GLOBAL VARIABLES, needed to show whethere imperial(fahrenheit, MPH) or metric(celsius, M/S) is being used
// These variables are used throughout the file and the checkingUnits() is used in weatherLocation() to change the data from different temperature units
let units;
let distanceUnits;
let temperatureUnits;

// Api key
const apiKey = config.apiKey;

async function checkingUnits() {
  const fahrenheit = document.getElementsByClassName("fahrenheit")[0];
  const celsius = document.getElementsByClassName("celsius")[0];

  if (fahrenheit.classList.contains("showing")) {
    units = "°F";
    temperatureUnits = "&units=imperial";
    distanceUnits = "MPH";
  } else if (celsius.classList.contains("showing")) {
    units = "°C";
    temperatureUnits = "&units=metric";
    distanceUnits = "M/S";
  } else {
    units = "K";
    temperatureUnits = "";
    distanceUnits = "M/S";
  }
}

// Leaflet.js map, global, all functions that would need to access it can access it (setView/panTo gets set when weatherLocation gets called, so when page loads)
const map = L.map("map", {
  scrollWheelZoom: false,
  zoom: 10,
  dragging: true,
});

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

// Global location marker
let locationMarker;

function setCurrentLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(foundLocation, noLocation, {
      timeout: 10000,
    });

    function foundLocation(position) {
      const inputLat = document.getElementById("input-lat");
      const inputLon = document.getElementById("input-lon");
      inputLat.value = position.coords.latitude.toFixed(2);
      inputLon.value = position.coords.longitude.toFixed(2);

      if (document.URL.includes("now.html")) {
        nowData();
      } else if (document.URL.includes("hourly.html")) {
        hourlyData();
      } else if (document.URL.includes("daily.html")) {
        dailyData();
      }
    }

    function noLocation(error) {
      switch (error.code) {
        case 1:
          alert("The user denied permission to use current location.");
          break;
        case 2:
          alert("The postion is currently unavailable.");
          break;
        case 3:
          alert("Request was timed out to get the locations information.");
          break;
        default:
          alert("Unknown error.");
          break;
      }
      // If any error occurs then you get an alert based off of the error and you get the coordinates and display the data of Los Angeles
      const inputLat = document.getElementById("input-lat");
      const inputLon = document.getElementById("input-lon");
      inputLat.value = 34.05;
      inputLon.value = -118.24;

      if (document.URL.includes("now.html")) {
        nowData();
      } else if (document.URL.includes("hourly.html")) {
        hourlyData();
      } else if (document.URL.includes("daily.html")) {
        dailyData();
      }
    }
  } else {
    alert("geolocation is not available.");
  }
}

setCurrentLocation();

async function weatherLocation() {
  try {
    const inputLat = document.getElementById("input-lat").value;
    const inputLon = document.getElementById("input-lon").value;

    if (inputLat == "" || inputLon == "") {
      alert("Enter a Latitude and Longitude.");
      return;
    } else if (inputLat > 90 || inputLat < -90) {
      alert("Enter a latitude that is 90° or less, or -90° or above");
      return;
    } else if (inputLon > 180 || inputLon < -180) {
      alert("Enter a longitude that is 180° or less, or -180° or above");
      return;
    }
    // Grabs the correct temperatureUnits needed in order to display the correct data
    const unitsEquals = await checkingUnits();
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${inputLat}&lon=${inputLon}${temperatureUnits}&appid=${apiKey}`
    );
    const data = await response.json();

    // Displays the data on the header .search-menu, triggers once, has seperate function below for when search button gets clicked
    const timezoneData = document.getElementsByClassName("timezone-data")[0];
    const currentTempData = document.getElementsByClassName(
      "current-temp-data"
    )[0];

    timezoneData.textContent = data.timezone.replace("_", " ");
    currentTempDataIntoInteger = parseInt(data.current.temp);
    currentTempData.textContent = `${currentTempDataIntoInteger}${units}`;

    // Sets the coordinates from the data card into the inputs values so it doesn't come up blank but with the current datas coordinates
    const menuInputLat = document.getElementsByClassName("menu-input-lat")[0];
    const menuInputLon = document.getElementsByClassName("menu-input-lon")[0];
    menuInputLat.value = `${inputLat}`;
    menuInputLon.value = `${inputLon}`;

    // Leaflet.js
    // Sets the view of the leaflet.js map so it isn't blank and it shows the given location
    map.panTo([inputLat, inputLon]);
    // Removes any previous marker if it exists and adds a marker with a popup on the given location
    if (map.hasLayer(locationMarker)) {
      map.removeLayer(locationMarker);
    }
    locationMarker = L.marker([inputLat, inputLon]).addTo(map);
    locationMarker
      .bindPopup(
        `It is currently ${currentTempDataIntoInteger}${units} at coordinates [${inputLat}, ${inputLon}]`
      )
      .openPopup();

    return data;
  } catch (error) {
    console.error(error);
  }
}

// Gets daily data
async function dailyData() {
  const data = await weatherLocation();
  if (data == undefined) {
    alert("There was an error receiveing the data");
    return;
  }
  const dataDaily = data.daily;

  // Set the latitude and longitude at the first data-card
  const latitudeElement = document.getElementsByClassName(
    "latitude-element"
  )[0];
  const longitudeElement = document.getElementsByClassName(
    "longitude-element"
  )[0];
  latitudeElement.textContent = `${data.lat}`;
  longitudeElement.textContent = `${data.lon}`;

  for (let i = 0; i < 8; i++) {
    // Grabs the elements from where the data is going to be displayed
    const timeElement = document.getElementsByClassName("time-element")[i];
    const dateElement = document.getElementsByClassName("date-element")[i];
    const temperatureElement = document.getElementsByClassName(
      "temperature-element"
    )[i];
    const imageElement = document.getElementsByClassName("image-element")[i];
    const descriptionElement = document.getElementsByClassName(
      "description-element"
    )[i];

    const dewPointElement = document.getElementsByClassName(
      "dew-point-element"
    )[i];
    const uviElement = document.getElementsByClassName("uvi-element")[i];
    const humidityElement = document.getElementsByClassName("humidity-element")[
      i
    ];
    const cloudsElement = document.getElementsByClassName("clouds-element")[i];
    const descriptionElementExtended = document.getElementsByClassName(
      "description-element-extended"
    )[i];
    const sunriseElement = document.getElementsByClassName("sunrise-element")[
      i
    ];
    const sunsetElement = document.getElementsByClassName("sunset-element")[i];

    // Convert day timestamp to readable time
    const unixTimestamp = dataDaily[i].dt;
    const milliseconds = unixTimestamp * 1000;
    const dateObject = new Date(milliseconds);
    // Gets the month and the day
    const month = dateObject.getMonth() + 1;
    const day = dateObject.getDate();

    // Get the week day shortened to three letters
    let weekDay;
    switch (dateObject.getDay()) {
      case 0:
        weekDay = "Sun";
        break;
      case 1:
        weekDay = "Mon";
        break;
      case 2:
        weekDay = "Tue";
        break;
      case 3:
        weekDay = "Wed";
        break;
      case 4:
        weekDay = "Thu";
        break;
      case 5:
        weekDay = "Fri";
        break;
      case 6:
        weekDay = "Sat";
    }

    // Get the sunrise and convert it to readable time and gets the hour and minutes of the day and sets it to AM or PM
    let sunrise = dataDaily[i].sunrise;
    sunrise = sunrise * 1000;
    sunrise = new Date(sunrise);
    let sunriseHour = sunrise.getHours();
    let sunriseMinutes = sunrise.getMinutes();

    let sunriseAMPM = "AM";
    if (sunriseHour >= 12) {
      sunriseAMPM = "PM";
    }
    sunriseHour =
      sunriseHour == 0
        ? 12
        : sunriseHour < 10
        ? sunriseHour
        : sunriseHour > 12
        ? sunriseHour - 12
        : sunriseHour;
    sunriseMinutes =
      sunriseMinutes < 10 ? "0" + sunriseMinutes : sunriseMinutes;

    // Get the sunset and convert it to readable time
    let sunset = dataDaily[i].sunset;
    sunset = sunset * 1000;
    sunset = new Date(sunset);
    let sunsetHour = sunset.getHours();
    let sunsetMinutes = sunset.getMinutes();

    let sunsetAMPM = "AM";
    if (sunsetHour >= 12) {
      sunsetAMPM = "PM";
    }
    sunsetHour =
      sunsetHour == 0
        ? 12
        : sunsetHour < 10
        ? sunsetHour
        : sunsetHour > 12
        ? sunsetHour - 12
        : sunsetHour;
    sunsetMinutes = sunsetMinutes < 10 ? "0" + sunsetMinutes : sunsetMinutes;

    // Get the max and min temperature for the day
    const maxTemp = Math.round(dataDaily[i].temp.max);
    const minTemp = Math.round(dataDaily[i].temp.min);
    // Get the icon text value and display the icon that corresponds with it
    const icon = dataDaily[i].weather[0].icon;

    // Get the little description given
    let descriptionExtended = dataDaily[i].weather[0].description;
    descriptionExtended = descriptionExtended
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.substring(1))
      .join(" ");

    // Get the main description
    let mainDescription = dataDaily[i].weather[0].main;

    // Get the dew point
    const dewPoint = Math.round(dataDaily[i].dew_point);

    // Get the uvi (Ultra Violet Index)
    const uvi = dataDaily[i].uvi;
    // Get the humidity
    const humidity = dataDaily[i].humidity;
    // Get the clouds
    const clouds = dataDaily[i].clouds;

    // Display the date onto the elements
    timeElement.childNodes[0].textContent = `${weekDay}`;
    dateElement.textContent = `${month}/${day}`;
    imageElement.src = `../images/${icon}@2x.png`;

    // First line gets rid of all the content in the p element, next lines insert maxTemp with a ° in a span and minTemp with a ° in a span as well
    // All html gets added via js and removed via js
    temperatureElement.textContent = ``;
    temperatureElement.insertAdjacentHTML(
      "afterbegin",
      `${maxTemp}<span class="daily-temp-deg">${units}</span>
            <span class="min-temp-element">/${minTemp}<span class="daily-temp-deg"">${units}</span>`
    );

    descriptionElement.textContent = `${mainDescription}`;

    descriptionElementExtended.textContent = `${descriptionExtended}`;

    dewPointElement.textContent = ``;
    dewPointElement.insertAdjacentHTML(
      "beforeend",
      `Dew Point <span>${dewPoint}${units}</span>`
    );

    humidityElement.textContent = ``;
    humidityElement.insertAdjacentHTML(
      "beforeend",
      `Humidity <span>${humidity}%</span>`
    );

    cloudsElement.textContent = ``;
    cloudsElement.insertAdjacentHTML(
      "beforeend",
      `Clouds <span>${clouds}%</span>`
    );

    uviElement.textContent = ``;
    uviElement.insertAdjacentHTML("beforeend", `UV Index<span>${uvi}</span>`);

    sunriseElement.textContent = ``;
    sunriseElement.insertAdjacentHTML(
      "beforeend",
      `Sunrise <span>${sunriseHour}:${sunriseMinutes} ${sunriseAMPM}</span>`
    );

    sunsetElement.textContent = ``;
    sunsetElement.insertAdjacentHTML(
      "beforeend",
      `Sunset <span>${sunsetHour}:${sunsetMinutes} ${sunsetAMPM}</span>`
    );
  }
  return data;
}

document
  .getElementsByClassName("submit")[0]
  .addEventListener("click", dailyData);
document
  .getElementsByClassName("submit")[1]
  .addEventListener("click", dailyData);
document
  .getElementsByClassName("header-location-arrow")[0]
  .addEventListener("click", setCurrentLocation);

// Feature here makes navbar stick to the top of the page and makes map move with the page
{
  // When the user scrolls the page, execute stickyNav and stickyMapHeight making the nav sticky and the right section change its height so map can be sticky
  window.addEventListener("scroll", stickyNav);
  window.addEventListener("scroll", stickyMapHeight);

  const header = document.getElementsByTagName("header")[0];
  const sticky = header.offsetTop;

  function stickyNav() {
    if (window.pageYOffset > sticky) {
      header.classList.add("sticky");
    } else {
      header.classList.remove("sticky");
    }
  }

  const rightSection = document.getElementsByClassName("right-section")[0];
  const leftSection = document.getElementsByClassName("left-section")[0];

  function stickyMapHeight() {
    if (
      window.innerWidth > 720 &&
      leftSection.offsetHeight >= rightSection.offsetHeight
    ) {
      rightSection.style.height = leftSection.offsetHeight + "px";
    } else {
      rightSection.style.height = "";
    }
  }
}

// Media queries in js
{
  const colClass = new RegExp(/\bcol-.+\b/);

  // Set and changes in every media queries so there are no errors with the .remove inside the maxFiftyFiveRem media query
  let largeToSmall = true;
  // These variables get constantly used throughout this scope you don't have to constantly re-create them when the function runs
  const leftHeader = document.getElementsByClassName("left-header")[0];
  const middleHeader = document.getElementsByClassName("middle-header")[0];
  const rightHeader = document.getElementsByClassName("right-header")[0];
  const searchMenu = document.getElementsByClassName("search-menu")[0];
  const dropdownNavMenu = document.getElementsByClassName(
    "dropdown-nav-menu"
  )[0];
  const leftSection = document.getElementsByClassName("left-section")[0];
  const rightSection = document.getElementsByClassName("right-section")[0];

  const currentLocation = document.getElementsByClassName(
    "current-location"
  )[0];
  const headerTimezone = document.getElementsByClassName("header-timezone")[0];
  const currentWeather = document.getElementsByClassName("current-weather")[0];

  const footerSection = document.getElementsByClassName("footer-section");
  const thirdStripSections = document.getElementsByClassName(
    "third-strip-sections"
  );

  function mediaQueries() {
    // This variable gets changed so you do have to re-create this variable to get the right variable with every media query
    const searchItems = document.getElementsByClassName("search-items")[0];

    if (maxFortyFiveRem.matches) {
      // Changes the col- classes of the nav at the top of the page
      leftHeader.className = leftHeader.className.replace(colClass, "col-7");
      middleHeader.className = middleHeader.className.replace(
        colClass,
        "col-0"
      );
      rightHeader.className = rightHeader.className.replace(colClass, "col-3");

      // Changes the col- classes of the .bottom-of-search-menu
      currentLocation.className = currentLocation.className.replace(
        colClass,
        "col-10"
      );
      headerTimezone.className = headerTimezone.className.replace(
        colClass,
        "col-10"
      );
      currentWeather.className = currentWeather.className.replace(
        colClass,
        "col-10"
      );

      // Removes all inputs from right-header and changes inputs to go into the menu when active
      if (largeToSmall) {
        searchItems.remove();
      }

      largeToSmall = false;

      // Change the col- classes of .left-section and .right-section
      leftSection.className = leftSection.className.replace(colClass, "col-10");
      rightSection.className = rightSection.className.replace(
        colClass,
        "col-10"
      );

      // Changes .footer-section from col-3 to col-10
      for (let i = 0; i < footerSection.length; i++) {
        footerSection[i].className = footerSection[i].className.replace(
          colClass,
          "col-10"
        );
      }

      // Changes the .footer-social child elements to .footer-section and col-10
      for (let i = 0; i < thirdStripSections.length; i++) {
        thirdStripSections[i].classList.add("footer-section", "col-10");
      }
    } else if (maxSixtyRem.matches) {
      // Removes all inputs from right-header and changes inputs to go into the menu when active
      if (largeToSmall) {
        searchItems.remove();
      }
      largeToSmall = false;

      // Changes the headers
      leftHeader.className = leftHeader.className.replace(colClass, "col-4");
      middleHeader.className = middleHeader.className.replace(
        colClass,
        "col-5"
      );
      rightHeader.className = rightHeader.className.replace(colClass, "col-1");

      // Changes the col- classes of the .bottom-of-search-menu
      currentLocation.className = currentLocation.className.replace(
        colClass,
        "col-2"
      );
      headerTimezone.className = headerTimezone.className.replace(
        colClass,
        "col-3"
      );
      currentWeather.className = currentWeather.className.replace(
        colClass,
        "col-3"
      );

      // If browser size is above 55rem and the dropdownNavMenu still has active, remove active
      dropdownNavMenu.classList.remove("active");

      // Change the col- classes of .left-section and .right-section
      leftSection.className = leftSection.className.replace(colClass, "col-6");
      rightSection.className = rightSection.className.replace(
        colClass,
        "col-4"
      );

      // Remove the .footer-social child elements classes .footer-section and col-10, This code is above the code under it for a reason
      // Don't confuse it with the other if statements where it's placed under it
      for (let i = 0; i < thirdStripSections.length; i++) {
        thirdStripSections[i].classList.remove("footer-section", "col-10");
      }

      // Changes .footer-section from col-10 to col-3
      for (let i = 0; i < footerSection.length; i++) {
        footerSection[i].className = footerSection[i].className.replace(
          colClass,
          "col-3"
        );
      }
    } else if (maxSeventyFiveRem.matches) {
      // Changes the headers
      leftHeader.className = leftHeader.className.replace(colClass, "col-3");
      middleHeader.className = middleHeader.className.replace(
        colClass,
        "col-4"
      );
      rightHeader.className = rightHeader.className.replace(colClass, "col-3");

      // Appends the search-items div with all the content in it inside the right-header div when browser gets larger
      if (document.getElementsByClassName("search-items")[1] == undefined) {
        const searchItems = document.createElement("div");
        searchItems.classList.add("search-items");
        const description = document.createElement("p");
        description.id = "lat-lon-description";
        description.textContent = "Enter coordinates below";

        const inputLat = document.createElement("input");
        inputLat.classList.add("inputs");
        inputLat.id = "input-lat";
        inputLat.type = "number";
        inputLat.placeholder = "Latitude";
        const currentLat = document.getElementsByClassName(
          "latitude-element"
        )[0];
        inputLat.value = `${currentLat.textContent}`;

        const inputLon = document.createElement("input");
        inputLon.classList.add("inputs");
        inputLon.id = "input-lon";
        inputLon.type = "number";
        inputLon.placeholder = "Longitiude";
        const currentLon = document.getElementsByClassName(
          "longitude-element"
        )[0];
        inputLon.value = `${currentLon.textContent}`;

        const faSearch = document.createElement("button");
        faSearch.classList.add("submit", "fas", "fa-search");
        faSearch.addEventListener("click", weatherLocation);

        const faArrow = document.createElement("button");
        faArrow.classList.add(
          "fas",
          "header-location-arrow",
          "fa-location-arrow"
        );
        faArrow.addEventListener("click", setCurrentLocation);
        const toolTipText = document.createElement("span");
        toolTipText.classList.add("tool-tip-text");
        toolTipText.textContent = `Use Current Location`;
        faArrow.append(toolTipText);

        searchItems.append(description, inputLat, inputLon, faSearch, faArrow);

        rightHeader.append(searchItems);

        largeToSmall = true;
      }
      // If browser size is above 70rem and the searchMenu still has active, remove active
      searchMenu.classList.remove("active");
      dropdownNavMenu.classList.remove("active");

      // Change the col- classes of .left-section and .right-section
      leftSection.className = leftSection.className.replace(colClass, "col-6");
      rightSection.className = rightSection.className.replace(
        colClass,
        "col-4"
      );

      // Remove the .footer-social child elements classes .footer-section and col-10, This code is above the code under it for a reason
      // Don't confuse it with the other if statements where it's placed under it
      for (let i = 0; i < thirdStripSections.length; i++) {
        thirdStripSections[i].classList.remove("footer-section", "col-10");
      }

      // Changes .footer-section from col-10 to col-3
      for (let i = 0; i < footerSection.length; i++) {
        footerSection[i].className = footerSection[i].className.replace(
          colClass,
          "col-3"
        );
      }
    }
    // Else would imply anything above 70rem
    else {
      // Changes the headers
      leftHeader.className = leftHeader.className.replace(colClass, "col-3");
      middleHeader.className = middleHeader.className.replace(
        colClass,
        "col-4"
      );
      rightHeader.className = rightHeader.className.replace(colClass, "col-3");

      // Appends the search-items div with all the content in it inside the right-header div when browser gets larger
      if (document.getElementsByClassName("search-items")[1] == undefined) {
        const searchItems = document.createElement("div");
        searchItems.classList.add("search-items");
        const description = document.createElement("p");
        description.id = "lat-lon-description";
        description.textContent = "Enter coordinates below";

        const inputLat = document.createElement("input");
        inputLat.classList.add("inputs");
        inputLat.id = "input-lat";
        inputLat.type = "number";
        inputLat.placeholder = "Latitude";
        const currentLat = document.getElementsByClassName(
          "latitude-element"
        )[0];
        inputLat.value = `${currentLat.textContent}`;

        const inputLon = document.createElement("input");
        inputLon.classList.add("inputs");
        inputLon.id = "input-lon";
        inputLon.type = "number";
        inputLon.placeholder = "Longitiude";
        const currentLon = document.getElementsByClassName(
          "longitude-element"
        )[0];
        inputLon.value = `${currentLon.textContent}`;

        const faSearch = document.createElement("button");
        faSearch.classList.add("submit", "fas", "fa-search");
        faSearch.addEventListener("click", weatherLocation);

        const faArrow = document.createElement("button");
        faArrow.classList.add(
          "fas",
          "header-location-arrow",
          "fa-location-arrow"
        );
        faArrow.addEventListener("click", setCurrentLocation);
        const toolTipText = document.createElement("span");
        toolTipText.classList.add("tool-tip-text");
        toolTipText.textContent = `Use Current Location`;
        faArrow.append(toolTipText);

        searchItems.append(description, inputLat, inputLon, faSearch, faArrow);

        rightHeader.append(searchItems);

        largeToSmall = true;
      }

      // If browser size is above 70rem and the searchMenu still has active, remove active
      searchMenu.classList.remove("active");
      dropdownNavMenu.classList.remove("active");

      // Change the col- classes of .left-section and .right-section
      leftSection.classList.replace("col-10", "col-6");
      rightSection.classList.replace("col-10", "col-4");

      leftSection.className = leftSection.className.replace(colClass, "col-6");
      rightSection.className = rightSection.className.replace(
        colClass,
        "col-4"
      );

      // Remove the .footer-social child elements classes .footer-section and col-10, This code is above the code under it for a reason
      // Don't confuse it with the other if statements where it's placed under it
      for (let i = 0; i < thirdStripSections.length; i++) {
        thirdStripSections[i].classList.remove("footer-section", "col-10");
      }

      // Changes .footer-section from col-10 to col-3
      for (let i = 0; i < footerSection.length; i++) {
        footerSection[i].className = footerSection[i].className.replace(
          colClass,
          "col-3"
        );
      }
    }
  }

  const maxFortyFiveRem = window.matchMedia("(max-width: 45rem)"); // 720px
  const maxSixtyRem = window.matchMedia("(max-width: 60rem)"); // 960px
  const maxSeventyFiveRem = window.matchMedia("(max-width: 75rem)"); // 1200px

  mediaQueries(maxFortyFiveRem, maxSixtyRem, maxSeventyFiveRem); // Call listener function at run time
  maxFortyFiveRem.addListener(mediaQueries); // Attach listener functions on state changes
  maxSixtyRem.addListener(mediaQueries);
  maxSeventyFiveRem.addListener(mediaQueries);
}

// Feature makes it so the dropdown and the search menu works when browsers are smaller in size, toggles .active
{
  const searchIcon = document.getElementsByClassName("search")[0];
  const searchMenu = document.getElementsByClassName("search-menu")[0];
  const bars = document.getElementsByClassName("bars")[0];
  const dropdownNavMenu = document.getElementsByClassName(
    "dropdown-nav-menu"
  )[0];

  // When .search in header gets clicked it display blocks the search-menu, also removes active if gets reclicked or the other icon gets clicked on
  searchIcon.addEventListener("click", function () {
    if (searchMenu.classList.contains("active")) {
      searchMenu.classList.remove("active");
    } else if (dropdownNavMenu.classList.contains("active")) {
      dropdownNavMenu.classList.remove("active");
      searchMenu.classList.add("active");
    } else {
      searchMenu.classList.add("active");
    }
  });
  document
    .getElementsByClassName("x-button")[0]
    .addEventListener("click", function () {
      searchMenu.classList.remove("active");
    });

  // When user clicks Current Location it calls SetCurrentLocation
  document
    .getElementsByClassName("current-location")[0]
    .addEventListener("click", function () {
      const searchMenu = document.getElementsByClassName("search-menu")[0];
      searchMenu.classList.remove("active");
      setCurrentLocation();
    });

  // When .bars in header gets clicked it display blocks the nav-menu, also removes active if gets reclicked or the other icon gets clicked on
  bars.addEventListener("click", function () {
    if (dropdownNavMenu.classList.contains("active")) {
      dropdownNavMenu.classList.remove("active");
    } else if (searchMenu.classList.contains("active")) {
      searchMenu.classList.remove("active");
      dropdownNavMenu.classList.add("active");
    } else {
      dropdownNavMenu.classList.add("active");
    }
  });

  document
    .getElementsByClassName("x-button")[1]
    .addEventListener("click", function () {
      dropdownNavMenu.classList.remove("active");
    });

  // Removes .active if not clicked in the header or menus container
  document.addEventListener("click", function (event) {
    // If the click happened inside the the menus or in the header, return the function
    if (event.target.closest(".search-menu") || event.target.closest("header"))
      return;
    // Otherwise, run the code...
    searchMenu.classList.remove("active");
    dropdownNavMenu.classList.remove("active");
  });
}

// Changes the temperature units from fahrenheit to celsius to kelvin if needed
{
  const fahrenheitElement = document.getElementsByClassName(
    "fahrenheit-element"
  )[0];
  const celsiusElement = document.getElementsByClassName("celsius-element")[0];
  const kelvinElement = document.getElementsByClassName("kelvin-element")[0];

  const fahrenheit = document.getElementsByClassName("fahrenheit")[0];
  const celsius = document.getElementsByClassName("celsius")[0];
  const kelvin = document.getElementsByClassName("kelvin")[0];

  fahrenheitElement.addEventListener("click", function () {
    fahrenheit.classList.add("showing");
    celsius.classList.remove("showing");
    kelvin.classList.remove("showing");
    dailyData();
  });

  celsiusElement.addEventListener("click", function () {
    celsius.classList.add("showing");
    fahrenheit.classList.remove("showing");
    kelvin.classList.remove("showing");
    dailyData();
  });

  kelvinElement.addEventListener("click", function () {
    kelvin.classList.add("showing");
    fahrenheit.classList.remove("showing");
    celsius.classList.remove("showing");
    dailyData();
  });
}

// Whenever a user clicks on the map it gives them the option to use those coordinates to display the weather data then adds a marker at the place clicked
{
  let mapNotClicked = true;
  const rightSection = document.getElementsByClassName("right-section")[0];
  const mapPrompt = document.getElementsByClassName("map-question")[0];
  const yesPrompt = document.getElementsByClassName("yes-map-prompt")[0];
  const noPrompt = document.getElementsByClassName("no-map-prompt")[0];
  const mapPromptDescription = document.getElementsByClassName(
    "map-prompt-description"
  )[0];

  async function onMapClickPrompt(event) {
    if (mapPrompt.classList.contains("position-absolute")) {
      mapPrompt.classList.remove("position-absolute");
    }
    mapPrompt.classList.add("active");

    rightSection.classList.add("height-auto-important");

    if (mapNotClicked) {
      // When clicked on map the page goes to the prompt in case the user doesn't notice the prompt popped up
      const rightSectionOffsetTop = rightSection.offsetTop;
      // These only work with certain browsers which is why both is added is it works on all browsers
      document.documentElement.scrollTop = rightSectionOffsetTop;
      document.body.scrollTop = rightSectionOffsetTop;

      mapNotClicked = false;
      mapPromptDescription.textContent = `Do you want to use the coordinates ${event.latlng.lat.toFixed(
        2
      )}, ${event.latlng.lng.toFixed(2)}?`;

      mapPromptDescription.textContent = ``;
      mapPromptDescription.insertAdjacentHTML(
        "beforeend",
        `Do you want to use the coordinates <span>${event.latlng.lat.toFixed(
          2
        )}, ${event.latlng.lng.toFixed(2)}?</span`
      );

      function yesPromptFunction() {
        mapNotClicked = true;

        mapPrompt.classList.remove("active");
        // Set to 1000ms because that's how long the opacity transition takes
        setTimeout(function () {
          mapPrompt.classList.add("position-absolute");
          rightSection.classList.remove("height-auto-important");
        }, 1000);
        onMapClickResponse(event);

        yesPrompt.removeEventListener("click", yesPromptFunction);
        noPrompt.removeEventListener("click", noPromptFunction);
      }

      yesPrompt.addEventListener("click", yesPromptFunction);

      function noPromptFunction() {
        mapNotClicked = true;

        mapPrompt.classList.remove("active");
        setTimeout(function () {
          mapPrompt.classList.add("position-absolute");
          rightSection.classList.remove("height-auto-important");
        }, 1000);

        yesPrompt.removeEventListener("click", yesPromptFunction);
        noPrompt.removeEventListener("click", noPromptFunction);
      }

      noPrompt.addEventListener("click", noPromptFunction);
    }
    return event;
  }

  async function onMapClickResponse(event) {
    const latitude = event.latlng.lat.toFixed(2);
    const longitude = event.latlng.lng.toFixed(2);
    // Changing the inputs lat and lon in order to trigger weatherLocation() to show the weather data
    let inputLat = document.getElementById("input-lat");
    inputLat.value = latitude;
    let inputLon = document.getElementById("input-lon");
    inputLon.value = longitude;

    dailyData();
  }

  map.on("click", onMapClickPrompt);
}

// When chevron on .data-card is clicked display the .data-card-extended by changing the height from 0 to auto or hard code
// Gives all .fa-chevron-down a classList.toggle("rotate");
// When chevron on .footer-small is clicked display the .footer-extended by changing the height from 0 to auto or hard code
{
  const chevronButton = document.getElementsByClassName("chevron-button");
  const chevronDown = document.getElementsByClassName("fa-chevron-down");
  const dataCardExtended = document.getElementsByClassName(
    "data-card-extended"
  );
  for (let i = 0; i < chevronButton.length; i++) {
    chevronButton[i].addEventListener("click", function () {
      chevronDown[i].classList.toggle("rotate");
      dataCardExtended[i].classList.toggle("extending");
    });
  }

  const footerChevronButton = document.getElementsByClassName(
    "footer-chevron-button"
  );
  const footerChevronDown = document.getElementsByClassName("footer-chevron");
  const footerExtended = document.getElementsByClassName("footer-extended");
  for (let i = 0; i < footerChevronButton.length; i++) {
    footerChevronButton[i].addEventListener("click", function () {
      footerChevronDown[i].classList.toggle("rotate");
      footerExtended[i].classList.toggle("extending");
    });
  }
}

// !!! EACH DIFFERENT PART OF JS IS IN IT'S OWN BLOCK SCOPE SO THEY DO NOT INTERACT WITH EACH OTHER NOR ARE THEY GLOBAL OBJECTS !!!
