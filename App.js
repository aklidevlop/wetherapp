// Import React and necessary hooks for state and lifecycle
import React, { useState, useEffect } from 'react';

// Import core components and APIs from React Native
import {
  StyleSheet,       // StyleSheet for defining component styles
  Text,             // Text component for displaying text
  View,             // View component as a container
  Image,            // Image component to display images
  ScrollView,       // ScrollView for scrollable content
  ActivityIndicator,// Loading spinner
  Alert,            // Alert for popup dialogs
  TouchableOpacity, // Pressable element for touch interactions
  Modal,            // Modal for overlay dialogs
  TextInput,        // TextInput for user input
  SafeAreaView,     // SafeAreaView to respect notches on iOS
  StatusBar,        // StatusBar to control the top bar
} from 'react-native';

// Import icon set for buttons
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Constants for API access
const API_KEY = 'your-api-key';  // Your OpenWeatherMap API key
const BASE_URL = 'https://api.openweathermap.org/data/2.5'; // Base URL for weather APIs

// Main App component
export default function App() {
  // State variables
  const [loading, setLoading] = useState(true);          // Loading state to show spinner
  const [error, setError] = useState(null);              // Error message state
  const [current, setCurrent] = useState(null);          // Current weather data
  const [dailyData, setDailyData] = useState([]);        // 5-day forecast data
  const [searchModalVisible, setSearchModalVisible] = useState(false); // Modal visibility
  const [searchQuery, setSearchQuery] = useState('');    // Search input value

  // On component mount, fetch weather for default city
  useEffect(() => {
    fetchData('Tizi-Ouzou'); // Initial fetch for Tizi-Ouzou
  }, []);

  /**
   * Fetch weather data for a given location.
   *  - Gets current weather
   *  - Gets 5-day forecast and extracts 7 daily entries at 12:00
   */
  const fetchData = async (location) => {
    try {
      // Start loading and clear previous errors
      setLoading(true);
      setError(null);

      // 1. Fetch current weather
      const weatherRes = await fetch(
        `${BASE_URL}/weather?q=${location}&units=metric&appid=${API_KEY}`
      );
      const weatherJson = await weatherRes.json();
      if (!weatherRes.ok) throw new Error(weatherJson.message);

      // Parse and save current weather
      setCurrent({
        city: weatherJson.name,                                                     // City name
        icon: `https://openweathermap.org/img/wn/${weatherJson.weather[0].icon}@2x.png`, // Weather icon URL
        temp: Math.round(weatherJson.main.temp),                                     // Temperature rounded
        description: weatherJson.weather[0].description,                              // Description (e.g., "clear sky")
        humidity: weatherJson.main.humidity,                                         // Humidity percentage
        wind: Math.round(weatherJson.wind.speed),                                     // Wind speed rounded
      });

      // 2. Fetch 5-day forecast (3h intervals)
      const forecastRes = await fetch(
        `${BASE_URL}/forecast?q=${location}&units=metric&appid=${API_KEY}`
      );
      const forecastJson = await forecastRes.json();
      if (!forecastRes.ok) throw new Error(forecastJson.message);

      // Filter list for items at 12:00:00 and take first 7 days
      const dailyList = forecastJson.list
        .filter(item => item.dt_txt.includes('12:00:00'))
        .slice(0, 7);

      // Map to usable format for UI
      setDailyData(
        dailyList.map(item => ({
          day: new Date(item.dt * 1000).toLocaleDateString('fr-FR', { weekday: 'short' }), // Day of week
          icon: `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`,          // Icon URL
          temp: `${Math.round(item.main.temp)} C`,                                          // Temp string
        }))
      );

    } catch (err) {
      // On error, show alert and save message
      setError(err.message);
      Alert.alert('Erreur', err.message);
    } finally {
      // Loading done
      setLoading(false);
    }
  };

  /**
   * Handle search submission:
   *  - Validate input
   *  - Fetch data for query
   *  - Close modal and clear input
   */
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un lieu'); // Alert if empty
      return;
    }
    fetchData(searchQuery.trim());                    // Fetch for entered city
    setSearchModalVisible(false);                     // Hide modal
    setSearchQuery('');                                // Clear input
  };

  // Show loading spinner while fetching
  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#00796b" />
      </View>
    );
  }

  // Show error if occurred
  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text>Error: {error}</Text>
      </View>
    );
  }

  // Prepare footer date and time
  const now = new Date();
  const footerDate = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  const footerTime = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  // Main UI render
  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="dark-content" />

      {/* Header with search button and title */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setSearchModalVisible(true)}>
          <MaterialCommunityIcons name="magnify" size={24} color="#00796b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Météo</Text>
      </View>

      {/* Search modal overlay */}
      <Modal transparent visible={searchModalVisible} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.searchModal}>
            <TextInput
              style={styles.searchInput}
              placeholder="Entrez une ville"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
              <Text style={styles.searchButtonText}>Rechercher</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Scrollable content for weather info */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          {/* City name */}
          <Text style={styles.city}>{current.city}</Text>

          {/* Weather icon */}
          <Image style={styles.weatherIcon} source={{ uri: current.icon }} />

          {/* Current temperature */}
          <Text style={styles.temp}>{current.temp} C</Text>

          {/* Weather description */}
          <Text style={styles.description}>{current.description}</Text>

          {/* Additional info: humidity and wind */}
          <View style={styles.additionalInfo}>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Humidité</Text>
              <Text style={styles.infoValue}>{current.humidity}%</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Vent</Text>
              <Text style={styles.infoValue}>{current.wind} m/s</Text>
            </View>
          </View>

          {/* 7-day forecast title */}
          <Text style={styles.forecastTitle}>Prévisions 7 jours</Text>

          {/* Horizontal scroll for daily forecast */}
          <ScrollView
            horizontal
            nestedScrollEnabled
            showsHorizontalScrollIndicator
            contentContainerStyle={styles.forecastContainer}
          >
            {dailyData.map((item, idx) => (
              <View key={idx} style={styles.forecastItem}>
                <Text style={styles.forecastDay}>{item.day}</Text>
                <Image style={styles.forecastIcon} source={{ uri: item.icon }} />
                <Text style={styles.forecastTemp}>{item.temp}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Footer showing current date and time */}
          <View style={styles.footer}>
            <Text style={styles.date}>{footerDate}</Text>
            <Text style={styles.time}>{footerTime}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Stylesheet for all components
const styles = StyleSheet.create({
  // Safe area container to respect device notches
  safeContainer: { flex: 1, backgroundColor: '#e0f7fa' },
  // Main container centering children
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  // Utility style to center loading/error screens
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  // Header styles
  header: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#b2dfdb', justifyContent: 'center' },
  headerTitle: { marginLeft: 10, fontSize: 18, fontWeight: 'bold', color: '#00796b' },

  // Modal overlay background
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,121,107,0.5)', justifyContent: 'center', alignItems: 'center' },
  // Modal content container
  searchModal: { width: '80%', backgroundColor: '#fff', borderRadius: 8, padding: 15 },
  // TextInput in modal
  searchInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 10, marginBottom: 10 },
  // Search button style
  searchButton: { backgroundColor: '#00796b', padding: 12, borderRadius: 6, alignItems: 'center' },
  searchButtonText: { color: '#fff', fontWeight: '600' },

  // ScrollView content container
  scrollContainer: { flexGrow: 1, alignItems: 'center', paddingBottom: 50 },

  // Current weather display
  city: { fontSize: 32, fontWeight: 'bold', color: '#00796b', marginVertical: 10 },
  weatherIcon: { width: 120, height: 120 },
  temp: { fontSize: 48, fontWeight: 'bold', color: '#d32f2f', marginVertical: 5 },
  description: { fontSize: 24, color: '#616161', marginBottom: 20, textTransform: 'capitalize' },

  // Additional info row
  additionalInfo: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginVertical: 20 },
  infoBox: { alignItems: 'center', flex: 1 },
  infoLabel: { fontSize: 16, color: '#424242' },
  infoValue: { fontSize: 20, fontWeight: 'bold', color: '#000' },

  // Forecast section
  forecastTitle: { fontSize: 20, fontWeight: 'bold', color: '#00796b', marginVertical: 10 },
  forecastContainer: { flexDirection: 'row', paddingHorizontal: 10 },
  forecastItem: { backgroundColor: '#fff', borderRadius: 10, padding: 10, marginHorizontal: 5, alignItems: 'center', width: 100, height: 140, justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  forecastDay: { fontSize: 18, fontWeight: 'bold', color: '#00796b' },
  forecastIcon: { width: 50, height: 50, marginVertical: 5 },
  forecastTemp: { fontSize: 16, color: '#d32f2f' },

  // Footer styles
  footer: { alignItems: 'center', marginTop: 20 },
  date: { fontSize: 16, color: '#424242' },
  time: { fontSize: 16, color: '#424242' },
});
