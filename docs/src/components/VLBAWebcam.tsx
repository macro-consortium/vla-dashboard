import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";

export const VLBA_WEBCAM_URL = "http://www.vlba.nrao.edu/sites/SITECAM/allsites.shtml";

const VLBA_WEBCAM_BASE = "http://www.vlba.nrao.edu/sites/SITECAM";

interface VLBAStation {
  id: string;
  name: string;
  shortName: string;
  image: string;
  note?: string;
}

const VLBA_STATIONS: VLBAStation[] = [
  { id: "SC", name: "St. Croix", shortName: "SC", image: "SCSNAP.JPG" },
  { id: "HN", name: "Hancock", shortName: "HN", image: "HNSNAP.JPG" },
  { id: "NL", name: "North Liberty", shortName: "NL", image: "NLSNAP.JPG" },
  { id: "FD", name: "Fort Davis", shortName: "FD", image: "FDSNAP.JPG" },
  { id: "LA", name: "Los Alamos", shortName: "LA", image: "LASNAP.JPG", note: "Not realtime" },
  { id: "PT", name: "Pie Town", shortName: "PT", image: "PTSNAP.JPG" },
  { id: "KP", name: "Kitt Peak", shortName: "KP", image: "KPSNAP.JPG" },
  { id: "OV", name: "Owens Valley", shortName: "OV", image: "OVSNAP.JPG" },
  { id: "BR", name: "Brewster", shortName: "BR", image: "BRSNAP.JPG" },
  { id: "MK", name: "Mauna Kea", shortName: "MK", image: "MKSNAP.JPG" },
];

export default function VLBAWebcam() {
  const { isDark } = useTheme();
  const [activeStation, setActiveStation] = useState<string>("SC");
  const [currentSrc, setCurrentSrc] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  const station = VLBA_STATIONS.find((s) => s.id === activeStation) || VLBA_STATIONS[0];
  const imageUrl = `${VLBA_WEBCAM_BASE}/${station.image}`;

  // Update image source when station changes
  useEffect(() => {
    setIsLoading(true);
    setCurrentSrc(`${imageUrl}?t=${Date.now()}`);
  }, [imageUrl]);

  // Preload new image before swapping to prevent layout shift
  useEffect(() => {
    const interval = setInterval(() => {
      const newSrc = `${imageUrl}?t=${Date.now()}`;
      const img = new Image();
      img.onload = () => {
        setCurrentSrc(newSrc);
      };
      img.src = newSrc;
    }, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [imageUrl]);

  return (
    <div className="flex flex-col h-full">
      {/* Station tabs - scrollable on small screens */}
      <div className="flex gap-1 mb-3 overflow-x-auto pb-1 flex-shrink-0">
        {VLBA_STATIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveStation(s.id)}
            className={`px-3 py-1.5 text-sm font-medium rounded whitespace-nowrap transition-colors ${
              activeStation === s.id
                ? isDark
                  ? "bg-blue-600 text-white"
                  : "bg-blue-500 text-white"
                : isDark
                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
            title={s.name}
          >
            {s.shortName}
          </button>
        ))}
      </div>

      {/* Station name */}
      <div className={`mb-2 flex items-center gap-2 flex-shrink-0 ${isDark ? "text-gray-200" : "text-gray-800"}`}>
        <span className="font-semibold">{station.name}</span>
        {station.note && (
          <span className={`text-xs px-2 py-0.5 rounded ${isDark ? "bg-yellow-900/50 text-yellow-400" : "bg-yellow-100 text-yellow-700"}`}>
            {station.note}
          </span>
        )}
      </div>

      {/* Webcam image container */}
      <div
        className={`relative w-full flex-1 min-h-[200px] rounded border overflow-hidden ${isDark ? "border-gray-600 bg-gray-800" : "border-gray-300 bg-gray-200"}`}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              Loading webcam...
            </span>
          </div>
        )}
        <img
          src={currentSrc}
          alt={`VLBA ${station.name} Webcam`}
          className="w-full h-full object-contain"
          onLoad={() => setIsLoading(false)}
          onError={() => setIsLoading(false)}
        />
      </div>

      <p className={`mt-2 text-xs flex-shrink-0 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
        Image refreshes every 30 seconds
      </p>
      <p className={`mt-1 flex-shrink-0 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
        Live view from{" "}
        <a
          href={VLBA_WEBCAM_URL}
          className="text-blue-500 underline hover:text-blue-400"
          target="_blank"
          rel="noopener noreferrer"
        >
          VLBA Antenna Sites
        </a>
        .
      </p>
    </div>
  );
}
