import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRideStore, RideStore } from '../store/rideStore';

const RideStatsHUD: React.FC = () => {
  const distance = useRideStore((state: RideStore) => state.distance);
  const elapsedSeconds = useRideStore((state: RideStore) => state.elapsedSeconds);
  const avgSpeed = useRideStore((state: RideStore) => state.avgSpeed);
  const topSpeed = useRideStore((state: RideStore) => state.topSpeed);
  const elevation = useRideStore((state: RideStore) => state.elevation);
  const elevationGain = useRideStore((state: RideStore) => state.elevationGain);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const StatCard: React.FC<{ label: string; value: string }> = ({
    label,
    value,
  }) => (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <StatCard label="Distance" value={`${distance.toFixed(2)} km`} />
        <View style={styles.divider} />
        <StatCard label="Ride Time" value={formatTime(elapsedSeconds)} />
        <View style={styles.divider} />
        <StatCard label="Avg Speed" value={`${avgSpeed.toFixed(1)} km/h`} />
        <View style={styles.divider} />
        <StatCard label="Top Speed" value={`${topSpeed.toFixed(1)} km/h`} />
        <View style={styles.divider} />
        <StatCard label="Elevation" value={`${elevation.toFixed(0)} m`} />
        <View style={styles.divider} />
        <StatCard
          label="Elev. Gain"
          value={`${elevationGain.toFixed(0)} m`}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    paddingBottom: 16,
    paddingHorizontal: 8,
  },
  row: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    overflow: 'hidden',
  },
  card: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    width: 1,
    backgroundColor: '#E8E8E8',
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666666',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111111',
  },
});

export default RideStatsHUD;
