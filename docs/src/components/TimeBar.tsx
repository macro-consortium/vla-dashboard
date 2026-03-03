import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { useDashboard } from "../context/DashboardContext";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import PushPinIcon from "@mui/icons-material/PushPin";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import NightsStayIcon from "@mui/icons-material/NightsStay";
import WbTwilightIcon from "@mui/icons-material/WbTwilight";
import SettingsIcon from "@mui/icons-material/Settings";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import { LOCATION_PRESETS, getLocationById, getLocationCoords } from "../data/locationPresets";

interface TimeZoneDisplay {
  id: string;
  label: string;
  timezone: string;
}

const ALL_TIME_ZONES: TimeZoneDisplay[] = [
  { id: "utc", label: "UTC", timezone: "UTC" },
  { id: "eastern", label: "Eastern", timezone: "America/New_York" },
  { id: "central", label: "Central", timezone: "America/Chicago" },
  { id: "mountain", label: "Mountain", timezone: "America/Denver" },
  { id: "arizona", label: "Arizona", timezone: "America/Phoenix" },
  { id: "pacific", label: "Pacific", timezone: "America/Los_Angeles" },
  { id: "hawaii", label: "Hawaii", timezone: "Pacific/Honolulu" },
  { id: "alaska", label: "Alaska", timezone: "America/Anchorage" },
  { id: "atlantic", label: "Atlantic", timezone: "America/Halifax" },
  { id: "london", label: "London", timezone: "Europe/London" },
  { id: "paris", label: "Paris", timezone: "Europe/Paris" },
  { id: "tokyo", label: "Tokyo", timezone: "Asia/Tokyo" },
  { id: "sydney", label: "Sydney", timezone: "Australia/Sydney" },
];

type DayPeriod = "day" | "night" | "twilight";

function getDayPeriod(date: Date, timezone: string): DayPeriod {
  const hour = parseInt(
    date.toLocaleTimeString("en-US", {
      timeZone: timezone,
      hour: "numeric",
      hour12: false,
    })
  );
  if (hour >= 7 && hour < 18) return "day";
  if (hour >= 18 && hour < 20) return "twilight";
  if (hour >= 5 && hour < 7) return "twilight";
  return "night";
}

function DayNightIndicator({ period, isDark }: { period: DayPeriod; isDark: boolean }) {
  if (period === "day") {
    return <WbSunnyIcon style={{ fontSize: 16 }} className="text-yellow-500" />;
  }
  if (period === "twilight") {
    return <WbTwilightIcon style={{ fontSize: 16 }} className="text-orange-400" />;
  }
  return <NightsStayIcon style={{ fontSize: 16 }} className={isDark ? "text-blue-300" : "text-indigo-400"} />;
}

interface TimeDisplayProps {
  label: string;
  time: string;
  period?: DayPeriod;
  isDark: boolean;
  isLST?: boolean;
  compact?: boolean;
}

function TimeDisplay({ label, time, period, isDark, isLST, compact }: TimeDisplayProps) {
  const getPeriodBg = () => {
    if (!period) return "";
    if (period === "day") return isDark ? "bg-yellow-900/20" : "bg-yellow-50";
    if (period === "twilight") return isDark ? "bg-orange-900/20" : "bg-orange-50";
    return isDark ? "bg-indigo-900/20" : "bg-indigo-50";
  };

  return (
    <div className={`flex items-center gap-1.5 ${compact ? "px-2 py-1" : "px-2.5 py-1.5"} rounded ${getPeriodBg()}`}>
      {period && <DayNightIndicator period={period} isDark={isDark} />}
      <span className={`${compact ? "text-sm" : "text-sm"} ${isDark ? "text-gray-400" : "text-gray-500"}`}>
        {label}
      </span>
      <span
        className={`font-mono ${compact ? "text-lg" : "text-base"} font-semibold ${
          isLST
            ? isDark ? "text-blue-400" : "text-blue-600"
            : isDark ? "text-white" : "text-gray-900"
        }`}
      >
        {time}
      </span>
    </div>
  );
}

export default function TimeBar() {
  const { isDark } = useTheme();
  const {
    timeBarSticky, setTimeBarSticky,
    timeBarExpanded, setTimeBarExpanded,
    timeBarLSTLocations, setTimeBarLSTLocations,
    timeBarCivilTimeZones, setTimeBarCivilTimeZones,
    customLocationCoords, setCustomLocationCoords
  } = useDashboard();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lstTimes, setLstTimes] = useState<Record<string, string>>({});
  const [lstLoading, setLstLoading] = useState(true);
  const [showLocationSettings, setShowLocationSettings] = useState(false);
  const [showTimeZoneSettings, setShowTimeZoneSettings] = useState(false);
  const [customLatInput, setCustomLatInput] = useState(String(customLocationCoords.lat));
  const [customLonInput, setCustomLonInput] = useState(String(customLocationCoords.lon));

  // Get the actual location objects from the selected IDs
  const selectedLocations = timeBarLSTLocations
    .map((id) => getLocationById(id))
    .filter((loc): loc is NonNullable<typeof loc> => loc !== undefined);

  // Get available locations (not already selected), excluding custom from the add list if already added
  const availableLocations = LOCATION_PRESETS.filter(
    (loc) => !timeBarLSTLocations.includes(loc.id)
  );

  // Get selected civil time zones
  const selectedTimeZones = ALL_TIME_ZONES.filter((tz) => timeBarCivilTimeZones.includes(tz.timezone));
  const availableTimeZones = ALL_TIME_ZONES.filter((tz) => !timeBarCivilTimeZones.includes(tz.timezone));

  // Check if custom location is selected
  const hasCustomLocation = timeBarLSTLocations.includes("custom");

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchLST = async (coords: string): Promise<string> => {
      const now = new Date();
      const date = now.toISOString().split("T")[0];
      const time = now.toISOString().split("T")[1].split(".")[0];
      const url = `https://aa.usno.navy.mil/api/siderealtime?date=${date}&coords=${coords}&reps=1&intv_mag=5&intv_unit=minutes&time=${time}`;

      try {
        const response = await fetch(url, {
          headers: { Accept: "application/json" },
        });
        const data = await response.json();
        const lst = data?.properties?.data?.[0]?.last;
        return lst?.substring(0, 8) || "--:--:--";
      } catch {
        return "--:--:--";
      }
    };

    const updateAllLSTs = async () => {
      setLstLoading(true);
      const results: Record<string, string> = {};
      await Promise.all(
        selectedLocations.map(async (loc) => {
          // Use custom coordinates for custom location
          const coords = loc.id === "custom"
            ? `${customLocationCoords.lat},${customLocationCoords.lon}`
            : getLocationCoords(loc.id);
          results[loc.id] = await fetchLST(coords);
        })
      );
      setLstTimes(results);
      setLstLoading(false);
    };

    updateAllLSTs();
    const interval = setInterval(updateAllLSTs, 60000);
    return () => clearInterval(interval);
  }, [timeBarLSTLocations, customLocationCoords]);

  const addLocation = (id: string) => {
    if (!timeBarLSTLocations.includes(id)) {
      setTimeBarLSTLocations([...timeBarLSTLocations, id]);
    }
  };

  const removeLocation = (id: string) => {
    if (timeBarLSTLocations.length > 1) {
      setTimeBarLSTLocations(timeBarLSTLocations.filter((loc) => loc !== id));
    }
  };

  const addTimeZone = (timezone: string) => {
    if (!timeBarCivilTimeZones.includes(timezone)) {
      setTimeBarCivilTimeZones([...timeBarCivilTimeZones, timezone]);
    }
  };

  const removeTimeZone = (timezone: string) => {
    if (timeBarCivilTimeZones.length > 1) {
      setTimeBarCivilTimeZones(timeBarCivilTimeZones.filter((tz) => tz !== timezone));
    }
  };

  const updateCustomLocation = () => {
    const lat = parseFloat(customLatInput);
    const lon = parseFloat(customLonInput);
    if (!isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
      setCustomLocationCoords({ lat, lon });
    }
  };

  const formatTime = (date: Date, timezone: string): string => {
    if (timezone === "UTC") {
      return date.toLocaleTimeString("en-US", {
        timeZone: "UTC",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
    }
    return date.toLocaleTimeString("en-US", {
      timeZone: timezone,
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      timeZone: "UTC",
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  // Use first selected location for compact display
  const primaryLocation = selectedLocations[0];
  const primaryLst = lstLoading ? "..." : (primaryLocation ? lstTimes[primaryLocation.id] : "--:--:--") || "--:--:--";
  const utcTime = formatTime(currentTime, "UTC");
  const primaryPeriod = primaryLocation ? getDayPeriod(currentTime, primaryLocation.timezone) : getDayPeriod(currentTime, "America/Denver");

  return (
    <div
      className={`w-full rounded-lg shadow-md overflow-hidden transition-all duration-300 ${
        isDark ? "bg-gray-800" : "bg-white"
      }`}
    >
      {/* Compact Always-Visible Bar */}
      <button
        onClick={() => setTimeBarExpanded(!timeBarExpanded)}
        className={`w-full px-4 py-3 flex items-center justify-between transition-colors ${
          isDark ? "hover:bg-gray-700" : "hover:bg-gray-50"
        }`}
      >
        <div className="flex items-center gap-3 flex-wrap">
          <TimeDisplay
            label={primaryLocation ? `${primaryLocation.shortName} LST` : "LST"}
            time={primaryLst}
            period={primaryPeriod}
            isDark={isDark}
            isLST
            compact
          />
          <TimeDisplay
            label="UTC"
            time={utcTime}
            isDark={isDark}
            compact
          />
          <span className={`text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}>
            {formatDate(currentTime)}
          </span>
        </div>
        <div className={`flex items-center gap-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          <span
            onClick={(e) => {
              e.stopPropagation();
              setTimeBarSticky(!timeBarSticky);
            }}
            className={`p-1 rounded transition-colors cursor-pointer ${
              timeBarSticky
                ? isDark ? "text-blue-400 hover:bg-gray-600" : "text-blue-600 hover:bg-gray-200"
                : isDark ? "text-gray-500 hover:bg-gray-600 hover:text-gray-300" : "text-gray-400 hover:bg-gray-200 hover:text-gray-600"
            }`}
            title={timeBarSticky ? "Unpin time bar" : "Pin time bar to top"}
          >
            {timeBarSticky ? <PushPinIcon style={{ fontSize: 16 }} /> : <PushPinOutlinedIcon style={{ fontSize: 16 }} />}
          </span>
          {timeBarExpanded ? <ExpandLessIcon style={{ fontSize: 18 }} /> : <ExpandMoreIcon style={{ fontSize: 18 }} />}
        </div>
      </button>

      {/* Expanded Details */}
      <div
        className={`transition-all duration-300 overflow-hidden ${
          timeBarExpanded ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className={`px-4 pb-4 pt-3 border-t ${isDark ? "border-gray-700" : "border-gray-200"}`}>
          {/* LST Times */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className={`text-sm font-medium uppercase tracking-wide ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                Local Sidereal Time
              </div>
              <button
                onClick={() => setShowLocationSettings(!showLocationSettings)}
                className={`p-1 rounded transition-colors ${
                  showLocationSettings
                    ? isDark ? "text-blue-400 bg-gray-700" : "text-blue-600 bg-gray-200"
                    : isDark ? "text-gray-500 hover:text-gray-300 hover:bg-gray-700" : "text-gray-400 hover:text-gray-600 hover:bg-gray-200"
                }`}
                title="Configure LST locations"
              >
                <SettingsIcon style={{ fontSize: 16 }} />
              </button>
            </div>

            {/* Location Settings Panel */}
            {showLocationSettings && (
              <div className={`mb-3 p-3 rounded-lg ${isDark ? "bg-gray-700/50" : "bg-gray-100"}`}>
                <div className={`text-xs font-medium mb-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  Selected Locations:
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {selectedLocations.map((loc) => (
                    <span
                      key={loc.id}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${
                        isDark ? "bg-blue-900/40 text-blue-300" : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {loc.shortName}
                      {selectedLocations.length > 1 && (
                        <button
                          onClick={() => removeLocation(loc.id)}
                          className={`ml-0.5 rounded-full p-0.5 transition-colors ${
                            isDark ? "hover:bg-blue-800" : "hover:bg-blue-200"
                          }`}
                          title={`Remove ${loc.shortName}`}
                        >
                          <CloseIcon style={{ fontSize: 12 }} />
                        </button>
                      )}
                    </span>
                  ))}
                </div>

                {availableLocations.length > 0 && (
                  <>
                    <div className={`text-xs font-medium mb-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                      Add Location:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {availableLocations.map((loc) => (
                        <button
                          key={loc.id}
                          onClick={() => addLocation(loc.id)}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                            isDark
                              ? "bg-gray-600 text-gray-300 hover:bg-gray-500"
                              : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                          }`}
                          title={loc.name}
                        >
                          <AddIcon style={{ fontSize: 12 }} />
                          {loc.shortName}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {/* Custom Location Coordinates */}
                {hasCustomLocation && (
                  <div className={`mt-3 pt-3 border-t ${isDark ? "border-gray-600" : "border-gray-300"}`}>
                    <div className={`text-xs font-medium mb-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                      Custom Location Coordinates:
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <label className={`block text-xs mb-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>Lat</label>
                        <input
                          type="text"
                          value={customLatInput}
                          onChange={(e) => setCustomLatInput(e.target.value)}
                          className={`w-full px-2 py-1 text-xs rounded border ${
                            isDark
                              ? "bg-gray-600 border-gray-500 text-gray-200"
                              : "bg-white border-gray-300 text-gray-800"
                          }`}
                          placeholder="-90 to 90"
                        />
                      </div>
                      <div className="flex-1">
                        <label className={`block text-xs mb-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>Lon</label>
                        <input
                          type="text"
                          value={customLonInput}
                          onChange={(e) => setCustomLonInput(e.target.value)}
                          className={`w-full px-2 py-1 text-xs rounded border ${
                            isDark
                              ? "bg-gray-600 border-gray-500 text-gray-200"
                              : "bg-white border-gray-300 text-gray-800"
                          }`}
                          placeholder="-180 to 180"
                        />
                      </div>
                      <button
                        onClick={updateCustomLocation}
                        className={`mt-4 px-3 py-1 text-xs rounded transition-colors ${
                          isDark
                            ? "bg-blue-600 text-white hover:bg-blue-500"
                            : "bg-blue-500 text-white hover:bg-blue-600"
                        }`}
                      >
                        Update
                      </button>
                    </div>
                    <div className={`mt-1 text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                      Current: {customLocationCoords.lat.toFixed(4)}, {customLocationCoords.lon.toFixed(4)}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {selectedLocations.map((loc) => (
                <TimeDisplay
                  key={loc.id}
                  label={loc.shortName}
                  time={lstLoading ? "..." : lstTimes[loc.id] || "--:--:--"}
                  period={getDayPeriod(currentTime, loc.timezone)}
                  isDark={isDark}
                  isLST
                />
              ))}
            </div>
          </div>

          {/* Civil Times */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className={`text-sm font-medium uppercase tracking-wide ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                Civil Time
              </div>
              <button
                onClick={() => setShowTimeZoneSettings(!showTimeZoneSettings)}
                className={`p-1 rounded transition-colors ${
                  showTimeZoneSettings
                    ? isDark ? "text-blue-400 bg-gray-700" : "text-blue-600 bg-gray-200"
                    : isDark ? "text-gray-500 hover:text-gray-300 hover:bg-gray-700" : "text-gray-400 hover:text-gray-600 hover:bg-gray-200"
                }`}
                title="Configure time zones"
              >
                <SettingsIcon style={{ fontSize: 16 }} />
              </button>
            </div>

            {/* Time Zone Settings Panel */}
            {showTimeZoneSettings && (
              <div className={`mb-3 p-3 rounded-lg ${isDark ? "bg-gray-700/50" : "bg-gray-100"}`}>
                <div className={`text-xs font-medium mb-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  Selected Time Zones:
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {selectedTimeZones.map((tz) => (
                    <span
                      key={tz.id}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${
                        isDark ? "bg-green-900/40 text-green-300" : "bg-green-100 text-green-700"
                      }`}
                    >
                      {tz.label}
                      {selectedTimeZones.length > 1 && (
                        <button
                          onClick={() => removeTimeZone(tz.timezone)}
                          className={`ml-0.5 rounded-full p-0.5 transition-colors ${
                            isDark ? "hover:bg-green-800" : "hover:bg-green-200"
                          }`}
                          title={`Remove ${tz.label}`}
                        >
                          <CloseIcon style={{ fontSize: 12 }} />
                        </button>
                      )}
                    </span>
                  ))}
                </div>

                {availableTimeZones.length > 0 && (
                  <>
                    <div className={`text-xs font-medium mb-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                      Add Time Zone:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {availableTimeZones.map((tz) => (
                        <button
                          key={tz.id}
                          onClick={() => addTimeZone(tz.timezone)}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                            isDark
                              ? "bg-gray-600 text-gray-300 hover:bg-gray-500"
                              : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                          }`}
                          title={tz.timezone}
                        >
                          <AddIcon style={{ fontSize: 12 }} />
                          {tz.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {selectedTimeZones.map((tz) => (
                <TimeDisplay
                  key={tz.id}
                  label={tz.label}
                  time={formatTime(currentTime, tz.timezone)}
                  period={tz.timezone !== "UTC" ? getDayPeriod(currentTime, tz.timezone) : undefined}
                  isDark={isDark}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
