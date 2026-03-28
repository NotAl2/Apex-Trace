import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import MapboxGL from '@rnmapbox/maps';

const MapScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <MapboxGL.MapView
        style={styles.map}
        styleURL={MapboxGL.StyleURL.Outdoors}
      >
        <MapboxGL.Camera
          zoomLevel={14}
          pitch={45}
          followUserLocation={true}
        />
        <MapboxGL.UserLocation visible={true} />
      </MapboxGL.MapView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  map: {
    flex: 1,
  },
});

export default MapScreen;
