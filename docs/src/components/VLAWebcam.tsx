import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";

export const VLA_WEBCAM_URL = "https://public.nrao.edu/vla-webcam/";
const VLA_WEBCAM_IMAGE = "https://public.nrao.edu/wp-content/uploads/temp/vla_webcam_temp.jpg";

export default function VLAWebcam() {
  const { isDark } = useTheme();
  const [imageKey, setImageKey] = useState(Date.now());

  // Refresh the image every 15 seconds to match the webcam update rate
  useEffect(() => {
    const interval = setInterval(() => {
      setImageKey(Date.now());
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <img
        key={imageKey}
        src={`${VLA_WEBCAM_IMAGE}?t=${imageKey}`}
        alt="VLA Webcam Live View"
        className={`w-full rounded border ${isDark ? "border-gray-600" : "border-gray-300"}`}
      />
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
