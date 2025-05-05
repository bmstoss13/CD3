import { useEffect, useState } from 'react';
import axios from 'axios';
import {
    TextField,
    Button,
    Card,
    CardContent,
    Typography,
    Grid,
    CircularProgress,
} from '@mui/material';

const weatherKey = import.meta.env.VITE_WEATHER_API_KEY;
const newsKey = import.meta.env.VITE_NEWS_API_KEY;

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
                    `https://api.nytimes.com/svc/topstories/v2/home.json?api-key=${newsKey}`
                );
                setNews(response.data.results.slice(0, 5));
            } catch (error) {
                console.error('Error fetching news:', error);
            }
        };

        getWeather();
        getNews();
    }, [coords]);

    return(
        <div style={{ padding: '2rem'}}>
            <Typography variant='h2' gutterBottom>
                The Daily Climate
            </Typography>

            <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Enter city, zip, etc."
                        variant="outlined"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                    />
                </Grid>
                <Grid item xs={12} sm={3}>
                    <Button fullWidth variant="contained" onClick={handleLocationSearch}>
                        Get Weather
                    </Button>
                </Grid>
            </Grid>

            {loading && <CircularProgress sx={{ mt: 2 }} />}

            {coords && (
                <Typography variant="body1" sx={{ mt: 2 }}>
                    Latitude: {coords.lat}, Longitude: {coords.lon}
                </Typography>
            )}

            {weather && (
                <div style={{ marginTop: '2rem' }}>
                    <Typography variant="h5">Current Weather</Typography>
                    <Typography>
                        Temp: {weather.current.temp}°C - {weather.current.weather[0].description}
                    </Typography>
                    <img
                        src={`http://openweathermap.org/img/wn/${weather.current.weather[0].icon}@2x.png`}
                        alt="weather-icon"
                    />

                    <Typography variant="h6" sx={{ mt: 2 }}>
                        Hourly Forecast (next 24 hrs)
                    </Typography>
                    <Grid container spacing={2} sx={{ overflowX: 'auto', flexWrap: 'nowrap' }}>
                        {weather.hourly.slice(0, 24).map((hour, idx) => (
                            <Grid item key={idx}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="body2">
                                            {new Date(hour.dt * 1000).getHours()}:00
                                        </Typography>
                                        <img
                                            src={`http://openweathermap.org/img/wn/${hour.weather[0].icon}@2x.png`}
                                            alt="icon"
                                            width="50"
                                        />
                                        <Typography>{hour.temp}°C</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    <Typography variant="h6" sx={{ mt: 2 }}>
                        7-Day Forecast
                    </Typography>
                    <Grid container spacing={2}>
                        {weather.daily.slice(0, 7).map((day, idx) => (
                            <Grid item xs={12} sm={6} md={3} key={idx}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="body2">
                                            {new Date(day.dt * 1000).toLocaleDateString()}
                                        </Typography>
                                        <img
                                            src={`http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                                            alt="icon"
                                            width="50"
                                        />
                                        <Typography>Day: {day.temp.day}°C</Typography>
                                        <Typography>Night: {day.temp.night}°C</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </div>
            )}

            {news.length > 0 && (
                <div style={{ marginTop: '3rem' }}>
                    <Typography variant="h5">Top News Stories</Typography>
                    <Grid container spacing={2}>
                        {news.map((article, idx) => (
                            <Grid item xs={12} md={6} key={idx}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6">{article.title}</Typography>
                                        <Typography variant="subtitle2">{article.byline}</Typography>
                                        <Typography variant="body2">{article.abstract}</Typography>
                                        {article.multimedia && article.multimedia[0] && (
                                            <img
                                                src={article.multimedia[0].url}
                                                alt={article.title}
                                                style={{ width: '100%', marginTop: '1rem' }}
                                            />
                                        )}
                                        <Button
                                            variant="outlined"
                                            href={article.url}
                                            target="_blank"
                                            sx={{ mt: 1 }}
                                        >
                                            Read more
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </div>
            )}
        </div>
    );
};

