import { useState, useEffect } from "react";

export default function TimeComponent() {
  const [times, setTimes] = useState({
    utc: "",
    central: "",
    arizona: "",
    pacific: "",
    mountain: "",
    eastern: "",
  });

  const [lst, setLst] = useState({
    vla: { base: "Loading...", lastSync: Date.now() },
    rlmt: { base: "Loading...", lastSync: Date.now() },
    knox: { base: "Loading...", lastSync: Date.now() },
  });

  // const LST_INCREMENT = 0.9973; // Sidereal seconds per standard second
  const RESYNC_INTERVAL = 60000; // User-defined re-sync interval (e.g., 60 seconds)

  useEffect(() => {
    const updateLocalTimes = () => {
      const now = new Date();
      setTimes({
        utc: now.toLocaleString("en-CA", {
          timeZone: "UTC", hour12: false,
        }) + "   ", 
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
      // Get the current date and time in UTC
      const now = new Date();
      // Don't use the date in the local timezone, but in UTC
      const date = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")}`;
      const time = `${String(now.getUTCHours()).padStart(2, "0")}:${String(now.getUTCMinutes()).padStart(2, "0")}:${String(now.getUTCSeconds()).padStart(2, "0")}`;

      // console.log("Fetching LST for", coords, "at", date, time);

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
      const now = Date.now();
      const [vla, rlmt, knox] = await Promise.all([
        fetchLST("34.08,-107.6177"),
        fetchLST("31.6657,-110.6018"),
        fetchLST("40.9417,-90.3721"),
      ]);
      setLst({
        vla: { base: vla, lastSync: now },
        rlmt: { base: rlmt, lastSync: now },
        knox: { base: knox, lastSync: now },
      });
    };

    updateAllLSTs();
    const interval = setInterval(updateAllLSTs, RESYNC_INTERVAL); // Re-sync periodically
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const incrementLST = () => {
      setLst((prevLst) => {
        const incrementTime = (base: string) => {
          if (base === "Loading..." || base === "Error") return base;
  
          // Parse the LST string into a Date object
          const [hours, minutes, seconds] = base.split(":").map(Number);
          const date = new Date();
          date.setUTCHours(hours, minutes, seconds);
  
          // Increment by 1 second
          date.setUTCSeconds(date.getUTCSeconds() + 1);
  
          // Format back to HH:mm:ss
          return date.toISOString().substring(11, 19);
        };
  
        return {
          vla: { ...prevLst.vla, base: incrementTime(prevLst.vla.base) },
          rlmt: { ...prevLst.rlmt, base: incrementTime(prevLst.rlmt.base) },
          knox: { ...prevLst.knox, base: incrementTime(prevLst.knox.base) },
        };
      });
    };

    const interval = setInterval(incrementLST, 1000); // Increment every second
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="fixed top-0 right-0 p-4 text-sm md:text-base font-mono bg-black text-white z-50 space-y-1 min-w-90">
      <div className="flex justify-between">
        <span>VLA LST:</span>
        <span>{lst.vla.base}</span>
      </div>
      <div className="flex justify-between">
        <span>RLMT LST:</span>
        <span>{lst.rlmt.base}</span>
      </div>
      <div className="flex justify-between">
        <span>Knox LST:</span>
        <span>{lst.knox.base}</span>
      </div>
      <div className="flex justify-between">
        <span>UTC:</span>
        <span>{times.utc}</span>
      </div>
      <div className="flex justify-between">
        <span>Eastern Time:</span>
        <span>{times.eastern}</span>
      </div>
      <div className="flex justify-between">
        <span>Central Time:</span>
        <span>{times.central}</span>
      </div>
      <div className="flex justify-between">
        <span>Mountain Time:</span>
        <span>{times.mountain}</span>
      </div>
      <div className="flex justify-between">
        <span>AZ Time:</span>
        <span>{times.arizona}</span>
      </div>
      <div className="flex justify-between">
        <span>Pacific Time:</span>
        <span>{times.pacific}</span>
      </div>
    </div>
  );
  // return (
  //   <div className="fixed top-0 right-0 p-4 text-sm md:text-base font-mono bg-black text-white z-50 space-y-1">
  //     <div>VLA LST: {lst.vla.base}</div>
  //     <div>RLMT LST: {lst.rlmt.base}</div>
  //     <div>Knox LST: {lst.knox.base}</div>
  //     <div>UTC: {times.utc}</div>
  //     <div>Eastern Time: {times.eastern}</div>
  //     <div>Central Time: {times.central}</div>
  //     <div>Mountain Time: {times.mountain}</div>
  //     <div>AZ Time: {times.arizona}</div>
  //     <div>Pacific Time: {times.pacific}</div>

  //   </div>
  // );
}
