import React from 'react';
import { StyleSheet, Text, View, Image, ScrollView, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

export default function App() {
  // Static forecast data for different days
  const forecastData = [
    { day: 'Dim', icon: 'https://openweathermap.org/img/wn/01d@2x.png', temp: '22 C' },
    { day: 'Lun', icon: 'https://openweathermap.org/img/wn/02d@2x.png', temp: '21 C' },
    { day: 'Mar', icon: 'https://openweathermap.org/img/wn/03d@2x.png', temp: '18 C' },
    { day: 'Mer', icon: 'https://openweathermap.org/img/wn/04d@2x.png', temp: '19 C' },
    { day: 'Jeu', icon: 'https://openweathermap.org/img/wn/10d@2x.png', temp: '22 C' },
  ];

  // Data for the temperature graph for the next 24 hours
  const hourlyTemperatures = {
    labels: ['0', '4', '8', '12', '16', '20', '24'],
    datasets: [
      {
        data: [15, 17, 19, 22, 21, 17, 15],
      },
    ],
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        {/* Main Weather Info */}
        <Text style={styles.city}>Tizi-Ouzou</Text>
        <Image
          style={styles.weatherIcon}
          source={{ uri: 'https://openweathermap.org/img/wn/01d@2x.png' }}
        />
        <Text style={styles.temp}>22 C</Text>
        <Text style={styles.description}>Sunny</Text>

        {/* Additional Weather Details */}
        <View style={styles.additionalInfo}>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Humidity</Text>
            <Text style={styles.infoValue}>60%</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Wind</Text>
            <Text style={styles.infoValue}>5 mph</Text>
          </View>
        </View>

        {/* Temperature Graph for Next 24 Hours with Horizontal Scroll */}
        <Text style={styles.graphTitle}>Next 24h Temperature</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
          <LineChart
            data={hourlyTemperatures}
            width={600} // fixed width to allow horizontal scrolling on small screens
            height={220}
            yAxisSuffix="°F"
            chartConfig={{
              backgroundColor: '#e0f7fa',
              backgroundGradientFrom: '#e0f7fa',
              backgroundGradientTo: '#e0f7fa',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(211, 47, 47, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 121, 107, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: '#d32f2f',
              },
            }}
            bezier
            style={styles.graph}
          />
        </ScrollView>

        {/* Horizontal Forecast Section for Upcoming Days */}
        <Text style={styles.forecastTitle}>Upcoming Days</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.forecastContainer}>
          {forecastData.map((item, index) => (
            <View key={index} style={styles.forecastItem}>
              <Text style={styles.forecastDay}>{item.day}</Text>
              <Image style={styles.forecastIcon} source={{ uri: item.icon }} />
              <Text style={styles.forecastTemp}>{item.temp}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Footer with Date & Time */}
        <View style={styles.footer}>
          <Text style={styles.date}>Monday, May 5</Text>
          <Text style={styles.time}>3:00 PM</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#e0f7fa',
    paddingVertical: 20,
    alignItems: 'center',
  },
  container: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  city: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00796b',
    marginVertical: 10,
  },
  weatherIcon: {
    width: 120,
    height: 120,
  },
  temp: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginVertical: 5,
  },
  description: {
    fontSize: 24,
    color: '#616161',
    marginBottom: 20,
  },
  additionalInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginVertical: 20,
  },
  infoBox: {
    alignItems: 'center',
    flex: 1,
  },
  infoLabel: {
    fontSize: 16,
    color: '#424242',
  },
  infoValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  graphTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#00796b',
  },
  graph: {
    marginVertical: 8,
    borderRadius: 16,
  },
  forecastTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00796b',
    marginVertical: 10,
  },
  forecastContainer: {
    marginVertical: 20,
  },
  forecastItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 5,
    alignItems: 'center',
    width: 100,  // fixed width
    height: 140, // fixed height
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  forecastDay: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00796b',
  },
  forecastIcon: {
    width: 50,
    height: 50,
    marginVertical: 5,
  },
  forecastTemp: {
    fontSize: 16,
    color: '#d32f2f',
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  date: {
    fontSize: 16,
    color: '#424242',
  },
  time: {
    fontSize: 16,
    color: '#424242',
  },
});
