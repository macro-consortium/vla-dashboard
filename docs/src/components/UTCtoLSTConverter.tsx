import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useDashboard } from "../context/DashboardContext";
import { LOCATION_PRESETS } from "../data/locationPresets";

export default function UTCtoLSTConverter() {
  const { isDark } = useTheme();
  const { telescope } = useDashboard();
  const datenow = new Date();

  // Default to Pie Town for VLBA, VLA for VLA
  const defaultLocation = telescope === "VLBA" ? "pietown" : "vla";
  const [selectedLocation, setSelectedLocation] = useState(defaultLocation);
  const [customLat, setCustomLat] = useState("34.08");
  const [customLon, setCustomLon] = useState("-107.62");

  const [lst, setLST] = useState("Awaiting submission...");
  const [date, setDate] = useState(
    `${datenow.getUTCFullYear()}-${String(datenow.getUTCMonth() + 1).padStart(2, "0")}-${String(datenow.getUTCDate()).padStart(2, "0")}`
  );
  const [time, setTime] = useState(
    `${String(datenow.getUTCHours()).padStart(2, "0")}:${String(datenow.getUTCMinutes()).padStart(2, "0")}:${String(datenow.getUTCSeconds()).padStart(2, "0")}`
  );

  const getCoords = (): { lat: number; lon: number } => {
    if (selectedLocation === "custom") {
      return { lat: parseFloat(customLat) || 0, lon: parseFloat(customLon) || 0 };
    }
    const preset = LOCATION_PRESETS.find((p) => p.id === selectedLocation);
    return preset ? { lat: preset.lat, lon: preset.lon } : { lat: 34.08, lon: -107.6177 };
  };

  const fetchLST = async () => {
    const { lat, lon } = getCoords();
    const url = `https://aa.usno.navy.mil/api/siderealtime?date=${date}&coords=${lat},${lon}&reps=1&intv_mag=5&intv_unit=minutes&time=${time}`;
    try {
      const response = await fetch(url, {
        headers: { Accept: "application/json" },
      });
      const data = await response.json();
      const last = data.properties.data[0].last;
      const locationName = selectedLocation === "custom"
        ? `${lat.toFixed(4)}, ${lon.toFixed(4)}`
        : LOCATION_PRESETS.find((p) => p.id === selectedLocation)?.name || "Unknown";
      setLST(`LST at ${locationName}: ${last.substring(0, 8)}`);
    } catch (error) {
      setLST("Error fetching data:\n" + error);
    }
  };

  const inputClass = `border rounded px-2 py-1 mb-3 w-full ${
    isDark
      ? "bg-gray-700 border-gray-600 text-gray-100"
      : "bg-white border-gray-300 text-gray-900"
  }`;

  const selectClass = `border rounded px-2 py-1 mb-3 w-full ${
    isDark
      ? "bg-gray-700 border-gray-600 text-gray-100"
      : "bg-white border-gray-300 text-gray-900"
  }`;

  return (
    <div>
      <p className={`mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
        Enter the UTC date and time to calculate the Local Sidereal Time (LST).
      </p>

      <label className={`block mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}>Location:</label>
      <select
        value={selectedLocation}
        onChange={(e) => setSelectedLocation(e.target.value)}
        className={selectClass}
      >
        {LOCATION_PRESETS.map((preset) => (
          <option key={preset.id} value={preset.id}>
            {preset.name}
          </option>
        ))}
      </select>

      {selectedLocation === "custom" && (
        <div className="flex gap-2 mb-3">
          <div className="flex-1">
            <label className={`block mb-1 text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              Latitude:
            </label>
            <input
              type="text"
              value={customLat}
              onChange={(e) => setCustomLat(e.target.value)}
              placeholder="34.08"
              className={inputClass}
            />
          </div>
          <div className="flex-1">
            <label className={`block mb-1 text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              Longitude:
            </label>
            <input
              type="text"
              value={customLon}
              onChange={(e) => setCustomLon(e.target.value)}
              placeholder="-107.62"
              className={inputClass}
            />
          </div>
        </div>
      )}
      <label className={`block mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}>Date:</label>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className={inputClass}
      />
      <label className={`block mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
        Time (HH:MM:SS):
      </label>
      <input
        type="text"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        placeholder="HH:MM:SS"
        className={inputClass}
      />
      <button
        onClick={fetchLST}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Calculate LST
      </button>
      <h3 className={`mt-4 font-semibold ${isDark ? "text-gray-200" : "text-gray-800"}`}>
        Calculated LST Data
      </h3>
      <pre className={isDark ? "text-gray-300" : "text-gray-700"}>{lst}</pre>
    </div>
  );
}
