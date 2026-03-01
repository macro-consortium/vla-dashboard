import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { useDashboard } from "../context/DashboardContext";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PushPinIcon from "@mui/icons-material/PushPin";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";

interface TimeZoneDisplay {
  label: string;
  timezone: string;
}

const TIME_ZONES: TimeZoneDisplay[] = [
  { label: "UTC", timezone: "UTC" },
  { label: "Central", timezone: "America/Chicago" },
  { label: "Mountain", timezone: "America/Denver" },
  { label: "Arizona", timezone: "America/Phoenix" },
  { label: "Pacific", timezone: "America/Los_Angeles" },
  { label: "Eastern", timezone: "America/New_York" },
];

interface LSTLocation {
  name: string;
  coords: string;
}

const LST_LOCATIONS: LSTLocation[] = [
  { name: "VLA", coords: "34.08,-107.6177" },
  { name: "RLMT", coords: "31.6657,-110.6018" },
  { name: "Knox", coords: "40.9417,-90.3721" },
];

export default function TimeBar() {
  const { isDark } = useTheme();
  const { timeBarSticky, setTimeBarSticky } = useDashboard();
  const [expanded, setExpanded] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lstTimes, setLstTimes] = useState<Record<string, string>>({});
  const [lstLoading, setLstLoading] = useState(true);

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch LST times every 60 seconds
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
        LST_LOCATIONS.map(async (loc) => {
          results[loc.name] = await fetchLST(loc.coords);
        })
      );
      setLstTimes(results);
      setLstLoading(false);
    };

    updateAllLSTs();
    const interval = setInterval(updateAllLSTs, 60000);
    return () => clearInterval(interval);
  }, []);

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
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      timeZone: "UTC",
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const vlaLst = lstLoading ? "Loading..." : lstTimes["VLA"] || "--:--:--";
  const utcTime = formatTime(currentTime, "UTC");

  return (
    <div
      className={`w-full rounded-lg shadow-md overflow-hidden transition-all duration-300 ${
        isDark ? "bg-gray-800" : "bg-white"
      }`}
    >
      {/* Compact Always-Visible Bar */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full px-4 py-3 flex items-center justify-between transition-colors ${
          isDark ? "hover:bg-gray-700" : "hover:bg-gray-50"
        }`}
      >
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <AccessTimeIcon
              fontSize="small"
              className={isDark ? "text-blue-400" : "text-blue-600"}
            />
            <span className={`font-mono font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
              VLA LST: {vlaLst}
            </span>
          </div>
          <div className={`font-mono ${isDark ? "text-gray-300" : "text-gray-600"}`}>
            UTC: {utcTime}
          </div>
          <div className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            {formatDate(currentTime)}
          </div>
        </div>
        <div className={`flex items-center gap-3 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          {/* Sticky Pin Toggle */}
          <span
            onClick={(e) => {
              e.stopPropagation();
              setTimeBarSticky(!timeBarSticky);
            }}
            className={`p-1 rounded transition-colors cursor-pointer ${
              timeBarSticky
                ? isDark
                  ? "text-blue-400 hover:bg-gray-600"
                  : "text-blue-600 hover:bg-gray-200"
                : isDark
                ? "text-gray-500 hover:bg-gray-600 hover:text-gray-300"
                : "text-gray-400 hover:bg-gray-200 hover:text-gray-600"
            }`}
            title={timeBarSticky ? "Unpin time bar" : "Pin time bar to top"}
          >
            {timeBarSticky ? (
              <PushPinIcon fontSize="small" />
            ) : (
              <PushPinOutlinedIcon fontSize="small" />
            )}
          </span>
          <span className="text-xs hidden sm:inline">
            {expanded ? "Less" : "More times"}
          </span>
          {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
        </div>
      </button>

      {/* Expanded Details */}
      <div
        className={`transition-all duration-300 overflow-hidden ${
          expanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div
          className={`px-4 pb-4 pt-2 border-t ${
            isDark ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* LST Times */}
            <div>
              <h3
                className={`text-xs font-semibold uppercase tracking-wide mb-2 ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Local Sidereal Time
              </h3>
              <div className="space-y-1 font-mono text-sm">
                {LST_LOCATIONS.map((loc) => (
                  <div key={loc.name} className="flex justify-between">
                    <span className={isDark ? "text-gray-400" : "text-gray-600"}>
                      {loc.name}:
                    </span>
                    <span className={isDark ? "text-white" : "text-gray-900"}>
                      {lstLoading ? "..." : lstTimes[loc.name] || "--:--:--"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* US Time Zones - Column 1 */}
            <div>
              <h3
                className={`text-xs font-semibold uppercase tracking-wide mb-2 ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                US Time Zones
              </h3>
              <div className="space-y-1 font-mono text-sm">
                {TIME_ZONES.slice(0, 3).map((tz) => (
                  <div key={tz.timezone} className="flex justify-between">
                    <span className={isDark ? "text-gray-400" : "text-gray-600"}>
                      {tz.label}:
                    </span>
                    <span className={isDark ? "text-white" : "text-gray-900"}>
                      {formatTime(currentTime, tz.timezone)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* US Time Zones - Column 2 */}
            <div>
              <h3
                className={`text-xs font-semibold uppercase tracking-wide mb-2 ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                &nbsp;
              </h3>
              <div className="space-y-1 font-mono text-sm">
                {TIME_ZONES.slice(3).map((tz) => (
                  <div key={tz.timezone} className="flex justify-between">
                    <span className={isDark ? "text-gray-400" : "text-gray-600"}>
                      {tz.label}:
                    </span>
                    <span className={isDark ? "text-white" : "text-gray-900"}>
                      {formatTime(currentTime, tz.timezone)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
