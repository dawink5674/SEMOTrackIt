import React from 'react';
import MapView, { Marker } from 'react-native-maps';
import { View, StyleSheet } from 'react-native';

const MapComponent = ({ shuttles }) => {
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 37.0902, // SEMO approximate location
          longitude: -89.2186,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {shuttles.map(shuttle => (
          <Marker
            key={shuttle.id}
            coordinate={{
              latitude: shuttle.latitude,
              longitude: shuttle.longitude,
            }}
            title={`Shuttle ${shuttle.id}`}
            description={`Speed: ${shuttle.speed} mph`}
          />
        ))}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});

export default MapComponent;
