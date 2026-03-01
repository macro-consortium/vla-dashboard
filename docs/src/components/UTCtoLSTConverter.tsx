import { useState } from "react";
import { useTheme } from "../context/ThemeContext";

export default function UTCtoLSTConverter() {
  const { isDark } = useTheme();
  const datenow = new Date();
  const [lst, setLST] = useState("Awaiting submission...");
  const [date, setDate] = useState(
    `${datenow.getUTCFullYear()}-${String(datenow.getUTCMonth() + 1).padStart(2, "0")}-${String(datenow.getUTCDate()).padStart(2, "0")}`
  );
  const [time, setTime] = useState(
    `${String(datenow.getUTCHours()).padStart(2, "0")}:${String(datenow.getUTCMinutes()).padStart(2, "0")}:${String(datenow.getUTCSeconds()).padStart(2, "0")}`
  );

  const fetchLST = async () => {
    const url = `https://aa.usno.navy.mil/api/siderealtime?date=${date}&coords=34.08,-107.6177&reps=1&intv_mag=5&intv_unit=minutes&time=${time}`;
    try {
      const response = await fetch(url, {
        headers: { Accept: "application/json" },
      });
      const data = await response.json();
      const last = data.properties.data[0].last;
      setLST(`LAST (Local Apparent Sidereal Time): ${last.substring(0, 8)}`);
    } catch (error) {
      setLST("Error fetching data:\n" + error);
    }
  };

  const inputClass = `border rounded px-2 py-1 mb-3 w-full ${
    isDark
      ? "bg-gray-700 border-gray-600 text-gray-100"
      : "bg-white border-gray-300 text-gray-900"
  }`;

  return (
    <div>
      <p className={`mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
        Enter the UTC date and time to calculate the Local Sidereal Time (LST) at the VLA.
      </p>
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
