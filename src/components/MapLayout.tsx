import React, { useEffect, useRef } from 'react';
import {
  View,
  useWindowDimensions,
  Animated,
  StyleSheet,
} from 'react-native';
import MapScreen from '../screens/MapScreen'
import SpeedometerWidget from './SpeedometerWidget';
import RideStatsHUD from './RideStatsHUD';

const MapLayout: React.FC = () => {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const landscapeOpacity = useRef(new Animated.Value(isLandscape ? 1 : 0))
    .current;
  const portraitOpacity = useRef(new Animated.Value(!isLandscape ? 1 : 0))
    .current;

  useEffect(() => {
    Animated.timing(landscapeOpacity, {
      toValue: isLandscape ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();

    Animated.timing(portraitOpacity, {
      toValue: !isLandscape ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isLandscape, landscapeOpacity, portraitOpacity]);

  return (
    <View style={styles.container}>
      {isLandscape ? (
        <Animated.View
          style={[styles.landscapeLayout, { opacity: landscapeOpacity }]}
          pointerEvents={isLandscape ? 'auto' : 'none'}
        >
          <MapScreen />
          <SpeedometerWidget />
          <RideStatsHUD />
          <View style={styles.musicPlayerLandscape} />
        </Animated.View>
      ) : (
        <Animated.View
          style={[styles.portraitLayout, { opacity: portraitOpacity }]}
          pointerEvents={!isLandscape ? 'auto' : 'none'}
        >
          <MapScreen />
          <View style={styles.portraitBottomPill}>
            <SpeedometerWidget />
            <View style={styles.musicPlayerPortrait} />
          </View>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  landscapeLayout: {
    flex: 1,
  },
  portraitLayout: {
    flex: 1,
  },
  portraitBottomPill: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    height: 120,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  musicPlayerLandscape: {
    position: 'absolute',
    bottom: 90,
    left: 16,
    width: 60,
    height: 60,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  musicPlayerPortrait: {
    width: 60,
    height: 60,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginRight: 8,
  },
});

export default MapLayout;
