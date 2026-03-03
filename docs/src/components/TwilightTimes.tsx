import { useState, useMemo } from "react";
import * as Astronomy from "astronomy-engine";
import { useTheme } from "../context/ThemeContext";
import { useDashboard } from "../context/DashboardContext";
import { LOCATION_PRESETS, getLocationById } from "../data/locationPresets";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import WbTwilightIcon from "@mui/icons-material/WbTwilight";
import NightsStayIcon from "@mui/icons-material/NightsStay";

interface TwilightEvent {
  label: string;
  utc: Date | null;
  lst: string | null;
  type: "sunrise" | "sunset" | "civil" | "nautical" | "astronomical";
  isRise: boolean;
}

function formatTime(date: Date | null, timezone: string, hour12 = true): string {
  if (!date) return "--:--";
  return date.toLocaleTimeString("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12,
  });
}

function formatUTC(date: Date | null): string {
  if (!date) return "--:--";
  return date.toLocaleTimeString("en-US", {
    timeZone: "UTC",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function normalizeHours(hours: number): number {
  return (hours + 24) % 24;
}

function getLSTfromUTC(date: Date, longitude: number): string {
  const astroTime = Astronomy.MakeTime(date);
  const sidereal = Astronomy.SiderealTime(astroTime);
  const siderealLST = normalizeHours(sidereal + longitude / 15);

  const hours = Math.floor(siderealLST);
  const minutes = Math.floor((siderealLST - hours) * 60);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function findTwilight(
  observer: Astronomy.Observer,
  date: Date,
  altitude: number,
  direction: number
): Date | null {
  try {
    const astroTime = Astronomy.MakeTime(date);
    const result = Astronomy.SearchAltitude(
      Astronomy.Body.Sun,
      observer,
      direction,
      astroTime,
      1,
      altitude
    );
    return result ? result.date : null;
  } catch {
    return null;
  }
}

export default function TwilightTimes() {
  const { isDark } = useTheme();
  const { telescope } = useDashboard();

  const defaultLocation = telescope === "VLBA" ? "pietown" : "vla";
  const [selectedLocation, setSelectedLocation] = useState(defaultLocation);
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return now.toISOString().split("T")[0];
  });

  const location = getLocationById(selectedLocation);
  const observer = useMemo(() => {
    if (!location) return new Astronomy.Observer(34.08, -107.6177, 0);
    return new Astronomy.Observer(location.lat, location.lon, 0);
  }, [location]);

  const twilightEvents = useMemo(() => {
    const date = new Date(`${selectedDate}T12:00:00Z`);
    const events: TwilightEvent[] = [];
    const lon = location?.lon ?? -107.6177;

    // Sunrise/Sunset (center of sun at horizon, accounting for refraction)
    const sunrise = findTwilight(observer, date, -0.833, 1);
    const sunset = findTwilight(observer, date, -0.833, -1);

    // Civil twilight (-6°)
    const civilDawn = findTwilight(observer, date, -6, 1);
    const civilDusk = findTwilight(observer, date, -6, -1);

    // Nautical twilight (-12°)
    const nauticalDawn = findTwilight(observer, date, -12, 1);
    const nauticalDusk = findTwilight(observer, date, -12, -1);

    // Astronomical twilight (-18°)
    const astroDawn = findTwilight(observer, date, -18, 1);
    const astroDusk = findTwilight(observer, date, -18, -1);

    // Morning events (reverse order for display)
    events.push({
      label: "Astro. Dawn",
      utc: astroDawn,
      lst: astroDawn ? getLSTfromUTC(astroDawn, lon) : null,
      type: "astronomical",
      isRise: true,
    });
    events.push({
      label: "Naut. Dawn",
      utc: nauticalDawn,
      lst: nauticalDawn ? getLSTfromUTC(nauticalDawn, lon) : null,
      type: "nautical",
      isRise: true,
    });
    events.push({
      label: "Civil Dawn",
      utc: civilDawn,
      lst: civilDawn ? getLSTfromUTC(civilDawn, lon) : null,
      type: "civil",
      isRise: true,
    });
    events.push({
      label: "Sunrise",
      utc: sunrise,
      lst: sunrise ? getLSTfromUTC(sunrise, lon) : null,
      type: "sunrise",
      isRise: true,
    });

    // Evening events
    events.push({
      label: "Sunset",
      utc: sunset,
      lst: sunset ? getLSTfromUTC(sunset, lon) : null,
      type: "sunset",
      isRise: false,
    });
    events.push({
      label: "Civil Dusk",
      utc: civilDusk,
      lst: civilDusk ? getLSTfromUTC(civilDusk, lon) : null,
      type: "civil",
      isRise: false,
    });
    events.push({
      label: "Naut. Dusk",
      utc: nauticalDusk,
      lst: nauticalDusk ? getLSTfromUTC(nauticalDusk, lon) : null,
      type: "nautical",
      isRise: false,
    });
    events.push({
      label: "Astro. Dusk",
      utc: astroDusk,
      lst: astroDusk ? getLSTfromUTC(astroDusk, lon) : null,
      type: "astronomical",
      isRise: false,
    });

    return events;
  }, [observer, selectedDate, location]);

  const getEventIcon = (event: TwilightEvent) => {
    if (event.type === "sunrise" || event.type === "sunset") {
      return <WbSunnyIcon style={{ fontSize: 16 }} className="text-yellow-500" />;
    }
    if (event.type === "civil") {
      return <WbTwilightIcon style={{ fontSize: 16 }} className="text-orange-400" />;
    }
    if (event.type === "nautical") {
      return <WbTwilightIcon style={{ fontSize: 16 }} className="text-blue-400" />;
    }
    return <NightsStayIcon style={{ fontSize: 16 }} className={isDark ? "text-indigo-300" : "text-indigo-500"} />;
  };

  const getEventBg = (event: TwilightEvent) => {
    if (event.type === "sunrise" || event.type === "sunset") {
      return isDark ? "bg-yellow-900/20" : "bg-yellow-50";
    }
    if (event.type === "civil") {
      return isDark ? "bg-orange-900/20" : "bg-orange-50";
    }
    if (event.type === "nautical") {
      return isDark ? "bg-blue-900/20" : "bg-blue-50";
    }
    return isDark ? "bg-indigo-900/20" : "bg-indigo-50";
  };

  const inputClass = `border rounded px-2 py-1 w-full ${
    isDark
      ? "bg-gray-700 border-gray-600 text-gray-100"
      : "bg-white border-gray-300 text-gray-900"
  }`;

  const selectClass = `border rounded px-2 py-1 w-full ${
    isDark
      ? "bg-gray-700 border-gray-600 text-gray-100"
      : "bg-white border-gray-300 text-gray-900"
  }`;

  // Filter out custom location for twilight display
  const displayableLocations = LOCATION_PRESETS.filter((p) => p.id !== "custom");

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className={`block mb-1 text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Location
          </label>
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className={selectClass}
          >
            {displayableLocations.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.shortName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={`block mb-1 text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      {/* Morning Events */}
      <div className="mb-4">
        <div className={`text-xs font-medium uppercase tracking-wide mb-2 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
          Morning
        </div>
        <div className="space-y-1">
          {twilightEvents.filter((e) => e.isRise).map((event) => (
            <div
              key={event.label}
              className={`flex items-center justify-between px-3 py-2 rounded ${getEventBg(event)}`}
            >
              <div className="flex items-center gap-2">
                {getEventIcon(event)}
                <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  {event.label}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm font-mono">
                <span className={isDark ? "text-gray-400" : "text-gray-500"}>
                  {formatUTC(event.utc)} <span className="text-xs">UTC</span>
                </span>
                <span className={isDark ? "text-gray-300" : "text-gray-700"}>
                  {formatTime(event.utc, location?.timezone || "America/Denver")}
                </span>
                <span className={isDark ? "text-blue-400" : "text-blue-600"}>
                  {event.lst || "--:--"} <span className="text-xs">LST</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Evening Events */}
      <div>
        <div className={`text-xs font-medium uppercase tracking-wide mb-2 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
          Evening
        </div>
        <div className="space-y-1">
          {twilightEvents.filter((e) => !e.isRise).map((event) => (
            <div
              key={event.label}
              className={`flex items-center justify-between px-3 py-2 rounded ${getEventBg(event)}`}
            >
              <div className="flex items-center gap-2">
                {getEventIcon(event)}
                <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  {event.label}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm font-mono">
                <span className={isDark ? "text-gray-400" : "text-gray-500"}>
                  {formatUTC(event.utc)} <span className="text-xs">UTC</span>
                </span>
                <span className={isDark ? "text-gray-300" : "text-gray-700"}>
                  {formatTime(event.utc, location?.timezone || "America/Denver")}
                </span>
                <span className={isDark ? "text-blue-400" : "text-blue-600"}>
                  {event.lst || "--:--"} <span className="text-xs">LST</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className={`mt-4 text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
        Twilight definitions: Civil (-6°), Nautical (-12°), Astronomical (-18°)
      </p>
    </div>
  );
}
