import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import MapComponent from '../components/MapComponent';
import { getShuttles } from '../services/FirebaseService';

const HomeScreen = () => {
  const [shuttles, setShuttles] = useState([]);

  useEffect(() => {
    const unsubscribe = getShuttles((data) => {
      if (data) {
        const shuttleList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setShuttles(shuttleList);
      }
    });
    return unsubscribe;
  }, []);

  return (
    <View style={styles.container}>
      <MapComponent shuttles={shuttles.length > 0 ? shuttles : [
        { id: '1', latitude: 37.0902, longitude: -89.2186, speed: 30, routeID: 'route1' },
        { id: '2', latitude: 37.0950, longitude: -89.2200, speed: 25, routeID: 'route1' },
      ]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default HomeScreen;
