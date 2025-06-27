import { useState } from "react";
import VLAData from "./components/VLAData";
import VLANowFrame from "./components/VLANowFrame";
import UTCtoLSTConverter from "./components/UTCtoLSTConverter";
import LSTtoUTCConverter from "./components/LSTtoUTCConverter";
import TimeComponent from "./components/TimeComponent";

function App() {
  const [showTime, setShowTime] = useState(false);

  const toggleTime = () => setShowTime((prev) => !prev);

  return (
    <div className="relative p-6 bg-gray-100 min-h-screen flex flex-col items-center">
      <div className="flex flex-col gap-5 items-center my-6">
        <h1 className="text-3xl font-bold text-center">VLA Dashboard</h1>

        {/* Unified Toggle Button */}
        <button
          onClick={toggleTime}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition-all duration-200"
        >
          {showTime ? "Hide Time" : "Show Time"}
        </button>
      </div>
      <VLAData />
      <VLANowFrame />
      <UTCtoLSTConverter />
      <LSTtoUTCConverter />

      {/* TimeComponent only shown when toggled */}
      {showTime && (
        <div className="w-full mt-6">
          <TimeComponent />
        </div>
      )}

      <p className="mt-10 text-center text-gray-600">
        View source and contribute on{" "}
        <a
          href="https://github.com/macro-consortium/vla-dashboard"
          className="text-blue-600 underline hover:text-blue-800"
        >
          GitHub
        </a>
      </p>
    </div>
  );
}

export default App;
