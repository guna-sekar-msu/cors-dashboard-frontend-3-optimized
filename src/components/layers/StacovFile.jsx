import React, { useState, useEffect } from 'react';
import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer';
import esriConfig from '@arcgis/core/config';
import sendJsonData from '../../apiService';
import BgLoader from '../bg_loader';
import { useGeojson } from "../../context/GeojsonProvider"; // Import Context
import moment from 'moment-timezone'; // Import moment-timezone for date manipulation
import CORSMap from '../CORSMap';

const StacovFile = ({ onLayerReady, symbolType, is3D, selectedDate,setBlobUrl,blobUrl }) => {
  const { setGeojsonLayer } = useGeojson(); // Get setter from Context
  const [bg_loader, setBgLoader] = useState(true); // Loader state
  const [fetchedData, setFetchedData] = useState(null); // Store fetched data
   // Store blob URL

  useEffect(() => {
    const formattedDate = moment(selectedDate).tz('America/Los_Angeles').format('YYYY-MM-DD');
    console.log('Formatted Date:', formattedDate);
    
    const date = selectedDate ? new Date(formattedDate) : new Date("2024-04-14");
    const input_data = {
      date: date,
      options: 'Static JSON + STACOV File', // Adjust options as needed
    };

    setBgLoader(true);

    sendJsonData(input_data)
      .then((response) => {
        const fetchedData = response.data;
        setFetchedData(fetchedData); // Store fetched data

        // Set API Key
        esriConfig.apiKey = 'AAPTxy8BH1VEsoebNVZXo8HurAU2wRtTCz35rS0IvyV5k0_FmOjKifjQ4MXaetOWAPxQ99ta0HCHYBSsLmJ-RxrEVoyLsT6hCItuii1Wq0Ctiu8ofOMIIcBYiR8_N3HQmOSC4MrerZZW_MiUovETiVP-I6qSZhn0k8qO1SF990cDX26ydD9ug32faqQlUjvebO0WHRrwPN3h0mdKEKlKMAZE8hjWCQHcEG7BM34DXJKiL7A.AT1_B2uSZ31B';

        // Create Blob from the fetched data
        const blob = new Blob([JSON.stringify(fetchedData)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        // Set blob URL to state for later use
        setBlobUrl(url);
      })
      .catch((error) => {
        console.error('There was an error fetching STACOV data!', error);
        setBgLoader(false);
        alert("Check the date and layer");
      });
  }, [selectedDate]);

  useEffect(() => {
    if (!fetchedData || !blobUrl) return; // Don't proceed until data and blob URL are ready

    const template = {
      title: 'Stacov Site Info',
      content: `<b>Site ID:</b> {SITEID}<br><b>Description:</b> {Description}<br><b>DOMES:</b> {DOMES}<br>`,
    };

    const renderer = is3D && symbolType === "object"
      ? {
          type: 'unique-value',
          field: 'STATUS',
          uniqueValueInfos: [
            {
              value: 'Present',
              symbol: {
                type: 'point-3d',
                symbolLayers: [
                  {
                    type: 'object',
                    resource: { primitive: 'cylinder' },
                    material: { color: 'blue' },
                    width: 8000,
                    height: 80000,
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
      url: blobUrl,
      popupTemplate: template,
      renderer: renderer,
      orderBy: {
        field: 'STATUS',
      },
    });

    // Emit event when layer is ready
    setGeojsonLayer(geojsonLayer); // Update global geojsonLayer

    // Notify parent component that the layer is ready
    if (onLayerReady) {
      onLayerReady(geojsonLayer);
    }

    // Hide loader after successful fetch
    setBgLoader(false);
  }, [fetchedData, blobUrl, is3D, symbolType, setGeojsonLayer, onLayerReady]);

  return bg_loader ? <BgLoader /> : (
    <div>
      {/* Render map or other UI elements here */}
      {/* Example: */}
      {/* <h2>STACOV Layer Loaded Successfully</h2> */}
      {/* <CORSMap blobUrl={blobUrl}/> */}
    </div>
  );
};

export default StacovFile;


// import React, { useEffect } from 'react';
// import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer';
// import esriConfig from '@arcgis/core/config';
// import sendJsonData from '../../apiService';

// const StacovFile = ({ onLayerReady,symbolType,is3D}) => {
//   useEffect(() => {
//     const date = new Date('2024-04-14');
//     const input_data = {
//       date: date,
//       options: 'Static JSON + STACOV File', // Adjust options as needed
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

// export default StacovFile;
