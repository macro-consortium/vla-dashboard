import { useState } from "react";
import * as Astronomy from "astronomy-engine";

type Result = {
  utc: string;
  central: string;
  az: string;
  pacific: string;
};

export default function LSTtoUTCConverter() {
  const observer = new Astronomy.Observer(34.08, -107.6177, 0);
  const now = new Date();

  // Get UTC date and time from Astronomy
  const utcDateTime = Astronomy.MakeTime(now);
  console.log("UTC Date and Time:", utcDateTime.date.toUTCString());
  console.log("")

  const startLST = getLSTfromUTC(utcDateTime);

  const [lst, setLST] = useState<string>(
    startLST || "00:00:00" // Default to 00:00:00 if LST is not available
  );

  const [date, setDate] = useState<string>(now.toISOString().split("T")[0]);
  const [result, setResult] = useState<Result>({
    utc: "–",
    central: "–",
    az: "–",
    pacific: "–",
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

  // This function should convert an Astronomy.AstroTime object to UTC
  function getLSTfromUTC(astrotime: Astronomy.AstroTime): string {
    const sidereal = Astronomy.SiderealTime(astrotime);
    const siderealLST = normalizeHours(sidereal + observer.longitude / 15);

    const hours = Math.floor(siderealLST);
    const minutes = Math.floor((siderealLST - hours) * 60);
    const seconds = Math.floor(
      ((siderealLST - hours) * 60 - minutes) * 60
    );
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}`;
  }

  function convertLST() {
    const targetLST = lstToDecimalHours(lst);
    const midnightUTC = new Date(`${date}T00:00:00Z`);
    const time = Astronomy.MakeTime(midnightUTC);

    let bestDiff = 24;
    let bestTime: Astronomy.AstroTime | null = null;

    for (let minutes = 0; minutes < 1440; minutes++) {
      const testTime = time.AddDays(minutes / 1440);
      const sidereal = Astronomy.SiderealTime(testTime);
      const siderealLST = normalizeHours(sidereal + observer.longitude / 15);
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
      });
    }
  }

  return (
    <div className="bg-white mt-6 p-4 w-full max-w-3xl rounded-lg shadow-md">
      <h2 className="text-xl font-semibold">LST to UTC Converter (VLA Site)</h2>
      <label className="block mb-1">LST (HH:MM:SS):</label>
      <input
        type="text"
        value={lst}
        onChange={(e) => setLST(e.target.value)}
        className="border rounded px-2 py-1 mb-3 w-full"
      />
      <label className="block mb-1">Date (YYYY-MM-DD):</label>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="border rounded px-2 py-1 mb-3 w-full"
      />
      <button
        onClick={convertLST}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Convert to UTC
      </button>
      <div className="mt-4">
        <p>
          <strong>Result UTC:</strong> {result.utc}
        </p>
        <p>
          <strong>Result Central Time:</strong> {result.central}
        </p>
        <p>
          <strong>Result AZ Time:</strong> {result.az}
        </p>
        <p>
          <strong>Result Pacific Time:</strong> {result.pacific}
        </p>
      </div>
    </div>
  );
}
