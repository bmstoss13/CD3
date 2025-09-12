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
    Box,
} from '@mui/material';

const weatherKey = import.meta.env.VITE_WEATHER_API_KEY;
const newsKey = import.meta.env.VITE_NEWS_API_KEY;

export const Layout = () => {
    const [location, setLocation] = useState('');
    const [coords, setCoords] = useState(null);
    const [weather, setWeather] = useState(null);
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setCoords({ lat: latitude, lon: longitude });
                    setLoading(false);
                },
                (error) => {
                    console.error('Error getting current location:', error);
                    setLoading(false);
                }
            );
        } else {
            console.error('Geolocation is not supported by this browser.');
            setLoading(false);
        }
    }, []);

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
    }, []);

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
        <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
            <Typography variant="h2" gutterBottom align="center">
                The Daily Climate
            </Typography>

            <Grid container spacing={2} alignItems="center" justifyContent="center">
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
                    <Button fullWidth variant="contained" onClick={handleLocationSearch} sx={{ height: '56px' }}>
                        Get Weather
                    </Button>
                </Grid>
            </Grid>

            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            )}

            {!loading && !weather && (
                <Box sx={{ mt: 4, p: 4, textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary">
                        Enter a location or enable geolocation to see the weather. 🌤️
                    </Typography>
                </Box>
            )}

            {weather && (
                <Box sx={{ mt: 4 }}>
                    {/* Current Weather Section */}
                    <Card sx={{ p: 3, mb: 4, textAlign: 'center' }}>
                        <Typography variant="h4" component="h3" gutterBottom>
                            Current Weather
                        </Typography>
                        <Typography variant="h2" component="div">
                            {weather.current.main.temp}°F
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                            {weather.current.weather[0].description}
                        </Typography>
                        <img
                            src={`http://openweathermap.org/img/wn/${weather.current.weather[0].icon}@4x.png`}
                            alt="weather-icon"
                            style={{ width: 120, height: 120 }}
                        />
                    </Card>

                    {/* Hourly Forecast */}
                    <Typography variant="h5" gutterBottom>
                        Hourly Forecast
                    </Typography>
                    <Grid container spacing={2} sx={{ overflowX: 'auto', flexWrap: 'nowrap', justifyContent: 'center', height: 150 }}>
                        {weather.hourly.slice(0, 8).map((item, idx) => (
                            <Grid item key={idx}>
                                <Card sx={{ minWidth: 100 }}>
                                    <CardContent sx={{ textAlign: 'center' }}>
                                        <Typography variant="body2" color="text.secondary">
                                            {new Date(item.dt * 1000).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </Typography>
                                        <img
                                            src={`http://openweathermap.org/img/wn/${item.weather[0].icon}.png`}
                                            alt="icon"
                                            width="50"
                                        />
                                        <Typography>{Math.round(item.main.temp)}°F</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    {/* 7-Day Forecast */}
                    <Typography variant="h5" sx={{ mt: 4, mb: 2, justifyContent: 'center' }}>
                        7-Day Forecast
                    </Typography>
                    <Grid container spacing={2} sx={{ justifyContent: 'center'}}>
                        {weather.daily.map((item, idx) => (
                            <Grid item xs={12} sm={6} md={3} key={idx}>
                                <Card>
                                    <CardContent sx={{ textAlign: 'center' }}>
                                        <Typography variant="subtitle1" gutterBottom>
                                            {new Date(item.dt * 1000).toLocaleDateString()}
                                        </Typography>
                                        <img
                                            src={`http://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}
                                            alt="icon"
                                            width="50"
                                        />
                                        <Typography>High: {Math.round(item.temp.max)}°F</Typography>
                                        <Typography>Low: {Math.round(item.temp.min)}°F</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}

            {news.length > 0 && (
                <Box sx={{ mt: 6 }}>
                    <Typography variant="h5" gutterBottom>
                        Top News Stories
                    </Typography>
                    <Grid container spacing={4}>
                        {news.map((article, idx) => (
                            <Grid item xs={12} md={6} key={idx}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>{article.title}</Typography>
                                        <Typography variant="subtitle2" color="text.secondary">{article.byline}</Typography>
                                        <Typography variant="body2" sx={{ my: 2 }}>{article.abstract}</Typography>
                                        {article.multimedia && article.multimedia[0] && (
                                            <img
                                                src={article.multimedia[0].url}
                                                alt={article.title}
                                                style={{ width: '100%', display: 'block' }}
                                            />
                                        )}
                                        <Button
                                            variant="outlined"
                                            href={article.url}
                                            target="_blank"
                                            sx={{ mt: 2 }}
                                        >
                                            Read more
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}
        </Box>
    );
};