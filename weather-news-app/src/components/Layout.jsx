import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  TextField,
  Button,
  Typography,
} from '@mui/material';

const weatherKey = process.env.REACT_APP_WEATHER_API_KEY;
const newsKey = process.env.REACT_APP_NEWS_API_KEY;

export const Layout = () => {
    const [location, setLocation] = useState('');
    const [coords, setCoords] = useState(null);
    const [weather, setWeather] = useState(null);
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleLocationSearch = async () => {
        setLoading(true);
        try {
            const response = await axios.get('https://api.openweathermap.org/geo/1.0/direct', {
                params: {
                    q: location,
                    limit: 1,
                    appid: weatherKey,
                },
            });

            const [data] = response.data;
            if (data) {
                const {lat, lon} = data;
                setCoords({lat, lon});
            }
        } catch (error) {
            console.error('Error fetching geolocation:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const getWeather = async () => {
            if(!coords) return;
        
            try {
                const response = await axios.get('https://api.openweathermap.org/data/3.0/onecall', {
                    params: {
                        lat: coords.lat,
                        lon: coords.lon,
                        exclude: 'alerts',
                        units: 'metric',
                        appid: weatherKey,
                    },
                });
                setWeather(response.data);
            } catch (error) {
                console.error('Error fetching weather', error);
            }
        };
        const getNews = async () => {
            try {
              const response = await axios.get(
                'https://api.nytimes.com/svc/topstories/v2/home.json?api-key=${newsKey}'
              );
              setNews(response.data.results.slice(0, 5));
            } catch (error) {
              console.error('Error fetching news:', error);
            }
          };

          getWeather();
          getNews();
        }, [coords]);
}

