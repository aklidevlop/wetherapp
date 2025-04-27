import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { Dimensions } from 'react-native';
const screenWidth = Dimensions.get('window').width;
const API_KEY = 'your-api-key';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="WeatherScreen" component={WeatherScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function WeatherScreen() {
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWeatherData('ouacif');
  }, []);

  const fetchWeatherData = async (location) => {
    try {
      setLoading(true);
      setError(null);
      const weatherRes = await fetch(
        `${BASE_URL}/weather?q=${location}&units=metric&appid=${API_KEY}`
      );
      const weatherJson = await weatherRes.json();
      if (!weatherRes.ok) throw new Error(weatherJson.message);

      const forecastRes = await fetch(
        `${BASE_URL}/forecast?q=${location}&units=metric&appid=${API_KEY}`
      );
      const forecastJson = await forecastRes.json();
      if (!forecastRes.ok) throw new Error(forecastJson.message);

      setWeatherData({
        temp: Math.round(weatherJson.main.temp),
        condition: weatherJson.weather[0].main,
        high: Math.round(weatherJson.main.temp_max),
        low: Math.round(weatherJson.main.temp_min),
        wind: Math.round(weatherJson.wind.speed * 3.6),
        humidity: weatherJson.main.humidity,
        icon: getWeatherIcon(weatherJson.weather[0].main),
        location: weatherJson.name,
        time: new Date().toLocaleString('en-US', { weekday: 'long', hour: '2-digit', minute: '2-digit' })
      });

      const daily = forecastJson.list.filter(i => i.dt_txt.includes('12:00:00')).slice(0, 7);
      setForecastData(daily.map(i => ({
        day: new Date(i.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
        icon: getWeatherIcon(i.weather[0].main),
        temp: Math.round(i.main.temp)
      })));
    } catch (err) {
      setError(err.message);
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = cond => {
    switch (cond.toLowerCase()) {
      case 'clear': return 'weather-sunny';
      case 'rain': return 'weather-pouring';
      case 'clouds': return 'weather-cloudy';
      case 'snow': return 'weather-snowy';
      case 'thunderstorm': return 'weather-lightning';
      default: return 'weather-partly-cloudy';
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      Alert.alert('Error', 'Please enter a location');
      return;
    }
    fetchWeatherData(searchQuery.trim());
    setSearchModalVisible(false);
    setSearchQuery('');
  };

  if (loading && !weatherData) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#6E59A5" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => fetchWeatherData('ouacif')}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.customHeader}>
          <TouchableOpacity onPress={() => setSearchModalVisible(true)}>
            <MaterialCommunityIcons name="magnify" size={24} color="#6E59A5" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Weather App</Text>
        </View>

        {/* Search Modal */}
        <Modal transparent visible={searchModalVisible} animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.searchModal}>
              <TextInput style={styles.searchInput} placeholder="Enter city" value={searchQuery} onChangeText={setSearchQuery} onSubmitEditing={handleSearch} returnKeyType="search" />
              <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                <Text style={styles.searchButtonText}>Search</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Location & Time */}
        <View style={styles.header}>
          <Text style={styles.location}>{weatherData.location}</Text>
          <Text style={styles.time}>{weatherData.time}</Text>
        </View>

        {/* Current Weather */}
        <View style={styles.currentWeather}>
          <MaterialCommunityIcons name={weatherData.icon} size={120} color="#9B87F5" />
          <Text style={styles.temp}>{weatherData.temp}°</Text>
          <Text style={styles.condition}>{weatherData.condition}</Text>
          <Text style={styles.highLow}>H: {weatherData.high}° L: {weatherData.low}°</Text>
        </View>

        {/* Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="weather-windy" size={30} color="#6E59A5" />
            <Text style={styles.detailText}>{weatherData.wind} km/h</Text>
            <Text style={styles.detailLabel}>Wind</Text>
          </View>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="water" size={30} color="#6E59A5" />
            <Text style={styles.detailText}>{weatherData.humidity}%</Text>
            <Text style={styles.detailLabel}>Humidity</Text>
          </View>
        </View>

        {/* Forecast */}
        {/* Forecast */}
        <Text style={styles.sectionTitle}>7-Day Forecast</Text>
<ScrollView 
  horizontal 
  showsHorizontalScrollIndicator={false}
  contentContainerStyle={styles.forecastScrollContainer}
>
  {forecastData.map((day, i) => (
    <View key={i} style={[styles.forecastCard, { width: screenWidth / 10 }]}>
      <Text style={styles.forecastDay}>{day.day}</Text>
      <MaterialCommunityIcons 
        name={day.icon} 
        size={32} 
        color="#6E59A5" 
        style={styles.forecastIcon}
      />
      <Text style={styles.forecastTemp}>{day.temp}°</Text>
    </View>
  ))}
</ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F0FB' },
  center: { justifyContent: 'center', alignItems: 'center' },
  scrollView: { flex: 1 },
  scrollViewContent: { flexGrow: 1, paddingBottom: 50 },
  customHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15, backgroundColor: '#E5DEFF' },
  headerTitle: { marginLeft: 10, fontSize: 18, fontWeight: 'bold', color: '#6E59A5' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(110,89,165,0.5)', justifyContent: 'center', alignItems: 'center' },
  searchModal: { width: '80%', backgroundColor: '#FFF', borderRadius: 8, padding: 15 },
  searchInput: { borderWidth: 1, borderColor: '#DDD', borderRadius: 6, padding: 10, marginBottom: 10 },
  searchButton: { backgroundColor: '#6E59A5', padding: 12, borderRadius: 6, alignItems: 'center' },
  searchButtonText: { color: '#FFF', fontWeight: '600' },
  header: { alignItems: 'center', padding: 20 },
  location: { fontSize: 24, fontWeight: 'bold', color: '#6E59A5' },
  time: { fontSize: 16, color: '#8E9196', marginTop: 5 },
  currentWeather: { alignItems: 'center', marginVertical: 30 },
  temp: { fontSize: 72, fontWeight: '200', color: '#6E59A5', marginTop: 10 },
  condition: { fontSize: 24, color: '#8E9196', marginTop: 5 },
  highLow: { fontSize: 18, color: '#8E9196', marginTop: 5 },
  detailsContainer: { flexDirection: 'row', justifyContent: 'space-around', marginHorizontal: 20, marginVertical: 30, backgroundColor: '#E5DEFF', borderRadius: 15, padding: 15 },
  detailItem: { alignItems: 'center' },
  detailText: { fontSize: 18, color: '#6E59A5', marginTop: 5 },
  detailLabel: { fontSize: 14, color: '#8E9196', marginTop: 5 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#6E59A5', marginLeft: 20, marginBottom: 15 },
  forecastScrollContainer: {
    paddingHorizontal: 10,
    paddingBottom: 20,
    height: 140,
    alignItems: 'center'
  },
  forecastCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 6,
    height: 120,
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#6E59A5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  forecastDay: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6E59A5',
    textAlign: 'center'
  },
  forecastIcon: {
    marginVertical: 6
  },
  forecastTemp: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6E59A5',
    textAlign: 'center'
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6E59A5',
    marginLeft: 15,
    marginBottom: 10,
    marginTop: 20
  },
});
