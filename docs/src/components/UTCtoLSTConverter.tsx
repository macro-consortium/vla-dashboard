import { useState } from "react";

export default function UTCtoLSTConverter() {
    let datenow = new Date();
    const [lst, setLST] = useState("Awaiting submission...");
    // Use datenow.getUTCMonth and year and day
    const [date, setDate] = useState(`${datenow.getUTCFullYear()}-${String(datenow.getUTCMonth() + 1).padStart(2, "0")}-${String(datenow.getUTCDate()).padStart(2, "0")}`);
    const [time, setTime] = useState(`${String(datenow.getUTCHours()).padStart(2, "0")}:${String(datenow.getUTCMinutes()).padStart(2, "0")}:${String(datenow.getUTCSeconds()).padStart(2, "0")}`);

    const fetchLST = async () => {
        const url = `https://aa.usno.navy.mil/api/siderealtime?date=${date}&coords=34.08,-107.6177&reps=1&intv_mag=5&intv_unit=minutes&time=${time}`;
        try {
            const response = await fetch(url, {
                headers: { 'Accept': 'application/json' }
            });
            const data = await response.json();
            const last = data.properties.data[0].last;
            setLST(`LAST (Local Apparent Sidereal Time): ${last.substring(0, 8)}`);
        } catch (error) {
            setLST("Error fetching data:\n" + error);
        }
    };

    return (
        <div className="bg-white mt-6 p-4 w-full max-w-3xl rounded-lg shadow-md">
            <h2 className="text-xl font-semibold">UTC to LST Converter (VLA Site)</h2>
            <p className="mb-2">Enter the UTC date and time to calculate the Local Sidereal Time (LST) at the VLA.</p>
            <label className="block mb-1">Date:</label>
            <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border rounded px-2 py-1 mb-3 w-full"
            />
            <label className="block mb-1">Time (HH:MM:SS):</label>
            <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="HH:MM:SS"
                className="border rounded px-2 py-1 mb-3 w-full"
            />
            <button
                onClick={fetchLST}
                className="bg-blue-600 text-white px-4 py-2 rounded"
            >
                Calculate LST
            </button>
            <h3 className="mt-4 font-semibold">Calculated LST Data</h3>
            <pre>{lst}</pre>
        </div>
    );
}
