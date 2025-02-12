import React, { useEffect, useRef, useState } from "react";
import BasemapGallery from "@arcgis/core/widgets/BasemapGallery";
import Expand from "@arcgis/core/widgets/Expand";
import Legend from "@arcgis/core/widgets/Legend";
import Search from "@arcgis/core/widgets/Search";
import Home from "@arcgis/core/widgets/Home";
import Fullscreen from "@arcgis/core/widgets/Fullscreen";
import Print from "@arcgis/core/widgets/Print";
import Bookmarks from "@arcgis/core/widgets/Bookmarks";
import Locate from "@arcgis/core/widgets/Locate";
import Measurement from "@arcgis/core/widgets/Measurement";
import CoordinateConversion from "@arcgis/core/widgets/CoordinateConversion";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel"; // For selection tool
import Collection from "@arcgis/core/core/Collection";
import * as locator from "@arcgis/core/rest/locator";
import * as geometryEngine from '@arcgis/core/geometry/geometryEngine';
import * as geometryEngineAsync from '@arcgis/core/geometry/geometryEngineAsync';
// import eventBus from "../../eventBus";  // Import eventBus
import { useGeojson } from "../../context/GeojsonProvider"; // Import Context
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';
import "../../../src/Style.css"

const Widgets = ({ view,is3D,blobUrl }) => {
  const widgetsRef = useRef({
    fullscreen: false,
    search: false,
    basemapGallery: false,
    legend: false,
    home: false,
    bookmarks: false,
    locate: false,
    coordinateConversion: false,
    print: false,
    measurement: false,
    sketchViewModel: false,
  });
  const distanceRef = useRef(null); // ref for distance button
  const areaRef = useRef(null); // ref for area button
  const clearRef = useRef(null); // ref for clear button
  const radiusRef = useRef(null); // ref for radius button
  const selectRef = useRef(null); // ref for select button
  const polygonGraphicsLayer = useRef(null); // ref for polygon layer
  const markerLayer = useRef(null); // ref for marker layer
  const sketchViewModelRef = useRef(null); // ref for SketchViewModel
  const radiusDropdownRef = useRef(null); // ref for the radius dropdown
  const toolbarDivRef = useRef(null); // ref for the toolbar container
  const [selectedRadius, setSelectedRadius] = useState(0); // state for radius selection
  // const [geojsonLayer, setGeojsonLayer] = useState(null); // Track the latest GeoJSON layer
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const { geojsonLayer } = useGeojson(); // Get geojsonLayer from Context
  const viewRef = useRef(null);
  const [showBottomBar, setShowBottomBar] = useState(false);

  useEffect(() => {
    if (!view) return; // Ensure view is passed

    // Wait until the view is fully initialized

    view.when(() => {
      if (view.ui) {
        // Add widgets if they haven't been added yet
        // if (!widgetsRef.current.search) {
        //   const searchWidget = new Search({ view });
        //   view.ui.add(searchWidget, 'top-right');
        //   widgetsRef.current.search = searchWidget;
        // }
        

        if (!widgetsRef.current.basemapGallery) {
          const basemapGallery = new Expand({
            content: new BasemapGallery({ view }),
            view,
            expanded: false,
          });
          view.ui.add(basemapGallery, 'top-right');
          widgetsRef.current.basemapGallery = basemapGallery;
        }

        if (!widgetsRef.current.legend) {
          const legend = new Expand({
            content: new Legend({ view }),
            view,
            expanded: false,
          });
          view.ui.add(legend, 'bottom-left');
          widgetsRef.current.legend = legend;
        }

        if (!widgetsRef.current.home) {
          const homeWidget = new Home({ view });
          view.ui.add(homeWidget, 'top-left');
          widgetsRef.current.home = homeWidget;
        }

        if (!widgetsRef.current.fullscreen) {
          const fullscreenWidget = new Fullscreen({ view });
          view.ui.add(fullscreenWidget, 'top-right');
          widgetsRef.current.fullscreen = fullscreenWidget;
        }

        if(is3D){
        }else{
          if (!widgetsRef.current.bookmarks) {
            // Add Bookmarks
        if (!is3D && !widgetsRef.current.bookmarks) {
          
            // Step 1: Retrieve stored bookmarks from localStorage
            const storedBookmarks = localStorage.getItem("userBookmarks");
            let initialBookmarks = [];

            if (storedBookmarks) {
              try {
                initialBookmarks = JSON.parse(storedBookmarks);
                console.log("Retrieved bookmarks from localStorage:", initialBookmarks);
              } catch (error) {
                console.error("Error parsing bookmarks from localStorage:", error);
                initialBookmarks = [];
              }
            }

            // Step 2: Initialize the Bookmarks widget with stored bookmarks
            const bookmarksWidget = new Bookmarks({
              view,
              dragEnabled: true,
              visibleElements: {
                editBookmarkButton: true,
                addBookmarkButton: true,
              },
              bookmarks: new Collection(initialBookmarks),
            });

            // Add Expand widget for the bookmarks
            const bookmarksExpand = new Expand({
              view,
              content: bookmarksWidget,
              expanded: false,
              id: "bookmarks-widget",
            });

            // Step 3: Add the widget to the view's UI only if it's not already added
            if (!view.ui.find("bookmarks-widget")) {
              view.ui.add(bookmarksExpand, "top-right");
            }

            // Store a reference to the widget to prevent multiple initializations
            widgetsRef.current.bookmarks = bookmarksExpand;

            // Step 4: Handle changes to bookmarks (add, remove, edit)
            bookmarksWidget.bookmarks.on("change", (event) => {
              const updatedBookmarks = bookmarksWidget.bookmarks.toArray();

              try {
                localStorage.setItem("userBookmarks", JSON.stringify(updatedBookmarks));
                console.log("Bookmarks collection updated in localStorage:", updatedBookmarks);
                // setBookmarks(updatedBookmarks);  // Call your state update method
              } catch (error) {
                console.error("Error updating bookmarks in localStorage:", error);
              }
            });

            // Step 5: Handle bookmark selection and navigation
            bookmarksWidget.on("bookmark-select", (event) => {
              const selectedBookmark = event.bookmark;

              if (selectedBookmark && selectedBookmark.name) {
                console.log("Selected bookmark:", selectedBookmark.name);

                const locatorUrl = "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer";
                locator
                  .addressToLocations(locatorUrl, {
                    address: { SingleLine: selectedBookmark.name },
                    maxLocations: 1,
                  })
                  .then((results) => {
                    if (results.length > 0) {
                      const location = results[0].location;
                      view.goTo({ target: location, zoom: 12 });
                    } else {
                      console.error("Location not found for bookmark:", selectedBookmark.name);
                    }
                  })
                  .catch((error) => {
                    console.error("Error in geocoding bookmark name:", error);
                  });
              } else {
                console.warn("No valid bookmark selected");
              }
            });
        }
          }
          if (!widgetsRef.current.print) {
            const printWidget = new Print({
              view: view,
              printServiceUrl:
                "https://utility.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task",
            });
            const printExpand = new Expand({
              content: printWidget,
              view: view,
              expanded: false,
              expandIconClass: "esri-icon-printer",
              expandTooltip: "Print Map",
            });
            view.ui.add(printExpand, "top-right");
            widgetsRef.current.print = printExpand;
          }
  
          if (!widgetsRef.current.measurement) {
            const measurement = new Measurement({ view });
            view.ui.add(measurement, "bottom-right");
            widgetsRef.current.measurement = measurement;
          }
  
  
          // Toolbar functionality
          if (distanceRef.current) {
            distanceRef.current.onclick = function () {
              widgetsRef.current.measurement.activeTool = "distance";
            };
          }
  
          if (areaRef.current) {
            areaRef.current.onclick = function () {
              widgetsRef.current.measurement.activeTool = "area";
            };
          }
  
          if (clearRef.current) {
            clearRef.current.onclick = function () {
              widgetsRef.current.measurement.clear();
              polygonGraphicsLayer.current?.removeAll();
              view.graphics.removeAll();
              setSelectedFeatures([]); // Clear the selected features in the table
              markerLayer.current.removeAll();
            };
          }
  
          if (radiusRef.current) {
            radiusRef.current.onclick = function () {
              radiusDropdownRef.current.classList.toggle('hidden'); // Show/hide the dropdown
            };
            
          }
          
  
          if (selectRef.current) {
            selectRef.current.onclick = () => {
              view.graphics.removeAll(); // Clear previous graphics
              sketchViewModelRef.current?.create('rectangle');
            };
          }
        }
        if (!widgetsRef.current.locate) {
          const locateWidget = new Locate({ view });
          view.ui.add(locateWidget, 'top-left');
          widgetsRef.current.locate = locateWidget;
        }

        if (!widgetsRef.current.coordinateConversion) {
          const coordinateConversion = new CoordinateConversion({ view });
          view.ui.add(coordinateConversion, 'bottom-right');
          widgetsRef.current.coordinateConversion = coordinateConversion;
        }

      // const infoButton = document.createElement("button");
      // infoButton.innerText = "i";
      // infoButton.className = "info-button"; // Apply the CSS class   
      //   // Add an event listener for the button
      //   infoButton.onclick = () => {
      //     setShowBottomBar((prevState) => !prevState);
      //   };
      //   // Add the button to the view's UI
      //   view.ui.add(infoButton, "top-right");

      if (view.ui) {
        // Check if the info button already exists
        const existingInfoButton = document.getElementById("info-button");
        if (!existingInfoButton) {
          // Create the info button if it doesn't exist
          const infoButton = document.createElement("button");
          infoButton.id = "info-button"; // Assign an ID to the button
          infoButton.innerText = "i";
          infoButton.className = "info-button"; // Apply the CSS class
  
          // Add an event listener for the button
          infoButton.onclick = () => {
            setShowBottomBar((prevState) => !prevState);
          };
  
          // Add the button to the view's UI
          view.ui.add(infoButton, "top-right");
        }
      }

      

      }
    });

    // Cleanup on component unmount
    return () => {
      Object.keys(widgetsRef.current).forEach((key) => {
        const widget = widgetsRef.current[key];
        if (widget) {
          if (view.ui) {
            view.ui.remove(widget);
          }
          widget.destroy();
          widgetsRef.current[key] = null;
        }
      });
    };
  }, [view,blobUrl]);
  // To Handle rectangle selection
  useEffect(() => {
    if (!view || !geojsonLayer) return; // Ensure view and geojsonLayer are available
  
    polygonGraphicsLayer.current = new GraphicsLayer();
    view.map.add(polygonGraphicsLayer.current);
  
    // Ensure geojsonLayer is fully loaded before querying
    geojsonLayer.when(() => {
      console.log("✅ GeoJSON Layer is loaded:", geojsonLayer);
  
      sketchViewModelRef.current = new SketchViewModel({
        view,
        layer: polygonGraphicsLayer.current
      });
  
      // Handle rectangle selection
      sketchViewModelRef.current.on('create', async (event) => {
        if (event.state === 'complete') {
          const geometries = polygonGraphicsLayer.current.graphics.map(graphic => graphic.geometry);
  
          if (geometries.length === 0) {
            console.warn("⚠️ No geometries found in polygonGraphicsLayer.");
            return;
          }
  
          // Merge all selected geometries (same as your old code)
          const queryGeometry = await geometryEngineAsync.union(geometries.toArray());
  
          console.log('Merged Geometry:', queryGeometry);
  
          // Create query to find points within the rectangle
          const query = geojsonLayer.createQuery();
          query.geometry = queryGeometry;
          query.outFields = ['*']; // Fetch all attributes
          query.returnGeometry = true;
  
          try {
            const results = await geojsonLayer.queryFeatures(query);
            console.log("Query Results:", results.features);
  
            setSelectedFeatures(results.features);
          } catch (error) {
            console.error("Error querying features:", error);
          }
        }
      });
    });
  
    // return () => {
    //   view.map.remove(polygonGraphicsLayer.current);
    // };
  }, [view, geojsonLayer]);

  useEffect(() => {
    if (view) {
      viewRef.current = view; // ✅ Assign view to viewRef.current
    }
  }, [view]);

  useEffect(() => {
    const handleKeyPress = (event) => {
      const key = event.key.toLowerCase();
      if (!event.shiftKey) return; // Ensure Shift is pressed
  
      switch (key) {
        case 'm': // Toggle Basemap Gallery
          widgetsRef.current.basemapGallery.expanded = !widgetsRef.current.basemapGallery.expanded;
          break;
  
        case 'f': // Toggle Fullscreen
          widgetsRef.current.fullscreen.viewModel.toggle();
          break;
  
        case 'h': // Home widget
          widgetsRef.current.home.go();
          break;
  
        case 'p': // Toggle Print widget
          widgetsRef.current.print.expanded = !widgetsRef.current.print.expanded;
          break;
  
        case 'c': // Clear all measurements and graphics
          widgetsRef.current.measurement.clear();
          polygonGraphicsLayer.current.removeAll();
          setSelectedFeatures([]);
          markerLayer.current.removeAll();
          break;
  
        case 'b': // Toggle Bookmarks
          widgetsRef.current.bookmarks.expanded = !widgetsRef.current.bookmarks.expanded;
          break;
  
        case 'escape': // Clear all graphics
          widgetsRef.current.measurement.clear();
          view.graphics.removeAll();
          break;
  
        case '!': // Distance Measurement Tool
          widgetsRef.current.measurement.activeTool = 'distance';
          break;
  
        case '@': // Area Measurement Tool
          widgetsRef.current.measurement.activeTool = 'area';
          break;
  
        case '#': // Toggle Radius Dropdown
          if (radiusDropdownRef.current) {
            radiusDropdownRef.current.classList.toggle('hidden');
          }
          break;
  
        case '+': // Zoom in
          view.zoom += 1;
          break;
  
        case '-': // Zoom out
          view.zoom -= 1;
          break;
  
        default:
          break;
      }
    };
  
    window.addEventListener('keydown', handleKeyPress);
  
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [view]);
  

  // Radius measurement functionality
  useEffect(() => {
    if (!viewRef.current) return;

    const handleClick = (event) => {
      const lat = event.mapPoint.latitude.toFixed(2);
      const lon = event.mapPoint.longitude.toFixed(2);

      if (!radiusDropdownRef.current.classList.contains('hidden')) {
        const centerPoint = new Point({
          longitude: lon,
          latitude: lat
        });

        const circleGeometry = geometryEngine.geodesicBuffer(centerPoint, selectedRadius, "kilometers");

        const circleGraphic = new Graphic({
          geometry: circleGeometry,
          symbol: {
            type: "simple-fill",
            color: [0, 0, 255, 0.2],
            outline: {
              color: [0, 0, 255, 0.8],
              width: 2
            }
          }
        });

        viewRef.current.graphics.removeAll();
        viewRef.current.graphics.add(circleGraphic);
      }
    };

    const clickHandle = viewRef.current.on("click", handleClick);

    return () => {
      clickHandle.remove();
    };
  }, [selectedRadius]);
  
  

  return (
    <div>
      {!is3D && (
        <div
          ref={toolbarDivRef}
          id="toolbarDiv"
          className="esri-component esri-widget absolute top-44 left-[14px] z-10"
        >
          <button
            ref={distanceRef}
            className="esri-widget--button esri-interactive esri-icon-measure-line"
            title="Distance Measurement Tool"
          ></button>
          <button
            ref={areaRef}
            className="esri-widget--button esri-interactive esri-icon-measure-area"
            title="Area Measurement Tool"
          ></button>
          <button
            ref={radiusRef}
            className="esri-widget--button esri-interactive esri-icon-dial"
            title="Radius Measurement Tool"
          ></button>
          <button
            ref={selectRef}
            className="esri-widget--button esri-interactive esri-icon-checkbox-unchecked"
            title="Select by Rectangle"
          ></button>
          <div
            ref={radiusDropdownRef}
            className="esri-widget esri-interactive absolute top-8 left-[60px] z-10 bg-white shadow-md p-2 rounded hidden"
          >
            <label htmlFor="radius-select">Choose Radius:</label>
            <select
              id="radius-select"
              onChange={(e) => setSelectedRadius(Number(e.target.value))}
              value={selectedRadius}
            >
              <option value={0}>Choose km</option>
              <option value={50}>50 km</option>
              <option value={100}>100 km</option>
              <option value={200}>200 km</option>
              <option value={500}>500 km</option>
              <option value={1000}>1000 km</option>
            </select>
          </div>
          <button
            ref={clearRef}
            className="esri-widget--button esri-interactive esri-icon-trash"
            title="Clear Measurements"
          ></button>
        </div>
      )}
      {/* Feature Table */}
      <FeatureTable selectedFeatures={selectedFeatures} />
      {showBottomBar && (
      <div className="bottom-bar">
        <p><strong>Keyboard Shortcuts: shift +</strong></p>
           <div className="shortcuts-grid">
              <div><span className="key">B</span> Bookmark</div>
              <div><span className="key">C</span> Clear Measurement</div>
              <div><span className="key">F</span> Full Screen</div>
              <div><span className="key">H</span> Home</div>
              <div><span className="key">M</span> Basemap Gallery</div>
              <div><span className="key">P</span> Print</div>
              <div><span className="key">+</span> Zoom In</div>
              <div><span className="key">-</span> Zoom Out</div>
           </div>
        </div>
      )}
      {/* Share Button with custom icon */}
      {/* <button
          onClick={() => {
            // Debugging log to check state change
            console.log('Button clicked! Toggling share panel visibility.');
            setIsSharePanelVisible(!isSharePanelVisible);
          }}
          className="absolute top-[280px] left-6 p-2 bg-white text-white shadow-lg"
        >
          <img
            src="https://cdn-icons-png.flaticon.com/512/2958/2958791.png"
            alt="Share Icon"
            className="w-4 h-4"
          />
        </button> */}
    </div>
  );             
};
// 📌 FeatureTable Component
const FeatureTable = ({ selectedFeatures }) => {
  if (!selectedFeatures || selectedFeatures.length === 0) {
    return <p className="text-gray-500 text-center mt-4">No features selected.</p>;
  }

  const fieldNames = Object.keys(selectedFeatures[0].attributes || {});
  
  return (
    <div className="overflow-x-auto mt-4 border rounded-lg shadow-lg p-4 bg-white">
      <h2 className="text-lg font-semibold mb-2">Selected Features</h2>
      <table className="min-w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            {fieldNames.map((field) => (
              <th key={field} className="py-2 px-4 border-b border-gray-300 text-left">
                {field}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {selectedFeatures.map((feature, index) => (
            <tr key={index} className="border-b border-gray-200">
              {fieldNames.map((field) => (
                <td key={field} className="py-2 px-4 border-r border-gray-300">
                  {feature.attributes[field] || "-"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};



export default Widgets;



// import React, { useEffect, useRef, useState } from "react";
// import BasemapGallery from "@arcgis/core/widgets/BasemapGallery";
// import Expand from "@arcgis/core/widgets/Expand";
// import Legend from "@arcgis/core/widgets/Legend";
// import Search from "@arcgis/core/widgets/Search";
// import Home from "@arcgis/core/widgets/Home";
// import Fullscreen from "@arcgis/core/widgets/Fullscreen";
// import Print from "@arcgis/core/widgets/Print";
// import Bookmarks from "@arcgis/core/widgets/Bookmarks";
// import Locate from "@arcgis/core/widgets/Locate";
// import Measurement from "@arcgis/core/widgets/Measurement";
// import CoordinateConversion from "@arcgis/core/widgets/CoordinateConversion";
// import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
// import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel"; // For selection tool
// import Collection from "@arcgis/core/core/Collection";
// import * as locator from "@arcgis/core/rest/locator";
// import * as geometryEngine from '@arcgis/core/geometry/geometryEngine';
// import * as geometryEngineAsync from '@arcgis/core/geometry/geometryEngineAsync';
// // import eventBus from "../../eventBus";  // Import eventBus
// import { useGeojson } from "../../context/GeojsonProvider"; // Import Context
// import Graphic from '@arcgis/core/Graphic';
// import Point from '@arcgis/core/geometry/Point';
// import "D:/Captain/05-02-2025/src/Style.css"

// const Widgets = ({ view,is3D }) => {
//   const widgetsRef = useRef({
//     fullscreen: false,
//     search: false,
//     basemapGallery: false,
//     legend: false,
//     home: false,
//     bookmarks: false,
//     locate: false,
//     coordinateConversion: false,
//     print: false,
//     measurement: false,
//     sketchViewModel: false,
//   });
//   const distanceRef = useRef(null); // ref for distance button
//   const areaRef = useRef(null); // ref for area button
//   const clearRef = useRef(null); // ref for clear button
//   const radiusRef = useRef(null); // ref for radius button
//   const selectRef = useRef(null); // ref for select button
//   const polygonGraphicsLayer = useRef(null); // ref for polygon layer
//   const markerLayer = useRef(null); // ref for marker layer
//   const sketchViewModelRef = useRef(null); // ref for SketchViewModel
//   const radiusDropdownRef = useRef(null); // ref for the radius dropdown
//   const toolbarDivRef = useRef(null); // ref for the toolbar container
//   const [selectedRadius, setSelectedRadius] = useState(0); // state for radius selection
//   // const [geojsonLayer, setGeojsonLayer] = useState(null); // Track the latest GeoJSON layer
//   const [selectedFeatures, setSelectedFeatures] = useState([]);
//   const { geojsonLayer } = useGeojson(); // Get geojsonLayer from Context
//   const viewRef = useRef(null);
//   const [showBottomBar, setShowBottomBar] = useState(false);

//   useEffect(() => {
//     if (!view) return; // Ensure view is passed

//     // Wait until the view is fully initialized

//     view.when(() => {
//       if (view.ui) {
//         // Add widgets if they haven't been added yet
//         // if (!widgetsRef.current.search) {
//         //   const searchWidget = new Search({ view });
//         //   view.ui.add(searchWidget, 'top-right');
//         //   widgetsRef.current.search = searchWidget;
//         // }
        

//         if (!widgetsRef.current.basemapGallery) {
//           const basemapGallery = new Expand({
//             content: new BasemapGallery({ view }),
//             view,
//             expanded: false,
//           });
//           view.ui.add(basemapGallery, 'top-right');
//           widgetsRef.current.basemapGallery = basemapGallery;
//         }

//         if (!widgetsRef.current.legend) {
//           const legend = new Expand({
//             content: new Legend({ view }),
//             view,
//             expanded: false,
//           });
//           view.ui.add(legend, 'bottom-left');
//           widgetsRef.current.legend = legend;
//         }

//         if (!widgetsRef.current.home) {
//           const homeWidget = new Home({ view });
//           view.ui.add(homeWidget, 'top-left');
//           widgetsRef.current.home = homeWidget;
//         }

//         if (!widgetsRef.current.fullscreen) {
//           const fullscreenWidget = new Fullscreen({ view });
//           view.ui.add(fullscreenWidget, 'top-right');
//           widgetsRef.current.fullscreen = fullscreenWidget;
//         }

//         if(is3D){
//         }else{
//           if (!widgetsRef.current.bookmarks) {
//             // Add Bookmarks
//         if (!is3D && !widgetsRef.current.bookmarks) {
          
//             // Step 1: Retrieve stored bookmarks from localStorage
//             const storedBookmarks = localStorage.getItem("userBookmarks");
//             let initialBookmarks = [];

//             if (storedBookmarks) {
//               try {
//                 initialBookmarks = JSON.parse(storedBookmarks);
//                 console.log("Retrieved bookmarks from localStorage:", initialBookmarks);
//               } catch (error) {
//                 console.error("Error parsing bookmarks from localStorage:", error);
//                 initialBookmarks = [];
//               }
//             }

//             // Step 2: Initialize the Bookmarks widget with stored bookmarks
//             const bookmarksWidget = new Bookmarks({
//               view,
//               dragEnabled: true,
//               visibleElements: {
//                 editBookmarkButton: true,
//                 addBookmarkButton: true,
//               },
//               bookmarks: new Collection(initialBookmarks),
//             });

//             // Add Expand widget for the bookmarks
//             const bookmarksExpand = new Expand({
//               view,
//               content: bookmarksWidget,
//               expanded: false,
//               id: "bookmarks-widget",
//             });

//             // Step 3: Add the widget to the view's UI only if it's not already added
//             if (!view.ui.find("bookmarks-widget")) {
//               view.ui.add(bookmarksExpand, "top-right");
//             }

//             // Store a reference to the widget to prevent multiple initializations
//             widgetsRef.current.bookmarks = bookmarksExpand;

//             // Step 4: Handle changes to bookmarks (add, remove, edit)
//             bookmarksWidget.bookmarks.on("change", (event) => {
//               const updatedBookmarks = bookmarksWidget.bookmarks.toArray();

//               try {
//                 localStorage.setItem("userBookmarks", JSON.stringify(updatedBookmarks));
//                 console.log("Bookmarks collection updated in localStorage:", updatedBookmarks);
//                 // setBookmarks(updatedBookmarks);  // Call your state update method
//               } catch (error) {
//                 console.error("Error updating bookmarks in localStorage:", error);
//               }
//             });

//             // Step 5: Handle bookmark selection and navigation
//             bookmarksWidget.on("bookmark-select", (event) => {
//               const selectedBookmark = event.bookmark;

//               if (selectedBookmark && selectedBookmark.name) {
//                 console.log("Selected bookmark:", selectedBookmark.name);

//                 const locatorUrl = "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer";
//                 locator
//                   .addressToLocations(locatorUrl, {
//                     address: { SingleLine: selectedBookmark.name },
//                     maxLocations: 1,
//                   })
//                   .then((results) => {
//                     if (results.length > 0) {
//                       const location = results[0].location;
//                       view.goTo({ target: location, zoom: 12 });
//                     } else {
//                       console.error("Location not found for bookmark:", selectedBookmark.name);
//                     }
//                   })
//                   .catch((error) => {
//                     console.error("Error in geocoding bookmark name:", error);
//                   });
//               } else {
//                 console.warn("No valid bookmark selected");
//               }
//             });
//         }
//           }
//           if (!widgetsRef.current.print) {
//             const printWidget = new Print({
//               view: view,
//               printServiceUrl:
//                 "https://utility.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task",
//             });
//             const printExpand = new Expand({
//               content: printWidget,
//               view: view,
//               expanded: false,
//               expandIconClass: "esri-icon-printer",
//               expandTooltip: "Print Map",
//             });
//             view.ui.add(printExpand, "top-right");
//             widgetsRef.current.print = printExpand;
//           }
  
//           if (!widgetsRef.current.measurement) {
//             const measurement = new Measurement({ view });
//             view.ui.add(measurement, "bottom-right");
//             widgetsRef.current.measurement = measurement;
//           }
  
  
//           // Toolbar functionality
//           if (distanceRef.current) {
//             distanceRef.current.onclick = function () {
//               widgetsRef.current.measurement.activeTool = "distance";
//             };
//           }
  
//           if (areaRef.current) {
//             areaRef.current.onclick = function () {
//               widgetsRef.current.measurement.activeTool = "area";
//             };
//           }
  
//           if (clearRef.current) {
//             clearRef.current.onclick = function () {
//               widgetsRef.current.measurement.clear();
//               polygonGraphicsLayer.current?.removeAll();
//               view.graphics.removeAll();
//               markerLayer.current.removeAll();
//               setSelectedFeatures([]); // Clear the selected features in the table
//             };
//           }
  
//           if (radiusRef.current) {
//             radiusRef.current.onclick = function () {
//               radiusDropdownRef.current.classList.toggle('hidden'); // Show/hide the dropdown
//             };
            
//           }
          
  
//           if (selectRef.current) {
//             selectRef.current.onclick = () => {
//               view.graphics.removeAll(); // Clear previous graphics
//               sketchViewModelRef.current?.create('rectangle');
//             };
//           }
//         }
//         if (!widgetsRef.current.locate) {
//           const locateWidget = new Locate({ view });
//           view.ui.add(locateWidget, 'top-left');
//           widgetsRef.current.locate = locateWidget;
//         }

//         if (!widgetsRef.current.coordinateConversion) {
//           const coordinateConversion = new CoordinateConversion({ view });
//           view.ui.add(coordinateConversion, 'bottom-right');
//           widgetsRef.current.coordinateConversion = coordinateConversion;
//         }

//         const infoButton = document.createElement("button");
//       infoButton.innerText = "i";
//       infoButton.className = "info-button"; // Apply the CSS class   
//         // Add an event listener for the button
//         infoButton.onclick = () => {
//           setShowBottomBar((prevState) => !prevState);
//         };
//         // Add the button to the view's UI
//         view.ui.add(infoButton, "top-right");


//       }
//     });

//     // Cleanup on component unmount
//     return () => {
//       Object.keys(widgetsRef.current).forEach((key) => {
//         const widget = widgetsRef.current[key];
//         if (widget) {
//           if (view.ui) {
//             view.ui.remove(widget);
//           }
//           widget.destroy();
//           widgetsRef.current[key] = null;
//         }
//       });
//     };
//   }, [view]);
//   // To Handle rectangle selection
//   useEffect(() => {
//     if (!view || !geojsonLayer) return; // Ensure view and geojsonLayer are available
  
//     polygonGraphicsLayer.current = new GraphicsLayer();
//     view.map.add(polygonGraphicsLayer.current);
  
//     // Ensure geojsonLayer is fully loaded before querying
//     geojsonLayer.when(() => {
//       console.log("✅ GeoJSON Layer is loaded:", geojsonLayer);
  
//       sketchViewModelRef.current = new SketchViewModel({
//         view,
//         layer: polygonGraphicsLayer.current
//       });
  
//       // Handle rectangle selection
//       sketchViewModelRef.current.on('create', async (event) => {
//         if (event.state === 'complete') {
//           const geometries = polygonGraphicsLayer.current.graphics.map(graphic => graphic.geometry);
  
//           if (geometries.length === 0) {
//             console.warn("⚠️ No geometries found in polygonGraphicsLayer.");
//             return;
//           }
  
//           // Merge all selected geometries (same as your old code)
//           const queryGeometry = await geometryEngineAsync.union(geometries.toArray());
  
//           console.log('Merged Geometry:', queryGeometry);
  
//           // Create query to find points within the rectangle
//           const query = geojsonLayer.createQuery();
//           query.geometry = queryGeometry;
//           query.outFields = ['*']; // Fetch all attributes
//           query.returnGeometry = true;
  
//           try {
//             const results = await geojsonLayer.queryFeatures(query);
//             console.log("Query Results:", results.features);
  
//             setSelectedFeatures(results.features);
//           } catch (error) {
//             console.error("Error querying features:", error);
//           }
//         }
//       });
//     });
  
//     // return () => {
//     //   view.map.remove(polygonGraphicsLayer.current);
//     // };
//   }, [view, geojsonLayer]);

//   useEffect(() => {
//     if (view) {
//       viewRef.current = view; // ✅ Assign view to viewRef.current
//     }
//   }, [view]);

//   useEffect(() => {
//     const handleKeyPress = (event) => {
//       const key = event.key.toLowerCase();
//       if (!event.shiftKey) return; // Ensure Shift is pressed
  
//       switch (key) {
//         case 'm': // Toggle Basemap Gallery
//           widgetsRef.current.basemapGallery.expanded = !widgetsRef.current.basemapGallery.expanded;
//           break;
  
//         case 'f': // Toggle Fullscreen
//           widgetsRef.current.fullscreen.viewModel.toggle();
//           break;
  
//         case 'h': // Home widget
//           widgetsRef.current.home.go();
//           break;
  
//         case 'p': // Toggle Print widget
//           widgetsRef.current.print.expanded = !widgetsRef.current.print.expanded;
//           break;
  
//         case 'c': // Clear all measurements and graphics
//           widgetsRef.current.measurement.clear();
//           polygonGraphicsLayer.current.removeAll();
//           markerLayer.current.removeAll();
//           setSelectedFeatures([]);
//           break;
  
//         case 'b': // Toggle Bookmarks
//           widgetsRef.current.bookmarks.expanded = !widgetsRef.current.bookmarks.expanded;
//           break;
  
//         case 'escape': // Clear all graphics
//           widgetsRef.current.measurement.clear();
//           view.graphics.removeAll();
//           break;
  
//         case '!': // Distance Measurement Tool
//           widgetsRef.current.measurement.activeTool = 'distance';
//           break;
  
//         case '@': // Area Measurement Tool
//           widgetsRef.current.measurement.activeTool = 'area';
//           break;
  
//         case '#': // Toggle Radius Dropdown
//           if (radiusDropdownRef.current) {
//             radiusDropdownRef.current.classList.toggle('hidden');
//           }
//           break;
  
//         case '+': // Zoom in
//           view.zoom += 1;
//           break;
  
//         case '-': // Zoom out
//           view.zoom -= 1;
//           break;
  
//         default:
//           break;
//       }
//     };
  
//     window.addEventListener('keydown', handleKeyPress);
  
//     return () => {
//       window.removeEventListener('keydown', handleKeyPress);
//     };
//   }, [view]);
  

//   // Radius measurement functionality
//   useEffect(() => {
//     if (!viewRef.current) return;

//     const handleClick = (event) => {
//       const lat = event.mapPoint.latitude.toFixed(2);
//       const lon = event.mapPoint.longitude.toFixed(2);

//       if (!radiusDropdownRef.current.classList.contains('hidden')) {
//         const centerPoint = new Point({
//           longitude: lon,
//           latitude: lat
//         });

//         const circleGeometry = geometryEngine.geodesicBuffer(centerPoint, selectedRadius, "kilometers");

//         const circleGraphic = new Graphic({
//           geometry: circleGeometry,
//           symbol: {
//             type: "simple-fill",
//             color: [0, 0, 255, 0.2],
//             outline: {
//               color: [0, 0, 255, 0.8],
//               width: 2
//             }
//           }
//         });

//         viewRef.current.graphics.removeAll();
//         viewRef.current.graphics.add(circleGraphic);
//       }
//     };

//     const clickHandle = viewRef.current.on("click", handleClick);

//     return () => {
//       clickHandle.remove();
//     };
//   }, [selectedRadius]);
  
  

//   return (
//     <div>
//       {!is3D && (
//         <div
//           ref={toolbarDivRef}
//           id="toolbarDiv"
//           className="esri-component esri-widget absolute top-44 left-[14px] z-10"
//         >
//           <button
//             ref={distanceRef}
//             className="esri-widget--button esri-interactive esri-icon-measure-line"
//             title="Distance Measurement Tool"
//           ></button>
//           <button
//             ref={areaRef}
//             className="esri-widget--button esri-interactive esri-icon-measure-area"
//             title="Area Measurement Tool"
//           ></button>
//           <button
//             ref={radiusRef}
//             className="esri-widget--button esri-interactive esri-icon-dial"
//             title="Radius Measurement Tool"
//           ></button>
//           <button
//             ref={selectRef}
//             className="esri-widget--button esri-interactive esri-icon-checkbox-unchecked"
//             title="Select by Rectangle"
//           ></button>
//           <div
//             ref={radiusDropdownRef}
//             className="esri-widget esri-interactive absolute top-8 left-[60px] z-10 bg-white shadow-md p-2 rounded hidden"
//           >
//             <label htmlFor="radius-select">Choose Radius:</label>
//             <select
//               id="radius-select"
//               onChange={(e) => setSelectedRadius(Number(e.target.value))}
//               value={selectedRadius}
//             >
//               <option value={0}>Choose km</option>
//               <option value={50}>50 km</option>
//               <option value={100}>100 km</option>
//               <option value={200}>200 km</option>
//               <option value={500}>500 km</option>
//               <option value={1000}>1000 km</option>
//             </select>
//           </div>
//           <button
//             ref={clearRef}
//             className="esri-widget--button esri-interactive esri-icon-trash"
//             title="Clear Measurements"
//           ></button>
//         </div>
//       )}
//       {/* Feature Table */}
//       <FeatureTable selectedFeatures={selectedFeatures} />
//       {showBottomBar && (
//       <div className="bottom-bar">
//         <p><strong>Keyboard Shortcuts: shift +</strong></p>
//            <div className="shortcuts-grid">
//               <div><span className="key">B</span> Bookmark</div>
//               <div><span className="key">C</span> Clear Measurement</div>
//               <div><span className="key">F</span> Full Screen</div>
//               <div><span className="key">H</span> Home</div>
//               <div><span className="key">M</span> Basemap Gallery</div>
//               <div><span className="key">P</span> Print</div>
//               <div><span className="key">+</span> Zoom In</div>
//               <div><span className="key">-</span> Zoom Out</div>
//            </div>
//         </div>
//       )}
//       {/* Share Button with custom icon */}
//       {/* <button
//           onClick={() => {
//             // Debugging log to check state change
//             console.log('Button clicked! Toggling share panel visibility.');
//             setIsSharePanelVisible(!isSharePanelVisible);
//           }}
//           className="absolute top-[280px] left-6 p-2 bg-white text-white shadow-lg"
//         >
//           <img
//             src="https://cdn-icons-png.flaticon.com/512/2958/2958791.png"
//             alt="Share Icon"
//             className="w-4 h-4"
//           />
//         </button> */}
//     </div>
//   );             
// };
// // 📌 FeatureTable Component
// const FeatureTable = ({ selectedFeatures }) => {
//   if (!selectedFeatures || selectedFeatures.length === 0) {
//     return <p className="text-gray-500 text-center mt-4">No features selected.</p>;
//   }

//   const fieldNames = Object.keys(selectedFeatures[0].attributes || {});
  
//   return (
//     <div className="overflow-x-auto mt-4 border rounded-lg shadow-lg p-4 bg-white">
//       <h2 className="text-lg font-semibold mb-2">Selected Features</h2>
//       <table className="min-w-full border border-gray-300">
//         <thead>
//           <tr className="bg-gray-200">
//             {fieldNames.map((field) => (
//               <th key={field} className="py-2 px-4 border-b border-gray-300 text-left">
//                 {field}
//               </th>
//             ))}
//           </tr>
//         </thead>
//         <tbody>
//           {selectedFeatures.map((feature, index) => (
//             <tr key={index} className="border-b border-gray-200">
//               {fieldNames.map((field) => (
//                 <td key={field} className="py-2 px-4 border-r border-gray-300">
//                   {feature.attributes[field] || "-"}
//                 </td>
//               ))}
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };



// export default Widgets;


// const storedBookmarks = localStorage.getItem("userBookmarks");
          // let initialBookmarks = [];

          // if (storedBookmarks) {
          //   try {
          //     initialBookmarks = JSON.parse(storedBookmarks);
          //   } catch (error) {
          //     console.error("Error parsing bookmarks from localStorage:", error);
          //   }
          // }

          // const bookmarksWidget = new Bookmarks({
          //   view,
          //   dragEnabled: true,
          //   visibleElements: {
          //     editBookmarkButton: true,
          //     addBookmarkButton: true,
          //   },
          //   bookmarks: new Collection(initialBookmarks),
          // });

          // const bookmarksExpand = new Expand({
          //   view,
          //   content: bookmarksWidget,
          //   expanded: false,
          // });

          // view.ui.add(bookmarksExpand, "top-right");
          // widgetsRef.current.bookmarks = bookmarksWidget;

          // bookmarksWidget.bookmarks.on("change", (event) => {
          //   const updatedBookmarks = bookmarksWidget.bookmarks.toArray();
          //   localStorage.setItem("userBookmarks", JSON.stringify(updatedBookmarks));
          // });

          // bookmarksWidget.on("bookmark-select", (event) => {
          //   const selectedBookmark = event.bookmark;
          //   if (selectedBookmark?.extent) {
          //     view.goTo(selectedBookmark.extent);
          //   } else if (selectedBookmark?.name) {
          //     locator
          //       .addressToLocations("https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer", {
          //         address: { SingleLine: selectedBookmark.name },
          //         maxLocations: 1,
          //       })
          //       .then((results) => {
          //         if (results.length > 0) {
          //           view.goTo({ target: results[0].location, zoom: 12 });
          //         }
          //       });
          //   }
          // });
          // // Step 1: Retrieve stored bookmarks from localStorage
          // const storedBookmarks = localStorage.getItem('userBookmarks');
          // let initialBookmarks = [];

          // if (storedBookmarks) {
          //   try {
          //     initialBookmarks = JSON.parse(storedBookmarks);
          //     console.log('Retrieved bookmarks from localStorage:', initialBookmarks);
          //   } catch (error) {
          //     console.error('Error parsing bookmarks from localStorage:', error);
          //     initialBookmarks = [];
          //   }
          // }
          

          // // Step 2: Initialize the Bookmarks widget with stored bookmarks
          // const bookmarksWidget = new Bookmarks({
          //   view: viewRef.current,
          //   dragEnabled: true,  // Enable drag functionality

          //   // Control visibility of bookmark buttons
          //   visibleElements: {
          //     editBookmarkButton: true,
          //     addBookmarkButton: true
          //   },
          //   bookmarks: new Collection(initialBookmarks)  // No need to check initialBookmarks length
          // });

          // const bookmarksExpand = new Expand({
          //   view: viewRef.current,
          //   content: bookmarksWidget,
          //   expanded: false
          // });

          // view.ui.add(bookmarksExpand, 'top-right');

          // // Step 3: Handle all changes (bookmark create, edit, and delete) using the 'change' event
          // bookmarksWidget.bookmarks.on('change', (event) => {
          //   const updatedBookmarks = bookmarksWidget.bookmarks.toArray();

          //   // Handle added bookmarks
          //   if (event.added && event.added.length > 0) {
          //     console.log('Bookmark(s) added:', event.added);
          //   }

          //   // Handle removed bookmarks
          //   if (event.removed && event.removed.length > 0) {
          //     console.log('Bookmark(s) removed:', event.removed);
          //   }

          //   // Update localStorage and application state after any change
          //   try {
          //     localStorage.setItem('userBookmarks', JSON.stringify(updatedBookmarks));
          //     console.log('Bookmarks collection updated in localStorage:', updatedBookmarks);
          //     setBookmarks(updatedBookmarks);  // Call your state update method
          //   } catch (error) {
          //     console.error('Error updating bookmarks in localStorage:', error);
          //   }
          // });

          // // Step 4: Handle bookmark selection and navigation
          // bookmarksWidget.on('bookmark-select', (event) => {
          //   console.log("Bookmark selected event triggered");

          //   const selectedBookmark = event.bookmark;
          //   if (selectedBookmark && selectedBookmark.name) {
          //     console.log("Selected bookmark:", selectedBookmark.name);

          //     // Geocode the place name and navigate
          //     const locatorUrl = "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer";
          //     locator.addressToLocations(locatorUrl, {
          //       address: { SingleLine: selectedBookmark.name },
          //       maxLocations: 1
          //     }).then((results) => {
          //       if (results.length > 0) {
          //         const location = results[0].location;
          //         view.goTo({
          //           target: location,
          //           zoom: 12
          //         });
          //       } else {
          //         console.error("Location not found for bookmark:", selectedBookmark.name);
          //       }
          //     }).catch((error) => {
          //       console.error("Error in geocoding bookmark name:", error);
          //     });
          //   } else {
          //     console.warn("No valid bookmark selected");
          //   }
          // });