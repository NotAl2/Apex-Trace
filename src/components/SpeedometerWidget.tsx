import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useRideStore, RideStore } from '../store/rideStore';

const SpeedometerWidget: React.FC = () => {
  const currentSpeed = useRideStore((state: RideStore) => state.currentSpeed);

  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const maxSpeed = 100;
  const progress = Math.min(currentSpeed / maxSpeed, 1);
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <View style={styles.container}>
      <Svg width={120} height={120} viewBox="0 0 120 120" style={styles.svg}>
        {/* Background circle */}
        <Circle
          cx="60"
          cy="60"
          r={radius}
          stroke="#E8E8E8"
          strokeWidth="4"
          fill="none"
        />
        {/* Progress arc */}
        <Circle
          cx="60"
          cy="60"
          r={radius}
          stroke="#111111"
          strokeWidth="4"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>
      <View style={styles.textContainer}>
        <Text style={styles.speed}>{Math.floor(currentSpeed)}</Text>
        <Text style={styles.label}>KM/H</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 120,
    height: 120,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  svg: {
    position: 'absolute',
  },
  textContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  speed: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111111',
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666666',
    marginTop: 2,
  },
});

export default SpeedometerWidget;
