import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapboxGL from '@rnmapbox/maps';
import * as Location from 'expo-location';
import { useRideStore } from '../store/rideStore';

const MAPBOX_ACCESS_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN;
if (MAPBOX_ACCESS_TOKEN) {
  MapboxGL.setAccessToken(MAPBOX_ACCESS_TOKEN);
}

const TRACKS = [
  { title: 'Midnight City', artist: 'M83' },
  { title: 'Intro', artist: 'The xx' },
  { title: 'Dissolve', artist: 'Absofacto' },
  { title: 'Time', artist: 'Hans Zimmer' },
];

const STATS = [
  { label: 'DISTANCE', getValue: (s: any) => `${s.distance.toFixed(1)} KM` },
  { label: 'RIDE TIME', getValue: (s: any) => {
    const m = Math.floor(s.elapsedSeconds / 60).toString().padStart(2, '0');
    const sec = (s.elapsedSeconds % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  }},
  { label: 'AVG SPEED', getValue: (s: any) => `${Math.round(s.avgSpeed)} KM/H` },
  { label: 'TOP SPEED', getValue: (s: any) => `${Math.round(s.topSpeed)} KM/H` },
  { label: 'ELEVATION', getValue: (s: any) => `${Math.round(s.elevation)} M` },
  { label: 'ELEV. GAIN', getValue: (s: any) => `${Math.round(s.elevationGain)} M` },
];

const MicIcon = ({ muted, size = 14 }: { muted: boolean; size?: number }) => (
  <View style={{ alignItems: 'center', justifyContent: 'center', width: size, height: size + 4 }}>
    <View style={{
      width: size * 0.55, height: size * 0.7,
      borderRadius: size * 0.28,
      borderWidth: 1.5,
      borderColor: muted ? '#ff4444' : '#fff',
    }} />
    <View style={{
      width: size * 0.8, height: size * 0.4,
      borderBottomLeftRadius: size * 0.4,
      borderBottomRightRadius: size * 0.4,
      borderWidth: 1.5,
      borderColor: muted ? '#ff4444' : '#fff',
      borderTopWidth: 0,
      marginTop: -2,
    }} />
    <View style={{ width: 1.5, height: size * 0.2, backgroundColor: muted ? '#ff4444' : '#fff' }} />
    {muted && (
      <View style={{
        position: 'absolute',
        width: size * 1.1, height: 1.5,
        backgroundColor: '#ff4444',
        transform: [{ rotate: '-45deg' }],
      }} />
    )}
  </View>
);

const PrevIcon = () => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 1 }}>
    <View style={{ width: 2, height: 8, backgroundColor: '#111', borderRadius: 1 }} />
    <View style={{ width: 0, height: 0, borderTopWidth: 4, borderBottomWidth: 4, borderRightWidth: 6, borderTopColor: 'transparent', borderBottomColor: 'transparent', borderRightColor: '#111' }} />
  </View>
);

const NextIcon = () => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 1 }}>
    <View style={{ width: 0, height: 0, borderTopWidth: 4, borderBottomWidth: 4, borderLeftWidth: 6, borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: '#111' }} />
    <View style={{ width: 2, height: 8, backgroundColor: '#111', borderRadius: 1 }} />
  </View>
);

const SpeedometerWidget = () => {
  const speed = useRideStore((state: any) => state.currentSpeed);
  return (
    <View style={styles.speedometerCard}>
      <View style={styles.speedometerRing}>
        <Text style={styles.speedNumber}>{Math.round(speed)}</Text>
        <Text style={styles.speedUnit}>KM/H</Text>
      </View>
    </View>
  );
};

const StatsBlock = ({ isLandscape }: { isLandscape: boolean }) => {
  const store = useRideStore((state: any) => state);
  const [statIndex, setStatIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const cycleStat = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
    setStatIndex(i => (i + 1) % STATS.length);
  };

  const current = STATS[statIndex];

  return (
    <TouchableOpacity
      style={[styles.statsBlock, isLandscape ? { width: 170, flex: 0 } : { flex: 1 }]}
      onPress={cycleStat}
      activeOpacity={0.85}
    >
      <Animated.View style={{ opacity: fadeAnim }}>
        <Text style={styles.statsLabel}>{current.label}</Text>
        <Text style={[styles.statsValue, isLandscape && { fontSize: 18 }]}>
          {current.getValue(store)}
        </Text>
      </Animated.View>
      <View style={styles.statsDots}>
        {STATS.map((_, i) => (
          <View key={i} style={[styles.statsDot, i === statIndex && styles.statsDotActive]} />
        ))}
      </View>
    </TouchableOpacity>
  );
};

const MusicSection = ({ isLandscape }: { isLandscape: boolean }) => {
  const [trackIndex, setTrackIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const pillWidth = isLandscape ? 150 : 115;

  const changeTrack = (direction: 'next' | 'prev') => {
    const toValue = direction === 'next' ? -20 : 20;
    Animated.parallel([
      Animated.timing(slideAnim, { toValue, duration: 120, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 0, duration: 120, useNativeDriver: true }),
    ]).start(() => {
      setTrackIndex(i => direction === 'next' ? (i + 1) % TRACKS.length : (i - 1 + TRACKS.length) % TRACKS.length);
      slideAnim.setValue(-toValue);
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 0, duration: 120, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
      ]).start();
    });
  };

  const track = TRACKS[trackIndex];

  return (
    <View style={{ width: pillWidth, gap: 5 }}>
      <View style={styles.mediaRow}>
        <TouchableOpacity style={styles.mediaBtn} onPress={() => changeTrack('prev')} activeOpacity={0.7}>
          <PrevIcon />
        </TouchableOpacity>
        <TouchableOpacity style={styles.mediaBtn} onPress={() => changeTrack('next')} activeOpacity={0.7}>
          <NextIcon />
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={[styles.musicPill, { width: pillWidth }]}
        onPress={() => setPlaying(p => !p)}
        activeOpacity={0.85}
      >
        <View style={[styles.musicDot, { backgroundColor: playing ? '#111' : '#ccc' }]} />
        <Animated.View style={{ transform: [{ translateX: slideAnim }], opacity: opacityAnim }}>
          <Text style={styles.musicPillTitle} numberOfLines={1}>{track.title}</Text>
          <Text style={styles.musicPillArtist} numberOfLines={1}>{track.artist}</Text>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

const MapScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const [muted, setMuted] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Safe padding — minimum 12px, or inset if larger
  const padLeft = Math.max(insets.left, 12);
  const padRight = Math.max(insets.right, 12);
  const padBottom = Math.max(insets.bottom, 8);

  useEffect(() => {
    (async () => { await Location.requestForegroundPermissionsAsync(); })();
  }, []);

  useEffect(() => {
    if (!muted) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(fadeAnim, { toValue: 0.4, duration: 800, useNativeDriver: true }),
          Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    } else {
      fadeAnim.stopAnimation();
      fadeAnim.setValue(1);
    }
  }, [muted]);

  return (
    <View style={styles.root}>
      <StatusBar hidden />

      <MapboxGL.MapView
        style={StyleSheet.absoluteFill}
        styleURL={MapboxGL.StyleURL.Outdoors}
        logoEnabled={false}
        attributionEnabled={false}
      >
        <MapboxGL.Camera
          zoomLevel={15}
          pitch={45}
          followUserLocation={true}
          followZoomLevel={15}
          animationMode="flyTo"
          animationDuration={1000}
        />
        <MapboxGL.UserLocation visible={true} showsUserHeadingIndicator={true} />
      </MapboxGL.MapView>

      {/* Top Bar */}
      <View style={[styles.topBar, { paddingLeft: padLeft, paddingRight: padRight }]}>
        {/* App Header */}
        <TouchableOpacity style={styles.headerLeft} activeOpacity={0.8}>
          <View style={styles.headerIcon}>
            <Text style={styles.headerIconText}>H</Text>
          </View>
          <Text style={styles.headerTitle}>APEX TRACE</Text>
          <Text style={styles.headerChevron}> ▾</Text>
        </TouchableOpacity>

        {/* Party Chip */}
        <TouchableOpacity
          style={styles.partyChip}
          onPress={() => setMuted(m => !m)}
          activeOpacity={0.85}
        >
          <Animated.View style={{ opacity: muted ? 1 : fadeAnim }}>
            <MicIcon muted={muted} size={14} />
          </Animated.View>
          <Text style={[styles.partyText, muted && { color: '#ff4444' }]}>
            {muted ? 'MUTED' : 'PARTY (4)'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bottom HUD */}
      <View style={[
        styles.bottomHUD,
        {
          paddingLeft: padLeft,
          paddingRight: padRight,
          paddingBottom: padBottom + 8,
        },
      ]}>
        {isLandscape ? (
          <View style={styles.hudRow}>
            <SpeedometerWidget />
            <StatsBlock isLandscape={true} />
            <View style={{ flex: 1 }} />
            <MusicSection isLandscape={true} />
          </View>
        ) : (
          <View style={styles.hudRow}>
            <SpeedometerWidget />
            <StatsBlock isLandscape={false} />
            <MusicSection isLandscape={false} />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },

  topBar: {
    position: 'absolute',
    top: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  headerIcon: {
    width: 26, height: 26,
    borderWidth: 2, borderColor: '#111',
    borderRadius: 6,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 8,
  },
  headerIconText: { fontWeight: '900', fontSize: 13, color: '#111' },
  headerTitle: { fontWeight: '800', fontSize: 14, color: '#111', letterSpacing: 0.5 },
  headerChevron: { fontSize: 11, color: '#111' },

  partyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
    gap: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  partyText: { color: '#fff', fontWeight: '700', fontSize: 12, letterSpacing: 0.3 },

  bottomHUD: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },

  hudRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },

  speedometerCard: {
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderRadius: 16,
    width: 82, height: 82,
    alignItems: 'center', justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  speedometerRing: {
    width: 64, height: 64,
    borderRadius: 32,
    borderWidth: 2.5, borderColor: '#111',
    alignItems: 'center', justifyContent: 'center',
  },
  speedNumber: { fontSize: 20, fontWeight: '900', color: '#111', lineHeight: 24 },
  speedUnit: { fontSize: 8, fontWeight: '700', color: '#555', letterSpacing: 0.5 },

  statsBlock: {
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    justifyContent: 'center',
    height: 82,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  statsLabel: { fontSize: 9, fontWeight: '600', color: '#888', letterSpacing: 1, textTransform: 'uppercase' },
  statsValue: { fontSize: 22, fontWeight: '900', color: '#111', marginTop: 2 },
  statsDots: { flexDirection: 'row', gap: 4, marginTop: 6 },
  statsDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#ddd' },
  statsDotActive: { backgroundColor: '#111', width: 12 },

  mediaRow: {
    flexDirection: 'row',
    gap: 4,
  },
  mediaBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderRadius: 8,
    height: 28,
    alignItems: 'center', justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },

  musicPill: {
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    height: 82,
    justifyContent: 'center',
    gap: 4,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  musicDot: { width: 6, height: 6, borderRadius: 3, marginBottom: 2 },
  musicPillTitle: { fontSize: 11, fontWeight: '700', color: '#111' },
  musicPillArtist: { fontSize: 10, color: '#777' },
});

export default MapScreen;