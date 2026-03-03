import { useState } from "react";
import * as Astronomy from "astronomy-engine";
import { useTheme } from "../context/ThemeContext";
import { useDashboard } from "../context/DashboardContext";
import { LOCATION_PRESETS } from "../data/locationPresets";

type Result = {
  utc: string;
  central: string;
  az: string;
  pacific: string;
  local: string;
};

export default function LSTtoUTCConverter() {
  const { isDark } = useTheme();
  const { telescope } = useDashboard();
  const now = new Date();

  // Default to Pie Town for VLBA, VLA for VLA
  const defaultLocation = telescope === "VLBA" ? "pietown" : "vla";
  const [selectedLocation, setSelectedLocation] = useState(defaultLocation);
  const [customLat, setCustomLat] = useState("34.08");
  const [customLon, setCustomLon] = useState("-107.62");

  const getCoords = (): { lat: number; lon: number } => {
    if (selectedLocation === "custom") {
      return { lat: parseFloat(customLat) || 0, lon: parseFloat(customLon) || 0 };
    }
    const preset = LOCATION_PRESETS.find((p) => p.id === selectedLocation);
    return preset ? { lat: preset.lat, lon: preset.lon } : { lat: 34.08, lon: -107.6177 };
  };

  const coords = getCoords();
  const observer = new Astronomy.Observer(coords.lat, coords.lon, 0);

  const utcDateTime = Astronomy.MakeTime(now);
  const startLST = getLSTfromUTC(utcDateTime, observer);

  const [lst, setLST] = useState<string>(startLST || "00:00:00");
  const [date, setDate] = useState<string>(now.toISOString().split("T")[0]);
  const [result, setResult] = useState<Result>({
    utc: "–",
    central: "–",
    az: "–",
    pacific: "–",
    local: "–",
  });

  function lstToDecimalHours(lst: string): number {
    const [h, m, s] = lst.split(":").map(Number);
    return h + m / 60 + s / 3600;
  }

  function normalizeHours(hours: number): number {
    return (hours + 24) % 24;
  }

  function formatInTimeZone(date: Date, timeZone: string): string {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZoneName: "short",
    })
      .format(date)
      .replace(",", "");
  }

  function getLSTfromUTC(astrotime: Astronomy.AstroTime, obs: Astronomy.Observer): string {
    const sidereal = Astronomy.SiderealTime(astrotime);
    const siderealLST = normalizeHours(sidereal + obs.longitude / 15);

    const hours = Math.floor(siderealLST);
    const minutes = Math.floor((siderealLST - hours) * 60);
    const seconds = Math.floor(((siderealLST - hours) * 60 - minutes) * 60);
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  function convertLST() {
    const { lat, lon } = getCoords();
    const obs = new Astronomy.Observer(lat, lon, 0);
    const targetLST = lstToDecimalHours(lst);
    const midnightUTC = new Date(`${date}T00:00:00Z`);
    const time = Astronomy.MakeTime(midnightUTC);

    let bestDiff = 24;
    let bestTime: Astronomy.AstroTime | null = null;

    for (let minutes = 0; minutes < 1440; minutes++) {
      const testTime = time.AddDays(minutes / 1440);
      const sidereal = Astronomy.SiderealTime(testTime);
      const siderealLST = normalizeHours(sidereal + obs.longitude / 15);
      let diff = Math.abs(normalizeHours(siderealLST - targetLST));
      if (diff > 12) diff = 24 - diff;

      if (diff < bestDiff) {
        bestDiff = diff;
        bestTime = testTime;
      }
    }

    if (bestTime) {
      const utcDate = bestTime.date;

      setResult({
        utc: utcDate.toISOString().replace("T", " ").substring(0, 16) + " UTC",
        central: formatInTimeZone(utcDate, "America/Chicago"),
        az: formatInTimeZone(utcDate, "America/Phoenix"),
        pacific: formatInTimeZone(utcDate, "America/Los_Angeles"),
        local: formatInTimeZone(utcDate, "America/Denver"),
      });
    }
  }

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

      <label className={`block mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
        LST (HH:MM:SS):
      </label>
      <input
        type="text"
        value={lst}
        onChange={(e) => setLST(e.target.value)}
        className={inputClass}
      />
      <label className={`block mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
        Date (YYYY-MM-DD):
      </label>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className={inputClass}
      />
      <button
        onClick={convertLST}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Convert to UTC
      </button>
      <div className={`mt-4 ${isDark ? "text-gray-200" : "text-gray-800"}`}>
        <p>
          <strong>UTC:</strong> {result.utc}
        </p>
        <p>
          <strong>Mountain:</strong> {result.local}
        </p>
        <p>
          <strong>Central:</strong> {result.central}
        </p>
        <p>
          <strong>Arizona:</strong> {result.az}
        </p>
        <p>
          <strong>Pacific:</strong> {result.pacific}
        </p>
      </div>
    </div>
  );
}
