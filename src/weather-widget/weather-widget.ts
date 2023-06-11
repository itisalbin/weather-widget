import "./weather-widget.sass";
import { GetCurrentPosition, getWeatherDataAtCurrentTime, getWeatherIconUrl } from "../utils/weather-widget-utils";

const weatherWidget = document.querySelector<HTMLDivElement>("#weather-widget")!;

weatherWidget.innerHTML = `
  <div class="ww-wrapper">
    <div class="ww-weather-icon"></div>
    <p class="ww-temperature">--°C</p>
  </div>
  `;

try {
  const currentPositionGeoData: any = await GetCurrentPosition();
  if (currentPositionGeoData) {
    setWeatherData(currentPositionGeoData);
  }
} catch (error: any) {
  console.error(error.message);
}

async function setWeatherData(geoData: any) {
  const weatherData = await getWeatherDataAtCurrentTime(geoData.coords.latitude, geoData.coords.longitude);

  if (!weatherData) return;

  weatherWidget.querySelector<HTMLParagraphElement>(
    ".ww-temperature"
  )!.innerHTML = `${weatherData.temperature.toString()}°C`;
  weatherWidget.querySelector<HTMLDivElement>(".ww-weather-icon")!.style.backgroundImage = `url(${getWeatherIconUrl(
    weatherData.weatherType
  )})`;
}
