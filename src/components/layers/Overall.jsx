// import React, { useState,useEffect } from 'react';
// import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer';
// import esriConfig from '@arcgis/core/config';
// import sendJsonData from '../../apiService';
// import BgLoader from '../bg_loader';
// import { useGeojson } from "../../context/GeojsonProvider"; // Import Context
// import moment from 'moment-timezone'; // Import moment-timezone for date manipulation

// const Overall = ({ onLayerReady,symbolType,is3D,selectedDate}) => {
//   const { setGeojsonLayer } = useGeojson(); // Get setter from Context
//   const[bg_loader,setBgLoader]=useState(true);
//   useEffect(() => {
//     console.log('Overall',selectedDate);
//     const formattedDate = moment(selectedDate).tz('America/Los_Angeles').format('YYYY-MM-DD');
//     console.log('Formatted Date:', formattedDate);
    
//     const date = selectedDate ? new Date(formattedDate) : new Date("2024-04-14");
//     const input_data = {
//       date: date,
//       options: 'Over All Site Info', // Adjust options as needed
//     };

//     console.log("Pass",symbolType)
//     console.log(is3D)

//     setBgLoader(true);

//     sendJsonData(input_data)
//       .then((response) => {
//         const fetchedData = response.data;

//         // Set API Key
//         esriConfig.apiKey = 'AAPTxy8BH1VEsoebNVZXo8HurAU2wRtTCz35rS0IvyV5k0_FmOjKifjQ4MXaetOWAPxQ99ta0HCHYBSsLmJ-RxrEVoyLsT6hCItuii1Wq0Ctiu8ofOMIIcBYiR8_N3HQmOSC4MrerZZW_MiUovETiVP-I6qSZhn0k8qO1SF990cDX26ydD9ug32faqQlUjvebO0WHRrwPN3h0mdKEKlKMAZE8hjWCQHcEG7BM34DXJKiL7A.AT1_B2uSZ31B'; // Replace with your Esri API Key

//         const blob = new Blob([JSON.stringify(fetchedData)], {
//           type: 'application/json',
//         });
//         const url = URL.createObjectURL(blob);

//         const template = {
//           title: 'Stacov Site Info',
//           content: `<b>Site ID:</b> {SITEID}<br>
//                     <b>Description:</b> {Description}<br>
//                     <b>DOMES:</b> {DOMES}<br>`,
//         };
        

//         {is3D && symbolType === "object" ?
//           console.log("3D"):console.log("2D")
//         }

//         const renderer = is3D && symbolType === "object" 
//   ? {
//       type: 'unique-value',
//       field: 'STATUS',
//       uniqueValueInfos: [
//         {
//           value: 'Present',
//           symbol: {
//             type: 'point-3d', // 3D symbol type
//             symbolLayers: [
//               {
//                 type: 'object', // Use object layer for 3D symbols
//                 resource: { primitive: 'cylinder' }, // 3D primitive shape
//                 material: { color: 'blue' }, // Color of the shape
//                 width: 8000, // Width of the 3D shape
//                 height: 80000, // Height of the 3D shape
//               },
//             ],
//           },
//           label: `Present (${fetchedData.status_count})`,
//         },
//         {
//           value: 'Not Present',
//           symbol: {
//             type: 'point-3d', // 3D symbol type
//             symbolLayers: [
//               {
//                 type: 'object', // Use object layer for 3D symbols
//                 resource: { primitive: 'cylinder' }, // 3D primitive shape
//                 material: { color: 'red' }, // Color of the shape
//                 width: 8000, // Width of the 3D shape
//                 height: 80000, // Height of the 3D shape
//               },
//             ],
//           },
//           label: `Not Present (${fetchedData.features.length - fetchedData.status_count})`,
//         },
//       ],
//     }
//   : {
//       type: 'unique-value',
//       field: 'STATUS',
//       uniqueValueInfos: [
//         {
//           value: 'Present',
//           symbol: {
//             type: 'simple-marker',
//             color: 'blue',
//             size: '8px',
//             outline: {
//               color: 'white',
//               width: 1,
//             },
//           },
//           label: `Present (${fetchedData.status_count})`,
//         },
//         {
//           value: 'Not Present',
//           symbol: {
//             type: 'simple-marker',
//             color: 'red',
//             size: '8px',
//             outline: {
//               color: 'white',
//               width: 1,
//             },
//           },
//           label: `Not Present (${fetchedData.features.length - fetchedData.status_count})`,
//         },
//       ],
//     };

       
//         // Create GeoJSONLayer
//         const geojsonLayer = new GeoJSONLayer({
//           url: url,
//           popupTemplate: template,
//           renderer: renderer,
//           orderBy: {
//             field: 'STATUS',
//           },
//         });
//         // Emit when layer is ready
//         setGeojsonLayer(geojsonLayer);
//         // Notify parent component that the layer is ready
//         if (onLayerReady) {
//           onLayerReady(geojsonLayer);
//         }
//         // setBgLoader(false);
//         setTimeout(() => {
//           setBgLoader(false);
//         }, 3000); // 3000 ms = 3 seconds
//       })
//       .catch((error) => {
//         console.error('There was an error fetching STACOV data!', error);
//         alert("Check the date and layer");
//       });
//       // setBgLoader(false);
//   }, [onLayerReady,symbolType]);

//   return bg_loader ? <BgLoader /> : null; // This component does not render anything
// };

// export default Overall;



import React, { useState, useEffect } from 'react';
import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer';
import esriConfig from '@arcgis/core/config';
import sendJsonData from '../../apiService';
import BgLoader from '../bg_loader';
import { useGeojson } from "../../context/GeojsonProvider"; // Import Context
import moment from 'moment-timezone'; // Import moment-timezone for date manipulation

const Overall = ({ onLayerReady, symbolType, is3D,selectedDate,setBlobUrl }) => {
  const { setGeojsonLayer } = useGeojson(); // Get setter from Context
  const [bg_loader, setBgLoader] = useState(true);
  const [fetchedData, setFetchedData] = useState(null); // Store fetched data here
  // const [selectedDate, setSelectedDate] = useState('2024-04-14'); // Default date state

  // Function to handle date change
  const handleDateChange = (e) => {
    setSelectedDate(e.target.value); // Update the selected date when the user changes the input
  };

  // Fetch data based on selectedDate
  useEffect(() => {
    console.log('Overall',selectedDate);
    const formattedDate = moment(selectedDate).tz('America/Los_Angeles').format('YYYY-MM-DD');
    console.log('Formatted Date:', formattedDate);
    
    const date = selectedDate ? new Date(formattedDate) : new Date("2024-04-14");
    const input_data = {
      date: date,
      options: 'Over All Site Info', // Adjust options as needed
    };

    console.log("Pass", symbolType);
    console.log(is3D);
    

    setBgLoader(true); // Set loading true when starting the fetch
    setBlobUrl(null);

    sendJsonData(input_data)
      .then((response) => {
        const data = response.data;
        setFetchedData(data); // Store the fetched data in state

        // Set API Key
        esriConfig.apiKey = 'AAPTxy8BH1VEsoebNVZXo8HurAU2wRtTCz35rS0IvyV5k0_FmOjKifjQ4MXaetOWAPxQ99ta0HCHYBSsLmJ-RxrEVoyLsT6hCItuii1Wq0Ctiu8ofOMIIcBYiR8_N3HQmOSC4MrerZZW_MiUovETiVP-I6qSZhn0k8qO1SF990cDX26ydD9ug32faqQlUjvebO0WHRrwPN3h0mdKEKlKMAZE8hjWCQHcEG7BM34DXJKiL7A.AT1_B2uSZ31B'; // Replace with your Esri API Key

        // Create a Blob from the fetched data and generate a URL
        const blob = new Blob([JSON.stringify(data)], {
          type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        
        setBlobUrl(url);
        // Set the GeoJSON URL and update the state
        setFetchedData((prevData) => ({ ...prevData, geoJsonUrl: url }));

        setTimeout(() => {
          setBgLoader(false); // Stop loader after data is fetched
        }, 3000); // 3000 ms = 3 seconds
      })
      .catch((error) => {
        console.error('There was an error fetching STACOV data!', error);
      });
  }, [selectedDate]); // Add selectedDate to the dependency array

  // Load GeoJSON Layer whenever symbolType, is3D or fetchedData changes
  useEffect(() => {
    if (!fetchedData || !fetchedData.geoJsonUrl) return; // Only proceed if data and URL are available

    const { geoJsonUrl } = fetchedData;
    const template = {
      title: 'Stacov Site Info',
      content: `<b>Site ID:</b> {SITEID}<br>
                <b>Description:</b> {Description}<br>
                <b>DOMES:</b> {DOMES}<br>`,
    };

    // Renderer logic for 3D vs 2D
    const renderer = is3D && symbolType === 'object'
      ? {
          type: 'unique-value',
          field: 'STATUS',
          uniqueValueInfos: [
            {
              value: 'Present',
              symbol: {
                type: 'point-3d', // 3D symbol type
                symbolLayers: [
                  {
                    type: 'object', // Use object layer for 3D symbols
                    resource: { primitive: 'cylinder' }, // 3D primitive shape
                    material: { color: 'blue' },
                    width: 8000, // Width of the 3D shape
                    height: 80000, // Height of the 3D shape
                  },
                ],
              },
              label: `Present (${fetchedData.status_count})`,
            },
            {
              value: 'Not Present',
              symbol: {
                type: 'point-3d',
                symbolLayers: [
                  {
                    type: 'object',
                    resource: { primitive: 'cylinder' },
                    material: { color: 'red' },
                    width: 8000,
                    height: 80000,
                  },
                ],
              },
              label: `Not Present (${fetchedData.features.length - fetchedData.status_count})`,
            },
          ],
        }
      : {
          type: 'unique-value',
          field: 'STATUS',
          uniqueValueInfos: [
            {
              value: 'Present',
              symbol: {
                type: 'simple-marker',
                color: 'blue',
                size: '8px',
                outline: {
                  color: 'white',
                  width: 1,
                },
              },
              label: `Present (${fetchedData.status_count})`,
            },
            {
              value: 'Not Present',
              symbol: {
                type: 'simple-marker',
                color: 'red',
                size: '8px',
                outline: {
                  color: 'white',
                  width: 1,
                },
              },
              label: `Not Present (${fetchedData.features.length - fetchedData.status_count})`,
            },
          ],
        };

    // Create GeoJSONLayer
    const geojsonLayer = new GeoJSONLayer({
      url: geoJsonUrl,
      popupTemplate: template,
      renderer: renderer,
      orderBy: {
        field: 'STATUS',
      },
    });

    // Update the global geojsonLayer using the Context
    setGeojsonLayer(geojsonLayer);

    // Notify parent component that the layer is ready
    if (onLayerReady) {
      onLayerReady(geojsonLayer);
    }
  }, [fetchedData, symbolType, is3D, onLayerReady]); // Dependencies: fetchedData, symbolType, is3D

  return (
    <div>
      {bg_loader ? <BgLoader /> : null} {/* Show loader while fetching or processing */}
    </div>
  );
};

export default Overall;



// import React, { useEffect } from 'react';
// import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer';
// import esriConfig from '@arcgis/core/config';
// import sendJsonData from '../../apiService';

// const Overall = ({ onLayerReady,symbolType,is3D}) => {
//   useEffect(() => {
//     const date = new Date('2024-04-14');
//     const input_data = {
//       date: date,
//       options: 'Over All Site Info', // Adjust options as needed
//     };

//     console.log(input_data)

//     console.log("Pass",symbolType)
//     console.log(is3D)

//     sendJsonData(input_data)
//       .then((response) => {
//         const fetchedData = response.data;

//         // Set API Key
//         esriConfig.apiKey = 'AAPTxy8BH1VEsoebNVZXo8HurAU2wRtTCz35rS0IvyV5k0_FmOjKifjQ4MXaetOWAPxQ99ta0HCHYBSsLmJ-RxrEVoyLsT6hCItuii1Wq0Ctiu8ofOMIIcBYiR8_N3HQmOSC4MrerZZW_MiUovETiVP-I6qSZhn0k8qO1SF990cDX26ydD9ug32faqQlUjvebO0WHRrwPN3h0mdKEKlKMAZE8hjWCQHcEG7BM34DXJKiL7A.AT1_B2uSZ31B'; // Replace with your Esri API Key

//         const blob = new Blob([JSON.stringify(fetchedData)], {
//           type: 'application/json',
//         });
//         const url = URL.createObjectURL(blob);

//         const template = {
//           title: 'Stacov Site Info',
//           content: `<b>Site ID:</b> {SITEID}<br>
//                     <b>Description:</b> {Description}<br>
//                     <b>DOMES:</b> {DOMES}<br>`,
//         };
        

//         {is3D && symbolType === "object" ?
//           console.log("3D"):console.log("2D")
//         }

        
//         const renderer = {
//           type: 'unique-value',
//           field: 'STATUS',
//           uniqueValueInfos: [
//             {
//               value: 'Present',
//               symbol: {
//                 type: 'simple-marker',
//                 color: 'blue',
//                 size: '8px',
//                 outline: {
//                   color: 'white',
//                   width: 1,
//                 },
//               },
//               label: `Present (${fetchedData.status_count})`,
//             },
//             {
//               value: 'Not Present',
//               symbol: {
//                 type: 'simple-marker',
//                 color: 'red',
//                 size: '8px',
//                 outline: {
//                   color: 'white',
//                   width: 1,
//                 },
//               },
//               label: `Not Present (${fetchedData.features.length - fetchedData.status_count})`,
//             },
//           ],
//         };

//         // Create GeoJSONLayer
//         const geojsonLayer = new GeoJSONLayer({
//           url: url,
//           popupTemplate: template,
//           renderer: renderer,
//           orderBy: {
//             field: 'STATUS',
//           },
//         });

//         // Notify parent component that the layer is ready
//         if (onLayerReady) {
//           onLayerReady(geojsonLayer);
//         }
//       })
//       .catch((error) => {
//         console.error('There was an error fetching STACOV data!', error);
//       });
//   }, [onLayerReady,symbolType]);

//   return null; // This component does not render anything
// };

// export default Overall;
