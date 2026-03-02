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

interface TimeZoneDisplay {
  label: string;
  timezone: string;
}

const TIME_ZONES: TimeZoneDisplay[] = [
  { label: "UTC", timezone: "UTC" },
  { label: "Eastern", timezone: "America/New_York" },
  { label: "Central", timezone: "America/Chicago" },
  { label: "Mountain", timezone: "America/Denver" },
  { label: "Arizona", timezone: "America/Phoenix" },
  { label: "Pacific", timezone: "America/Los_Angeles" },
];

interface LSTLocation {
  name: string;
  coords: string;
  timezone: string;
}

const LST_LOCATIONS: LSTLocation[] = [
  { name: "VLA", coords: "34.08,-107.6177", timezone: "America/Denver" },
  { name: "RLMT", coords: "31.6657,-110.6018", timezone: "America/Phoenix" },
  { name: "Knox", coords: "40.9417,-90.3721", timezone: "America/Chicago" },
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
  const { timeBarSticky, setTimeBarSticky, timeBarExpanded, setTimeBarExpanded } = useDashboard();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lstTimes, setLstTimes] = useState<Record<string, string>>({});
  const [lstLoading, setLstLoading] = useState(true);

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

  const vlaLst = lstLoading ? "..." : lstTimes["VLA"] || "--:--:--";
  const utcTime = formatTime(currentTime, "UTC");
  const vlaPeriod = getDayPeriod(currentTime, "America/Denver");

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
            label="VLA LST"
            time={vlaLst}
            period={vlaPeriod}
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
          timeBarExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className={`px-4 pb-4 pt-3 border-t ${isDark ? "border-gray-700" : "border-gray-200"}`}>
          {/* LST Times */}
          <div className="mb-4">
            <div className={`text-sm font-medium uppercase tracking-wide mb-2 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
              Local Sidereal Time
            </div>
            <div className="flex flex-wrap gap-2">
              {LST_LOCATIONS.map((loc) => (
                <TimeDisplay
                  key={loc.name}
                  label={loc.name}
                  time={lstLoading ? "..." : lstTimes[loc.name] || "--:--:--"}
                  period={getDayPeriod(currentTime, loc.timezone)}
                  isDark={isDark}
                  isLST
                />
              ))}
            </div>
          </div>

          {/* Civil Times */}
          <div>
            <div className={`text-sm font-medium uppercase tracking-wide mb-2 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
              Civil Time
            </div>
            <div className="flex flex-wrap gap-2">
              {TIME_ZONES.map((tz) => (
                <TimeDisplay
                  key={tz.timezone}
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
