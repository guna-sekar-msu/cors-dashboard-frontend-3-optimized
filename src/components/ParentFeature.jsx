import React, { useState } from "react";
import CORSMap from "./CORSMap";
import SiteStats from "./SiteStats";
import StacovFile from "./layers/StacovFile";

const ParentFeature = () => {
  const [selectedLayer, setSelectedLayer] = useState(null); // Selected dataset layer
  const [is3D, setIs3D] = useState(false); // Toggle for 2D/3D view
  const [selectedDate, setSelectedDate] = useState(""); // Selected date
  const [selectCoordinates,setCoordinates]=useState(null);
  // const[blobUrl,setBlobUrl]=useState(null);

  const toggleView = () => {
    setIs3D((prev) => !prev); // Toggle between 2D and 3D view
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-gradient-to-r from-blue-500 to-violet-500 text-white p-5 text-center">
        <h1>CORS Sites Dashboard</h1>
      </header>
      <div className="flex flex-1 flex-col md:flex-row">
        <div className="flex-[5] p-2.5 relative h-[60vh] md:h-auto">
          <CORSMap selectedLayer={selectedLayer} selectedDate={selectedDate} Coordinates={selectCoordinates} is3D={is3D}/> {/* Pass selected layer and is3D */}
        </div>
        <div className="md:flex-1 p-5 bg-gray-200 overflow-y-auto">
          <SiteStats
            setSelectedLayer={setSelectedLayer}
            setSelectedDateInParent={setSelectedDate} 
            setCoordinates={setCoordinates}// Fixed prop name
          />

          <button
            onClick={toggleView}
            className="mt-5 bg-white text-blue-500 font-semibold px-4 py-2 rounded shadow-md hover:bg-blue-200 transition-all"
          >
            Switch to {is3D ? "2D" : "3D"} View
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParentFeature;


// import React, { useState } from "react";
// import CORSMap from "./CORSMap";
// import SiteStats from "./SiteStats";

// const ParentFeature = () => {
//   const [selectedLayer, setSelectedLayer] = useState(null); // Default layer
//   const [is3D, setIs3D] = useState(false); // State to toggle 2D/3D view
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State for the sidebar

//   const toggleView = () => {
//     setIs3D((prev) => !prev); // Toggle between 2D and 3D
//   };

//   const toggleSidebar = () => {
//     setIsSidebarOpen((prev) => !prev); // Toggle sidebar open/close
//   };

//   return (
//     <div className="flex flex-col h-screen">
//       {/* Header */}
//       <header className="bg-gradient-to-r from-blue-500 to-violet-500 text-white p-5 text-center">
//         <h1>CORS Sites Dashboard</h1>
//         <button
//           onClick={toggleView}
//           className="bg-white text-blue-500 font-semibold px-4 py-2 rounded shadow-md hover:bg-blue-200 transition-all"
//         >
//           Switch to {is3D ? "2D" : "3D"} View
//         </button>
//       </header>

//       {/* Main Content */}
//       <div className="flex flex-1">
//         {/* Map Section */}
//         <div className="flex-1 p-2.5 relative">
//           <CORSMap selectedLayer={selectedLayer} is3D={is3D} /> {/* Pass selected layer and is3D */}
//         </div>

//         {/* Sidebar */}
//         <div
//           className={`fixed top-0 right-0 h-full bg-gray-200 shadow-lg z-10 transition-transform duration-300 ${
//             isSidebarOpen ? "translate-x-0" : "translate-x-full"
//           } w-80`}
//         >
//           {/* Toggle Button */}
//           <button
//             onClick={toggleSidebar}
//             className="absolute top-1/2 left-[-25px] transform -translate-y-1/2 w-10 h-10 bg-gray-400 text-white flex items-center justify-center rounded-l-md cursor-pointer"
//             aria-expanded={isSidebarOpen}
//             aria-label="Toggle Sidebar"
//           >
//             {isSidebarOpen ? ">" : "<"}
//           </button>

//           {/* Sidebar Content */}
//           <div className="p-5 overflow-y-auto h-full">
//             <SiteStats setSelectedLayer={setSelectedLayer} /> {/* Set selected layer */}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ParentFeature;
