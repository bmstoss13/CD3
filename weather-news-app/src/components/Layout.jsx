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

const weatherKey = process.env.REACT_APP_WEATHER_API_KEY
const newsKey = process.env.REACT_APP_NEWS_API_KEY