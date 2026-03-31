# 🏍️ Apex Trace — Haiku 4.5 Optimized Prompts
> Prompts written for Claude Haiku 4.5 in Cursor / Copilot
> Rule: Be explicit, atomic, and always give context. Haiku is fast but needs clear boundaries.

---

## HOW TO PROMPT HAIKU 4.5 EFFECTIVELY
- ✅ One feature per prompt — don't combine
- ✅ Always paste your current file as context
- ✅ Say "TypeScript only, no JS" explicitly
- ✅ Say "Expo managed workflow, not bare"
- ✅ End with "show complete file, no placeholders"
- ❌ Don't say "make it good" — be specific about what good means
- ❌ Don't ask for architecture + code in one prompt

---

## PHASE 0 — BOOTSTRAP

### Prompt 1 — Project Structure
```
You are building an Expo (managed workflow) React Native app called Apex Trace in TypeScript.
Create the full folder structure under /src with these folders:
screens/, components/, hooks/, store/, services/, types/, navigation/

Then create empty index files in each folder.
Rules:
- TypeScript only
- Expo managed workflow (no bare/eject)
- No placeholder comments, real empty exports
Show every file path and its content.
```

### Prompt 2 — Zustand Store Setup
```
Create a Zustand store for Apex Trace in /src/store/rideStore.ts with TypeScript.
State shape:
- isTracking: boolean
- coordinates: Array<{ lat: number; lng: number; timestamp: number }>
- currentSpeed: number
- avgSpeed: number
- topSpeed: number
- distance: number (km)
- elapsedSeconds: number
- elevation: number
- elevationGain: number

Actions: startRide, stopRide, updateLocation(coord), resetRide
Use zustand/vanilla pattern with TypeScript generics.
Show complete file, no placeholders.
```

---

## PHASE 1 — MAP + GPS

### Prompt 3 — Mapbox Map Screen
```
Create /src/screens/MapScreen.tsx for Expo React Native in TypeScript.
Use @rnmapbox/maps package.
Requirements:
- MapboxGL.MapView fills the screen
- Camera: pitch=45, zoomLevel=14, followUserLocation=true
- UserLocation component with visible=true
- StyleURL: MapboxGL.StyleURL.Outdoors
- Wrap in SafeAreaView with black background
- Export as default

Do not add any other features yet — just the map rendering.
Show complete file, no placeholders.
```

### Prompt 4 — GPS Tracking Hook
```
Create /src/hooks/useGPSTracking.ts for Expo React Native in TypeScript.
Use expo-location package only.

The hook must:
1. Request foreground location permission on mount
2. Expose start() — begins watchPositionAsync with accuracy: BestForNavigation, timeInterval: 2000
3. Expose stop() — removes the location watcher
4. On each location update, call updateLocation() from /src/store/rideStore.ts
5. Expose isTracking: boolean

Return type: { start: () => void, stop: () => void, isTracking: boolean }
Handle permission denied with console.warn only for now.
Show complete file, no placeholders.
```

### Prompt 5 — Haversine Distance Utility
```
Create /src/services/geoUtils.ts in TypeScript.
Implement these pure functions:

1. haversineDistance(coord1: {lat,lng}, coord2: {lat,lng}): number
   Returns distance in kilometers.

2. calculateSpeed(coord1, coord2, timeDeltaSeconds: number): number
   Returns speed in KM/H.

3. calculateElevationDelta(elevations: number[]): number
   Returns total gain (only count positive deltas).

No external libraries. Pure math only.
Show complete file with JSDoc comments on each function.
```

### Prompt 6 — Ride Stats HUD Component
```
Create /src/components/RideStatsHUD.tsx for Expo React Native in TypeScript.
Read all values from /src/store/rideStore.ts using useRideStore hook.

Layout — horizontal row of 6 stat cards at bottom of screen:
  DISTANCE (km) | RIDE TIME (mm:ss) | AVG SPEED (km/h) | TOP SPEED (km/h) | ELEVATION (m) | ELEV. GAIN (m)

Styling:
- Each card: white background, rounded corners, padding 12
- Label: fontSize 10, fontWeight 600, color #666, uppercase
- Value: fontSize 22, fontWeight 800, color #111
- Row: flexDirection row, separated by 1px dividers
- Container: position absolute, bottom 0, left 0, right 0

No animations yet. Static display only.
Show complete file, no placeholders.
```

---

## PHASE 2 — UI LAYOUT

### Prompt 7 — Speedometer Widget
```
Create /src/components/SpeedometerWidget.tsx for Expo React Native in TypeScript.
Read currentSpeed from /src/store/rideStore.ts.

Visual:
- Circular border arc (use SVG via react-native-svg)
- Large center number: current speed
- Small label below: "KM/H"
- Size: 120x120
- Background: white, rounded square card with shadow
- Arc color: #111 on white background

Position: absolute, top 16, left 16
Show complete file, no placeholders.
```

### Prompt 8 — Orientation-Responsive Layout
```
Create /src/components/MapLayout.tsx for Expo React Native in TypeScript.
Use useWindowDimensions hook to detect orientation.

Landscape (width > height):
- SpeedometerWidget: top-left
- RideStatsHUD: bottom full-width bar
- MusicPlayerWidget: bottom-left (placeholder View for now)

Portrait (height > width):
- SpeedometerWidget inside bottom pill alongside distance
- RideStatsHUD hidden
- MusicPlayerWidget: bottom-right compact

Use Animated.View for opacity transition between layouts (duration 200ms).
Import SpeedometerWidget and RideStatsHUD.
Show complete file, no placeholders.
```

---

## PHASE 3 — AUTH + FRIENDS

### Prompt 9 — Firebase Setup + Auth Hook
```
Create /src/services/firebase.ts to initialize Firebase for Expo React Native.
Use firebase/app, firebase/auth, firebase/firestore packages.
Export: app, auth, db (Firestore instance).
Read config from environment variables:
  EXPO_PUBLIC_FIREBASE_API_KEY, EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  EXPO_PUBLIC_FIREBASE_PROJECT_ID, EXPO_PUBLIC_FIREBASE_APP_ID

Then create /src/hooks/useAuth.ts with:
- signInWithEmail(email, password): Promise<void>
- signUpWithEmail(email, password, displayName): Promise<void>
- signOut(): Promise<void>
- user: FirebaseUser | null
- loading: boolean

Use onAuthStateChanged for persistence.
Show both complete files, no placeholders.
```

### Prompt 10 — Real-time Friend Location Sync
```
Create /src/services/locationSync.ts for Expo React Native TypeScript.
Uses Firestore from /src/services/firebase.ts.

Functions:
1. publishLocation(uid: string, coord: {lat, lng, speed, isTracking}): Promise<void>
   Writes to Firestore path: locations/{uid}

2. subscribeFriendLocations(friendUIDs: string[], callback: (locations: FriendLocation[]) => void): () => void
   Listens to each friend's locations/{uid} doc with onSnapshot
   Returns unsubscribe function

Type FriendLocation = { uid: string, lat: number, lng: number, speed: number, isTracking: boolean, updatedAt: number }

Call publishLocation every 5 seconds when isTracking is true.
Show complete file, no placeholders.
```

### Prompt 11 — Friend Markers on Map
```
Modify /src/screens/MapScreen.tsx (paste current file here).
Add friend markers using @rnmapbox/maps.

Given friendLocations: FriendLocation[] from locationSync subscriber:
- Render each friend as a MapboxGL.MarkerView at their lat/lng
- Marker UI: circular View, 40x40, dark background, centered initials text (first 2 chars of uid for now)
- Tap marker: show a callout with uid and speed

Import FriendLocation type from /src/services/locationSync.ts
Show complete modified MapScreen.tsx, no placeholders.
```

---

## PHASE 4 — VOICE CHAT

### Prompt 12 — Agora Voice Service
```
Create /src/services/voiceChat.ts for Expo React Native TypeScript.
Use agora-react-native-rtc package.

Functions:
1. joinLobby(channelName: string, uid: number): Promise<void>
   - Initialize RtcEngine with EXPO_PUBLIC_AGORA_APP_ID
   - Set audio profile, enable audio
   - Join channel

2. leaveLobby(): Promise<void>

3. setMuted(muted: boolean): void

Events to expose via callback prop:
  onUserJoined(uid), onUserLeft(uid), onUserMuted(uid, muted)

Export as a singleton service.
Show complete file, no placeholders.
```

### Prompt 13 — Party Chip Component
```
Create /src/components/PartyChip.tsx for Expo React Native TypeScript.

Props: { memberCount: number, isMuted: boolean, onPress: () => void }

Visual:
- Dark pill (borderRadius 999, backgroundColor #111)
- Left: mic icon (use a Text emoji 🎙 for now) with red slash overlay if isMuted
- Right: "PARTY (N)" white text, fontWeight 700, fontSize 13
- Position: absolute, top 16, centered horizontally (alignSelf center)
- Subtle pulse animation using Animated.loop when memberCount > 1

Show complete file, no placeholders.
```

---

## PHASE 5 — WAYPOINTS + ROUTING

### Prompt 14 — Waypoint Store
```
Add waypoints state to /src/store/rideStore.ts (paste current file here).

Add to state:
  waypoints: Array<{ id: string, lat: number, lng: number, label: string }>

Add actions:
  addWaypoint(lat, lng): void — generates uuid id, default label "WP N"
  removeWaypoint(id): void
  updateWaypointLabel(id, label): void
  reorderWaypoints(fromIndex, to Index): void

Use crypto.randomUUID() for ids.
Show complete modified rideStore.ts, no placeholders.
```

### Prompt 15 — Mapbox Route Polyline
```
Create /src/services/routingService.ts for Expo React Native TypeScript.

Function: fetchRoute(waypoints: Array<{lat,lng}>): Promise<GeoJSON.LineString | null>
- Build Mapbox Directions API URL with coordinates
- Mode: driving (motorcycles use driving profile)
- Use EXPO_PUBLIC_MAPBOX_TOKEN env var
- Parse response, return geometry as GeoJSON LineString
- Return null on error

Then in MapScreen.tsx (paste current file):
- When waypoints.length >= 2, call fetchRoute and draw result as MapboxGL.ShapeSource + MapboxGL.LineLayer
- Line style: color #3B82F6, width 4, lineCap round
- Re-fetch when waypoints array changes

Show both files complete, no placeholders.
```

---

## PHASE 6 — RIDE HISTORY

### Prompt 16 — Save Ride to Firestore
```
Create /src/services/rideHistory.ts for Expo React Native TypeScript.
Uses Firestore from /src/services/firebase.ts.

Type RideRecord = {
  id: string
  uid: string
  date: number (timestamp)
  duration: number (seconds)
  distance: number (km)
  avgSpeed: number
  topSpeed: number
  elevationGain: number
  polyline: Array<{lat,lng}>
}

Functions:
1. saveRide(uid: string, rideData: Omit<RideRecord,'id'|'uid'>): Promise<string>
   Saves to Firestore: rides/{uid}/history/{autoId}, returns doc id

2. fetchRides(uid: string): Promise<RideRecord[]>
   Fetches all rides ordered by date desc, limit 50

3. deleteRide(uid: string, rideId: string): Promise<void>

Show complete file, no placeholders.
```

### Prompt 17 — Ride History Screen
```
Create /src/screens/RideHistoryScreen.tsx for Expo React Native TypeScript.
Uses /src/services/rideHistory.ts and useAuth hook.

UI:
- FlatList of ride cards
- Each card shows: date (formatted), distance km, duration mm:ss, top speed
- Card style: white bg, rounded 12, shadow, margin 8
- Tap card → navigate to RideDetailScreen passing rideId
- Pull to refresh
- Empty state: centered text "No rides yet. Start riding!"
- Loading state: ActivityIndicator

Show complete file, no placeholders.
```

---

## PHASE 7 — NAVIGATION

### Prompt 18 — Full Navigation Setup
```
Create /src/navigation/AppNavigator.tsx for Expo React Native TypeScript.
Use @react-navigation/native and @react-navigation/bottom-tabs.

Structure:
- RootStack (Stack.Navigator):
  - If user null → AuthStack (Login, Register screens as stubs)
  - If user exists → MainTabs

- MainTabs (Bottom Tab Navigator), tabs:
  - Map (MapScreen) — motorcycle icon
  - History (RideHistoryScreen) — clock icon
  - Squad (SquadScreen stub) — people icon
  - Settings (SettingsScreen stub) — gear icon

Tab bar style: dark background #111, active tint white, inactive tint #555
Use useAuth() to determine which stack to show.
Show complete file, no placeholders.
```

### Prompt 19 — Hamburger Dropdown Menu
```
Create /src/components/AppHeaderMenu.tsx for Expo React Native TypeScript.
Use react-native Animated only (no external libs).

Behavior:
- Shows "APEX TRACE ▾" text button top-left of screen
- Tap → animated dropdown slides down (translateY from -100 to 0, opacity 0 to 1, duration 200ms)
- Menu items: Ride History, Squad, Map Settings — each with icon emoji + label
- Tap outside → closes dropdown
- Tap item → calls onSelect(itemKey) prop and closes

Props: { onSelect: (key: 'history'|'squad'|'settings') => void }
Style: white card, borderRadius 12, shadow, position absolute top 60 left 16
Show complete file, no placeholders.
```

---

## PHASE 8 — BUILD

### Prompt 20 — EAS Build Config
```
Generate the following files for Expo EAS Build for an Android app called Apex Trace:

1. eas.json with profiles:
   - development: developmentClient true, android buildType apk
   - preview: android buildType apk, internal distribution
   - production: android buildType app-bundle

2. Updated app.json with:
   - android.package: com.apextrace.app
   - android.permissions: ACCESS_FINE_LOCATION, ACCESS_BACKGROUND_LOCATION, RECORD_AUDIO, INTERNET, FOREGROUND_SERVICE
   - plugins: @rnmapbox/maps with download token env var
   - extra: eas.projectId placeholder

3. .env.example with all required keys:
   EXPO_PUBLIC_MAPBOX_TOKEN, EXPO_PUBLIC_FIREBASE_API_KEY,
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN, EXPO_PUBLIC_FIREBASE_PROJECT_ID,
   EXPO_PUBLIC_FIREBASE_APP_ID, EXPO_PUBLIC_AGORA_APP_ID

Show all 3 files complete.
```

---

## 🧠 HAIKU 4.5 DEBUG PROMPTS (use when stuck)

### When you get a TypeScript error:
```
I am using Expo managed workflow React Native with TypeScript.
I have this error: [PASTE ERROR]
In this file: [PASTE FILE]
Fix only the error. Do not rewrite unrelated code. Show the corrected lines only.
```

### When a package is missing:
```
I am using Expo managed workflow. I need to use [PACKAGE NAME].
Is this compatible with Expo managed workflow?
If yes, show the exact install command using npx expo install.
If no, show the best Expo-compatible alternative.
```

### When UI looks wrong:
```
This React Native component is not rendering correctly on Android.
Issue: [DESCRIBE ISSUE]
Current code: [PASTE COMPONENT]
Fix only the styling. Use only React Native core StyleSheet properties. No external UI libraries.
Show corrected StyleSheet only.
```

---

*Optimized for Claude Haiku 4.5 | Apex Trace | March 2026*
