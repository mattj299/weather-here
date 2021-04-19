## Project use

This is a weather app which shows the weather of your current location.
You can check the current, hourly, and daily weather and some extra information about the weather.

You can either use your current location or you can input a latitude and longitude to see the weather there if available.
You can also click on the map to ask for the weather of the location there.

## How to start

Clone the repository on your local machine.

You need your own api key from openweatherapi to use this app, create a file outside all the folders named config.js. Add an object named config. Add inside the object a key value pair with key name being apiKey and set the value as your api key

// config.js
EX. const config { apiKey: YOUR_API_KEY }

Click in one of the three folders and they each have their own html, css, and js file there is no global one for all of them but they all connect with eachother.

Run the app.

## Why this was built

This project was built to test my js skills, as well as getting used to html and css.

## Third parties used

Leaflet.js was used for the map and openweathermap was used for the weather data.
