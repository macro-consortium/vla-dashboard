import VLAData from "./components/VLAData";
import VLANowFrame from "./components/VLANowFrame";
import UTCtoLSTConverter from "./components/UTCtoLSTConverter";
import LSTtoUTCConverter from "./components/LSTtoUTCConverter";
import TimeComponent from "./components/TimeComponent";

function App() {
  return (
    <div className="p-6 bg-gray-100 min-h-screen flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-4">VLA Dashboard</h1>
      <VLAData />
      <VLANowFrame />
      <UTCtoLSTConverter />
      <LSTtoUTCConverter />
      <TimeComponent />
      <p className="mt-6">
        View source and contribute on{" "}
        <a
          href="https://github.com/macro-consortium/vla-dashboard"
          className="text-blue-600 underline"
        >
          GitHub
        </a>
      </p>
    </div>
  );
}

export default App;
