import { create } from 'zustand';

export interface Coordinate {
  lat: number;
  lng: number;
  timestamp: number;
}

export interface RideState {
  isTracking: boolean;
  coordinates: Coordinate[];
  currentSpeed: number;
  avgSpeed: number;
  topSpeed: number;
  distance: number;
  elapsedSeconds: number;
  elevation: number;
  elevationGain: number;
}

export interface RideActions {
  startRide: () => void;
  stopRide: () => void;
  updateLocation: (coord: Coordinate) => void;
  resetRide: () => void;
}

export type RideStore = RideState & RideActions;

const initialState: RideState = {
  isTracking: false,
  coordinates: [],
  currentSpeed: 0,
  avgSpeed: 0,
  topSpeed: 0,
  distance: 0,
  elapsedSeconds: 0,
  elevation: 0,
  elevationGain: 0,
};

function calculateDistance(prev: Coordinate, curr: Coordinate): number {
  const R = 6371; // Earth's radius in km
  const dLat = (curr.lat - prev.lat) * (Math.PI / 180);
  const dLng = (curr.lng - prev.lng) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(prev.lat * (Math.PI / 180)) *
      Math.cos(curr.lat * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function calculateSpeed(prev: Coordinate, curr: Coordinate): number {
  const distance = calculateDistance(prev, curr);
  const timeDiff = (curr.timestamp - prev.timestamp) / 1000; // seconds
  if (timeDiff === 0) return 0;
  return (distance / timeDiff) * 3600; // km/h
}

export const useRideStore = create<RideStore>((set, get) => ({
  ...initialState,

  startRide: () => set({ isTracking: true }),

  stopRide: () => set({ isTracking: false }),

  updateLocation: (coord: Coordinate) => {
    const state = get();

    if (!state.isTracking) return;

    const newCoordinates = [...state.coordinates, coord];
    let newDistance = state.distance;
    let newCurrentSpeed = 0;
    let newTopSpeed = state.topSpeed;
    let newAvgSpeed = state.avgSpeed;

    if (newCoordinates.length > 1) {
      const prevCoord = newCoordinates[newCoordinates.length - 2];
      const segmentDistance = calculateDistance(prevCoord, coord);
      newDistance = state.distance + segmentDistance;
      newCurrentSpeed = calculateSpeed(prevCoord, coord);
      newTopSpeed = Math.max(state.topSpeed, newCurrentSpeed);

      if (newCoordinates.length > 0) {
        const totalTime =
          (coord.timestamp - newCoordinates[0].timestamp) / 1000 / 3600; // hours
        newAvgSpeed = totalTime > 0 ? newDistance / totalTime : 0;
      }
    }

    set({
      coordinates: newCoordinates,
      currentSpeed: newCurrentSpeed,
      avgSpeed: newAvgSpeed,
      topSpeed: newTopSpeed,
      distance: newDistance,
    });
  },

  resetRide: () => set(initialState),
}));