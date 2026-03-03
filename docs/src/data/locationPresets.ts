export interface LocationPreset {
  id: string;
  name: string;
  shortName: string;
  lat: number;
  lon: number;
  timezone: string;
  category: "observatory" | "vlba" | "macro" | "custom";
}

export const LOCATION_PRESETS: LocationPreset[] = [
  // Primary observatories
  { id: "vla", name: "VLA (Socorro, NM)", shortName: "VLA", lat: 34.08, lon: -107.6177, timezone: "America/Denver", category: "observatory" },
  { id: "pietown", name: "Pie Town, NM (VLBA)", shortName: "Pie Town", lat: 34.3010, lon: -108.1192, timezone: "America/Denver", category: "observatory" },
  { id: "rlmt", name: "RLMT (Arizona)", shortName: "RLMT", lat: 31.6657, lon: -110.6018, timezone: "America/Phoenix", category: "observatory" },
  // VLBA stations
  { id: "hancock", name: "Hancock, NH (VLBA)", shortName: "Hancock", lat: 42.9336, lon: -71.9868, timezone: "America/New_York", category: "vlba" },
  { id: "brewster", name: "Brewster, WA (VLBA)", shortName: "Brewster", lat: 48.1312, lon: -119.6830, timezone: "America/Los_Angeles", category: "vlba" },
  { id: "maunakea", name: "Mauna Kea, HI (VLBA)", shortName: "Mauna Kea", lat: 19.8014, lon: -155.4556, timezone: "Pacific/Honolulu", category: "vlba" },
  { id: "owensvalley", name: "Owens Valley, CA (VLBA)", shortName: "Owens Valley", lat: 37.2314, lon: -118.2772, timezone: "America/Los_Angeles", category: "vlba" },
  { id: "losalamos", name: "Los Alamos, NM (VLBA)", shortName: "Los Alamos", lat: 35.7752, lon: -106.2455, timezone: "America/Denver", category: "vlba" },
  { id: "fortdavis", name: "Fort Davis, TX (VLBA)", shortName: "Fort Davis", lat: 30.6353, lon: -103.9448, timezone: "America/Chicago", category: "vlba" },
  { id: "northliberty", name: "North Liberty, IA (VLBA)", shortName: "North Liberty", lat: 41.7714, lon: -91.5744, timezone: "America/Chicago", category: "vlba" },
  { id: "stcroix", name: "St. Croix, VI (VLBA)", shortName: "St. Croix", lat: 17.7564, lon: -64.5833, timezone: "America/Virgin", category: "vlba" },
  // MACRO Consortium
  { id: "knox", name: "Knox College (Galesburg, IL)", shortName: "Knox", lat: 40.9417, lon: -90.3721, timezone: "America/Chicago", category: "macro" },
  { id: "coe", name: "Coe College (Cedar Rapids, IA)", shortName: "Coe", lat: 41.9779, lon: -91.6656, timezone: "America/Chicago", category: "macro" },
  { id: "augustana", name: "Augustana College (Rock Island, IL)", shortName: "Augustana", lat: 41.5001, lon: -90.5515, timezone: "America/Chicago", category: "macro" },
  { id: "macalester", name: "Macalester College (St. Paul, MN)", shortName: "Macalester", lat: 44.9379, lon: -93.1691, timezone: "America/Chicago", category: "macro" },
  { id: "uiowa", name: "University of Iowa (Iowa City, IA)", shortName: "U Iowa", lat: 41.6611, lon: -91.5302, timezone: "America/Chicago", category: "macro" },
  // Custom location (placeholder for user-defined coordinates)
  { id: "custom", name: "Custom Location", shortName: "Custom", lat: 0, lon: 0, timezone: "UTC", category: "custom" },
];

export const DEFAULT_TIMEBAR_LST_LOCATIONS = ["vla", "rlmt", "knox"];

export function getLocationById(id: string): LocationPreset | undefined {
  return LOCATION_PRESETS.find((loc) => loc.id === id);
}

export function getLocationCoords(id: string): string {
  const loc = getLocationById(id);
  return loc ? `${loc.lat},${loc.lon}` : "34.08,-107.6177";
}
