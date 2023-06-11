import { WeatherType } from "./enums";

export interface IFilteredWeatherData {
  temperatureValue: number;
  cloudValue: number;
  rainValue: number;
}

export interface IWeatherData {
  weatherType: WeatherType;
  temperature: number;
}
