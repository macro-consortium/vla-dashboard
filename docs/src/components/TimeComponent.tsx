import { useState, useEffect } from "react";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

export default function TimeComponent() {
  const [show, setShow] = useState(false);
  const [times, setTimes] = useState({
    utc: "",
    central: "",
    arizona: "",
    pacific: "",
    mountain: "",
    eastern: "",
  });

  const [lst1, setLst1] = useState("Loading...");
  const [lst2, setLst2] = useState("Loading...");
  const [lst3, setLst3] = useState("Loading...");

  useEffect(() => {
    const updateLocalTimes = () => {
      const now = new Date();
      setTimes({
        utc: now.toUTCString(),
        central: now.toLocaleString("en-US", { timeZone: "America/Chicago" }),
        arizona: now.toLocaleString("en-US", { timeZone: "America/Phoenix" }),
        pacific: now.toLocaleString("en-US", {
          timeZone: "America/Los_Angeles",
        }),
        mountain: now.toLocaleString("en-US", { timeZone: "America/Denver" }),
        eastern: now.toLocaleString("en-US", { timeZone: "America/New_York" }),
      });
    };

    updateLocalTimes();
    const interval = setInterval(updateLocalTimes, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchLST = async (coords: string) => {
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
        return lst?.substring(0, 8) || "Error";
      } catch (error) {
        console.error("Error fetching LST for", coords, error);
        return "Error";
      }
    };

    const updateAllLSTs = async () => {
      const [vla, rlmt, knox] = await Promise.all([
        fetchLST("34.08,-107.6177"),
        fetchLST("31.6657,-110.6018"),
        fetchLST("40.9417,-90.3721"),
      ]);
      setLst1(vla);
      setLst2(rlmt);
      setLst3(knox);
    };

    updateAllLSTs();
    const interval = setInterval(updateAllLSTs, 60000); // every 60s
    return () => clearInterval(interval);
  }, []);

  const toggleShow = () => setShow((prev) => !prev);

  return (
    <div className="fixed top-0 right-0 z-50">
      {/* Toggle Button */}
      <button
        onClick={toggleShow}
        className="absolute top-4 right-4 bg-gray-800 hover:bg-gray-700 text-white rounded-full w-10 h-10 shadow-lg flex items-center justify-center transition z-50"
        aria-label="Toggle time display"
      >
        {show ? <ExpandLessIcon /> : <AccessTimeIcon />}
      </button>

      {/* Slide Panel */}
      <div
        className={`transition-all duration-300 transform ${
          show ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
        } bg-black text-white font-mono p-4 text-sm md:text-base shadow-lg rounded-bl-lg`}
        style={{ marginTop: "60px" }}
      >
        <div className="space-y-1">
          <div>VLA LST: {lst1}</div>
          <div>RLMT LST: {lst2}</div>
          <div>Knox LST: {lst3}</div>
          <div className="border-t border-gray-700 my-2 pt-2">UTC: {times.utc}</div>
          <div>Central Time: {times.central}</div>
          <div>AZ Time: {times.arizona}</div>
          <div>Pacific Time: {times.pacific}</div>
          <div>Mountain Time: {times.mountain}</div>
          <div>Eastern Time: {times.eastern}</div>
        </div>
      </div>
    </div>
  );
}
