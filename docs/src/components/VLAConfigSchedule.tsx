import { useState } from "react";
import { useTheme } from "../context/ThemeContext";

export const VLA_CONFIG_SCHEDULE_URL = "https://science.nrao.edu/facilities/vla/proposing/configpropdeadlines";

interface ConfigEntry {
  semester: string;
  startDate: Date;
  endDate: Date;
  configuration: string;
  proposalDeadline: string;
}

// Configuration schedule data - update periodically
// Dates parsed to enable proper current/future detection
// Note: Semesters can have multiple configurations (separate entries)
const CONFIG_SCHEDULE: ConfigEntry[] = [
  // Historical data (2024)
  {
    semester: "2024A",
    startDate: new Date("2024-01-25"),
    endDate: new Date("2024-04-22"),
    configuration: "C",
    proposalDeadline: "Aug 2, 2023",
  },
  {
    semester: "2024A",
    startDate: new Date("2024-05-08"),
    endDate: new Date("2024-09-16"),
    configuration: "B",
    proposalDeadline: "Aug 2, 2023",
  },
  {
    semester: "2024B",
    startDate: new Date("2024-10-18"),
    endDate: new Date("2025-02-03"),
    configuration: "A",
    proposalDeadline: "Jan 31, 2024",
  },
  // 2025
  {
    semester: "2025A",
    startDate: new Date("2025-02-25"),
    endDate: new Date("2025-05-12"),
    configuration: "D",
    proposalDeadline: "Jul 31, 2024",
  },
  {
    semester: "2025A",
    startDate: new Date("2025-05-22"),
    endDate: new Date("2025-08-18"),
    configuration: "C",
    proposalDeadline: "Jul 31, 2024",
  },
  {
    semester: "2025B",
    startDate: new Date("2025-09-03"),
    endDate: new Date("2026-01-20"),
    configuration: "B",
    proposalDeadline: "Jan 29, 2025",
  },
  // 2026
  {
    semester: "2026A",
    startDate: new Date("2026-02-20"),
    endDate: new Date("2026-06-22"),
    configuration: "A",
    proposalDeadline: "Jul 30, 2025",
  },
  {
    semester: "2026A",
    startDate: new Date("2026-07-10"),
    endDate: new Date("2026-10-19"),
    configuration: "D",
    proposalDeadline: "Jul 30, 2025",
  },
  {
    semester: "2026B",
    startDate: new Date("2026-10-29"),
    endDate: new Date("2027-02-08"),
    configuration: "C",
    proposalDeadline: "Feb 4, 2026",
  },
  // 2027
  {
    semester: "2027A",
    startDate: new Date("2027-02-24"),
    endDate: new Date("2027-06-07"),
    configuration: "B",
    proposalDeadline: "Jul 29, 2026",
  },
  {
    semester: "2027A",
    startDate: new Date("2027-06-18"),
    endDate: new Date("2027-10-18"),
    configuration: "A",
    proposalDeadline: "Jul 29, 2026",
  },
  {
    semester: "2027B",
    startDate: new Date("2027-11-05"),
    endDate: new Date("2028-02-14"),
    configuration: "D",
    proposalDeadline: "Feb 3, 2027",
  },
];

function formatDateRange(start: Date, end: Date): string {
  const startStr = start.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const endStr = end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return `${startStr} - ${endStr}`;
}

function getConfigColor(config: string): string {
  switch (config) {
    case "A": return "text-red-500";
    case "B": return "text-orange-500";
    case "C": return "text-yellow-600";
    case "D": return "text-green-500";
    case "BnA": return "text-purple-500";
    default: return "text-gray-500";
  }
}

function getConfigBgColor(config: string, isDark: boolean): string {
  switch (config) {
    case "A": return isDark ? "bg-red-900/30" : "bg-red-50";
    case "B": return isDark ? "bg-orange-900/30" : "bg-orange-50";
    case "C": return isDark ? "bg-yellow-900/30" : "bg-yellow-50";
    case "D": return isDark ? "bg-green-900/30" : "bg-green-50";
    default: return isDark ? "bg-gray-700" : "bg-gray-50";
  }
}

function getConfigDescription(config: string): string {
  switch (config) {
    case "A": return "Most extended (~22 mi)";
    case "B": return "Extended (~6 mi)";
    case "C": return "Compact (~2 mi)";
    case "D": return "Most compact (~0.6 mi)";
    case "BnA": return "Hybrid (VLA Sky Survey)";
    default: return "";
  }
}

export default function VLAConfigSchedule() {
  const { isDark } = useTheme();
  const [showHistory, setShowHistory] = useState(false);
  const today = new Date();

  // Find current configuration (today falls within start-end range)
  const currentEntry = CONFIG_SCHEDULE.find(
    (entry) => today >= entry.startDate && today <= entry.endDate
  );

  // Find upcoming configurations (start date is in the future)
  const upcomingEntries = CONFIG_SCHEDULE.filter(
    (entry) => entry.startDate > today
  );

  // Find past configurations (end date is in the past)
  const pastEntries = CONFIG_SCHEDULE.filter(
    (entry) => entry.endDate < today
  ).reverse(); // Most recent first

  // If no current, show the next upcoming as "Next"
  const displayCurrent = currentEntry || upcomingEntries[0];
  const displayUpcoming = currentEntry ? upcomingEntries : upcomingEntries.slice(1);

  // Generate unique keys for entries (semester + config + start date)
  const getEntryKey = (entry: ConfigEntry) =>
    `${entry.semester}-${entry.configuration}-${entry.startDate.toISOString()}`;

  return (
    <div>
      {/* Current Configuration Highlight */}
      {displayCurrent && (
        <div className={`p-4 rounded-lg mb-4 ${getConfigBgColor(displayCurrent.configuration, isDark)}`}>
          <p className={`text-xs font-medium uppercase tracking-wide mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            {currentEntry ? "Current Configuration" : "Next Configuration"}
          </p>
          <div className="flex items-center gap-4">
            <span className={`text-4xl font-bold ${getConfigColor(displayCurrent.configuration)}`}>
              {displayCurrent.configuration}
            </span>
            <div>
              <p className={`text-sm font-medium ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                {displayCurrent.semester} &middot; {getConfigDescription(displayCurrent.configuration)}
              </p>
              <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                {formatDateRange(displayCurrent.startDate, displayCurrent.endDate)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Schedule */}
      {displayUpcoming.length > 0 && (
        <div className="mb-4">
          <p className={`text-xs font-medium uppercase tracking-wide mb-2 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
            Upcoming Configurations
          </p>
          <div className={`overflow-x-auto rounded border ${isDark ? "border-gray-700" : "border-gray-200"}`}>
            <table className="w-full text-sm">
              <thead className={isDark ? "bg-gray-700" : "bg-gray-100"}>
                <tr>
                  <th className={`px-3 py-2 text-left ${isDark ? "text-gray-300" : "text-gray-700"}`}>Semester</th>
                  <th className={`px-3 py-2 text-left ${isDark ? "text-gray-300" : "text-gray-700"}`}>Config</th>
                  <th className={`px-3 py-2 text-left ${isDark ? "text-gray-300" : "text-gray-700"}`}>Dates</th>
                  <th className={`px-3 py-2 text-left ${isDark ? "text-gray-300" : "text-gray-700"}`}>Proposal Deadline</th>
                </tr>
              </thead>
              <tbody>
                {displayUpcoming.map((entry) => (
                  <tr
                    key={getEntryKey(entry)}
                    className={`border-t ${isDark ? "border-gray-700" : "border-gray-200"}`}
                  >
                    <td className={`px-3 py-2 font-medium ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                      {entry.semester}
                    </td>
                    <td className={`px-3 py-2`}>
                      <span className={`font-bold ${getConfigColor(entry.configuration)}`}>
                        {entry.configuration}
                      </span>
                      <span className={`ml-2 text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                        {getConfigDescription(entry.configuration).split(" ")[0]}
                      </span>
                    </td>
                    <td className={`px-3 py-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                      {formatDateRange(entry.startDate, entry.endDate)}
                    </td>
                    <td className={`px-3 py-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      {entry.proposalDeadline}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Past Configurations (collapsible) */}
      {pastEntries.length > 0 && (
        <div className="mb-3">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`text-xs font-medium uppercase tracking-wide mb-2 flex items-center gap-1 transition-colors ${
              isDark ? "text-gray-500 hover:text-gray-400" : "text-gray-400 hover:text-gray-500"
            }`}
          >
            <span>{showHistory ? "▼" : "▶"}</span>
            Past Configurations ({pastEntries.length})
          </button>
          {showHistory && (
            <div className={`overflow-x-auto rounded border ${isDark ? "border-gray-700" : "border-gray-200"}`}>
              <table className="w-full text-sm">
                <thead className={isDark ? "bg-gray-700" : "bg-gray-100"}>
                  <tr>
                    <th className={`px-3 py-2 text-left ${isDark ? "text-gray-300" : "text-gray-700"}`}>Semester</th>
                    <th className={`px-3 py-2 text-left ${isDark ? "text-gray-300" : "text-gray-700"}`}>Config</th>
                    <th className={`px-3 py-2 text-left ${isDark ? "text-gray-300" : "text-gray-700"}`}>Dates</th>
                  </tr>
                </thead>
                <tbody>
                  {pastEntries.map((entry) => (
                    <tr
                      key={getEntryKey(entry)}
                      className={`border-t ${isDark ? "border-gray-700" : "border-gray-200"}`}
                    >
                      <td className={`px-3 py-2 font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        {entry.semester}
                      </td>
                      <td className={`px-3 py-2`}>
                        <span className={`font-bold ${getConfigColor(entry.configuration)}`}>
                          {entry.configuration}
                        </span>
                      </td>
                      <td className={`px-3 py-2 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                        {formatDateRange(entry.startDate, entry.endDate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
        * Some dates may be preliminary.{" "}
        <a
          href={VLA_CONFIG_SCHEDULE_URL}
          className="text-blue-500 underline hover:text-blue-400"
          target="_blank"
          rel="noopener noreferrer"
        >
          View full schedule
        </a>
      </p>
    </div>
  );
}
