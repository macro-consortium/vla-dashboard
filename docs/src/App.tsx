import VLAData from "./components/VLAData";
import VLANowFrame from "./components/VLANowFrame";
import UTCtoLSTConverter from "./components/UTCtoLSTConverter";
import LSTtoUTCConverter from "./components/LSTtoUTCConverter";
import TimeComponent from "./components/TimeComponent";
import TimeComponentResponsive from "./components/TimeComponentResponsive";

function App() {
  return (
    <div className="relative p-6 bg-gray-100 min-h-screen flex flex-col items-center">
      <div className="flex flex-col gap-5 items-center my-6">
        <h1 className="text-3xl font-bold text-center">VLA Dashboard</h1>
        {/* TimeComponent only shown when toggled */}
        <TimeComponentResponsive />

        <div className="hidden min-[1550px]:block w-full mt-6">
          <TimeComponent />
        </div>
      </div>
      <VLAData />
      <VLANowFrame />
      <UTCtoLSTConverter />
      <LSTtoUTCConverter />

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
