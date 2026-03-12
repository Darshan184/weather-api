import axios from "axios";

interface Event {
  body: {
    location: string;
  };
}
interface OpenWeatherResponse {
  name: string;
  main: {
    temp: number;
  };
  weather: {
    description: string;
  }[];
}
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
if (!WEATHER_API_KEY) {
  throw new Error("WEATHER_API_KEY is not found");
}
export const handler = async (event: Event) => {
  const body = event.body;
  const location = body.location;
  if (!location) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Location is required" }),
    };
  }
  try {
    const url = new URL("https://api.openweathermap.org/data/2.5/weather");
    url.searchParams.set("q", location);
    url.searchParams.set("appid", WEATHER_API_KEY);
    url.searchParams.set("units", "metric");
    const { data } = await axios.get<OpenWeatherResponse>(url.toString());
    if (!data) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: "Weather data not found for the location",
        }),
      };
    }
    const weatherSummary = {
      location: data.name,
      temperature: data.main.temp,
      description: data.weather[0]?.description,
    };
    return {
      statusCode: 200,
      body: JSON.stringify(weatherSummary),
    };
  } catch (error) {
    console.log("Error fetching weather data:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "An error occurred while fetching weather data",
      }),
    };
  }
};
