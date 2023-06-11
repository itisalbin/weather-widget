import { WeatherType } from "./enums";
import { IWeatherData, IFilteredWeatherData } from "./interfaces";
import SunIconUrl from "../assets/icons/sun.svg";
import ModerateCloudsIconUrl from "../assets/icons/moderate-clouds.svg";
import OvercastIconUrl from "../assets/icons/clouds.svg";
import RainIconUrl from "../assets/icons/rain.svg";

export function getWeatherIconUrl(weatherType: WeatherType): string {
  switch (weatherType) {
    case WeatherType.Sunny:
      return SunIconUrl;
    case WeatherType.ModerateClouds:
      return ModerateCloudsIconUrl;
    case WeatherType.Overcast:
      return OvercastIconUrl;
    case WeatherType.Rain:
      return RainIconUrl;
  }
}

export async function GetCurrentPosition() {
  try {
    return await new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject));
  } catch (error: any) {
    console.error(error.message);
  }
}

export function getWeatherDataAtCurrentTime(latitude: number, longitude: number): Promise<IWeatherData> {
  const truncValue = 10000; //Seems the API does not work with too many decimals
  const formatedLatitude = (Math.round(latitude * truncValue) / truncValue).toString();
  const formatedLongitude = (Math.round(longitude * truncValue) / truncValue).toString();

  const url = `https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/point/lon/${formatedLongitude}/lat/${formatedLatitude}/data.json`;

  return fetch(url)
    .then((res) => res.json())
    .then((data) => {
      const filteredWeatherData = filterSingleEntryWeatherData(data.timeSeries[0].parameters);

      const weatherData: IWeatherData = {
        weatherType: calculateWeatherType(filteredWeatherData),
        temperature: Math.trunc(filteredWeatherData.temperatureValue),
      };
      return weatherData;
    });
}

function filterSingleEntryWeatherData(rawWeatherData: any): IFilteredWeatherData {
  return {
    temperatureValue: rawWeatherData.find((parameter: any) => parameter.name === "t").values[0],
    cloudValue: rawWeatherData.find((parameter: any) => parameter.name === "tcc_mean").values[0],
    rainValue: rawWeatherData.find((parameter: any) => parameter.name === "pmean").values[0],
  };
}

function calculateWeatherType(filteredWeatherData: IFilteredWeatherData) {
  const moderateCloudsThreshold = 1;
  const overcastThreshold = 6;
  let currentWeatherType: WeatherType = WeatherType.Sunny;
  if (filteredWeatherData.rainValue > 0) {
    currentWeatherType = WeatherType.Rain;
  } else {
    if (
      filteredWeatherData.cloudValue >= moderateCloudsThreshold &&
      filteredWeatherData.cloudValue < overcastThreshold
    ) {
      currentWeatherType = WeatherType.ModerateClouds;
    } else if (filteredWeatherData.cloudValue >= overcastThreshold) {
      currentWeatherType = WeatherType.Overcast;
    }
  }
  return currentWeatherType;
}
