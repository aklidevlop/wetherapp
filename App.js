import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Modal,
  TextInput,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const API_KEY = '1764b9c2364a214a315e7be920afe215';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [current, setCurrent] = useState(null);
  const [dailyData, setDailyData] = useState([]);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData('Tizi-Ouzou');
  }, []);

  const fetchData = async (location) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch current weather
      const weatherRes = await fetch(
        `${BASE_URL}/weather?q=${location}&units=metric&appid=${API_KEY}`
      );
      const weatherJson = await weatherRes.json();
      if (!weatherRes.ok) throw new Error(weatherJson.message);

      setCurrent({
        city: weatherJson.name,
        icon: `https://openweathermap.org/img/wn/${weatherJson.weather[0].icon}@2x.png`,
        temp: Math.round(weatherJson.main.temp),
        description: weatherJson.weather[0].description,
        humidity: weatherJson.main.humidity,
        wind: Math.round(weatherJson.wind.speed),
      });

      // Fetch 5-day / 3h forecast and extract 7 daily at 12:00
      const forecastRes = await fetch(
        `${BASE_URL}/forecast?q=${location}&units=metric&appid=${API_KEY}`
      );
      const forecastJson = await forecastRes.json();
      if (!forecastRes.ok) throw new Error(forecastJson.message);

      const dailyList = forecastJson.list
        .filter(item => item.dt_txt.includes('12:00:00'))
        .slice(0, 7);
      setDailyData(
        dailyList.map(item => ({
          day: new Date(item.dt * 1000).toLocaleDateString('fr-FR', { weekday: 'short' }),
          icon: `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`,
          temp: `${Math.round(item.main.temp)} C`,
        }))
      );

    } catch (err) {
      setError(err.message);
      Alert.alert('Erreur', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un lieu');
      return;
    }
    fetchData(searchQuery.trim());
    setSearchModalVisible(false);
    setSearchQuery('');
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#00796b" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text>Error: {error}</Text>
      </View>
    );
  }

  const now = new Date();
  const footerDate = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  const footerTime = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setSearchModalVisible(true)}>
          <MaterialCommunityIcons name="magnify" size={24} color="#00796b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Météo</Text>
      </View>

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

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Text style={styles.city}>{current.city}</Text>
          <Image style={styles.weatherIcon} source={{ uri: current.icon }} />
          <Text style={styles.temp}>{current.temp} C</Text>
          <Text style={styles.description}>{current.description}</Text>

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

          <Text style={styles.forecastTitle}>Prévisions 7 jours</Text>
          <ScrollView
            horizontal
            nestedScrollEnabled={true}
            showsHorizontalScrollIndicator={false}
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

          <View style={styles.footer}>
            <Text style={styles.date}>{footerDate}</Text>
            <Text style={styles.time}>{footerTime}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: '#e0f7fa' },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#b2dfdb', justifyContent: 'center' },
  headerTitle: { marginLeft: 10, fontSize: 18, fontWeight: 'bold', color: '#00796b' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,121,107,0.5)', justifyContent: 'center', alignItems: 'center' },
  searchModal: { width: '80%', backgroundColor: '#fff', borderRadius: 8, padding: 15 },
  searchInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 10, marginBottom: 10 },
  searchButton: { backgroundColor: '#00796b', padding: 12, borderRadius: 6, alignItems: 'center' },
  searchButtonText: { color: '#fff', fontWeight: '600' },
  scrollContainer: { flexGrow: 1, alignItems: 'center', paddingBottom: 50 },
  city: { fontSize: 32, fontWeight: 'bold', color: '#00796b', marginVertical: 10 },
  weatherIcon: { width: 120, height: 120 },
  temp: { fontSize: 48, fontWeight: 'bold', color: '#d32f2f', marginVertical: 5 },
  description: { fontSize: 24, color: '#616161', marginBottom: 20, textTransform: 'capitalize' },
  additionalInfo: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginVertical: 20 },
  infoBox: { alignItems: 'center', flex: 1 },
  infoLabel: { fontSize: 16, color: '#424242' },
  infoValue: { fontSize: 20, fontWeight: 'bold', color: '#000' },
  forecastTitle: { fontSize: 20, fontWeight: 'bold', color: '#00796b', marginVertical: 10 },
  forecastContainer: { flexDirection: 'row', paddingHorizontal: 10 },
  forecastItem: { backgroundColor: '#fff', borderRadius: 10, padding: 10, marginHorizontal: 5, alignItems: 'center', width: 100, height: 140, justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  forecastDay: { fontSize: 18, fontWeight: 'bold', color: '#00796b' },
  forecastIcon: { width: 50, height: 50, marginVertical: 5 },
  forecastTemp: { fontSize: 16, color: '#d32f2f' },
  footer: { alignItems: 'center', marginTop: 20 },
  date: { fontSize: 16, color: '#424242' },
  time: { fontSize: 16, color: '#424242' },
});
