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
                const { lat, lon } = data;
                setCoords({ lat, lon });
            }
        } catch (error) {
            console.error('Error fetching geolocation:', error);
        } finally {
            setLoading(false);
        }
    };

    // Separate useEffect for fetching news - runs on component mount
    useEffect(() => {
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

        getNews();
    }, []); // Empty dependency array means this runs once on mount

    // Weather-specific useEffect that depends on coords
    useEffect(() => {
        if (!coords) return;

        const fetchWeatherData = async () => {
            try {
                const { lat, lon } = coords;

                const currentRes = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
                    params: {
                        lat,
                        lon,
                        units: 'imperial',
                        appid: weatherKey,
                    },
                });

                const hourlyRes = await axios.get('https://pro.openweathermap.org/data/2.5/forecast/hourly', {
                    params: {
                        lat,
                        lon,
                        units: 'imperial',
                        cnt: 24,
                        appid: weatherKey,
                    },
                });

                const dailyRes = await axios.get('https://api.openweathermap.org/data/2.5/forecast/daily', {
                    params: {
                        lat,
                        lon,
                        cnt: 7,
                        units: 'imperial',
                        appid: weatherKey,
                    },
                });

                setWeather({
                    current: currentRes.data,
                    hourly: hourlyRes.data.list,
                    daily: dailyRes.data.list,
                });
            } catch (error) {
                console.error('Error fetching weather:', error);
            }
        };

        fetchWeatherData();
    }, [coords]);

    return (
        <div style={{ padding: '2rem' }}>
            <Typography variant="h2" gutterBottom>
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
                        Temp: {weather.current.main.temp}°F - {weather.current.weather[0].description}
                    </Typography>
                    <img
                        src={`http://openweathermap.org/img/wn/${weather.current.weather[0].icon}@2x.png`}
                        alt="weather-icon"
                    />

                    <Typography variant="h6" sx={{ mt: 2 }}>
                        Hourly Forecast (Next 24 Hours)
                    </Typography>
                    <Grid container spacing={2} sx={{ overflowX: 'auto', flexWrap: 'nowrap' }}>
                        {weather.hourly.slice(0, 8).map((item, idx) => (
                            <Grid item key={idx}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="body2">
                                            {new Date(item.dt * 1000).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </Typography>
                                        <img
                                            src={`http://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}
                                            alt="icon"
                                            width="50"
                                        />
                                        <Typography>{item.main.temp}°F</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    <Typography variant="h6" sx={{ mt: 2 }}>
                        7-Day Forecast
                    </Typography>
                    <Grid container spacing={2}>
                        {weather.daily.map((item, idx) => (
                            <Grid item xs={12} sm={6} md={3} key={idx}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="body2">
                                            {new Date(item.dt * 1000).toLocaleDateString()}
                                        </Typography>
                                        <img
                                            src={`http://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}
                                            alt="icon"
                                            width="50"
                                        />
                                        <Typography>Day: {item.temp.day}°F</Typography>
                                        <Typography>Min: {item.temp.min}°F</Typography>
                                        <Typography>Max: {item.temp.max}°F</Typography>
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