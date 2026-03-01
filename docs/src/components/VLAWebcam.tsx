import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";

export const VLA_WEBCAM_URL = "https://public.nrao.edu/vla-webcam/";
const VLA_WEBCAM_IMAGE = "https://public.nrao.edu/wp-content/uploads/temp/vla_webcam_temp.jpg";

export default function VLAWebcam() {
  const { isDark } = useTheme();
  const [currentSrc, setCurrentSrc] = useState(`${VLA_WEBCAM_IMAGE}?t=${Date.now()}`);
  const [isLoading, setIsLoading] = useState(true);

  // Preload new image before swapping to prevent layout shift
  useEffect(() => {
    const interval = setInterval(() => {
      const newSrc = `${VLA_WEBCAM_IMAGE}?t=${Date.now()}`;
      const img = new Image();
      img.onload = () => {
        setCurrentSrc(newSrc);
      };
      img.src = newSrc;
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      {/* Fixed aspect ratio container to prevent layout shift on refresh */}
      <div
        className={`relative w-full rounded border overflow-hidden ${isDark ? "border-gray-600 bg-gray-800" : "border-gray-300 bg-gray-200"}`}
        style={{ aspectRatio: "16 / 9" }}
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
          alt="VLA Webcam Live View"
          className="w-full h-full object-cover"
          onLoad={() => setIsLoading(false)}
        />
      </div>
      <p className={`mt-2 text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
        Image refreshes every 15 seconds
      </p>
      <p className={`mt-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
        Live view from{" "}
        <a
          href={VLA_WEBCAM_URL}
          className="text-blue-500 underline hover:text-blue-400"
          target="_blank"
          rel="noopener noreferrer"
        >
          NRAO VLA Webcam
        </a>
        .
      </p>
    </div>
  );
}
