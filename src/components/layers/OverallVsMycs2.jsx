import React, { useEffect, useState } from 'react';
import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer';
import esriConfig from '@arcgis/core/config';
import sendJsonData from '../../apiService';
import moment from 'moment-timezone';
import BgLoader from '../bg_loader';
import { useGeojson } from "../../context/GeojsonProvider"; // Import Context

const OverallVsMycs2 = ({ onLayerReady, symbolType, is3D, selectedDate,setBlobUrl,blobUrl}) => {
  const { setGeojsonLayer } = useGeojson(); // Get setter from Context
  // State to store the GeoJSON URL
  // const [geoJsonUrl, setGeoJsonUrl] = useState(null);
  const[bg_loader,setBgLoader]=useState(true);

  // Fetch data only once when the component mounts
  useEffect(() => {
    // const date = moment.tz('2010-01-01', 'America/Los_Angeles').toDate(); // Set date to 01-01-2010

    console.log('mycs2',selectedDate);


    const formattedDate = moment(selectedDate).tz('America/Los_Angeles').format('YYYY-MM-DD');
    console.log('Formatted Date:', formattedDate);
    
    const date = selectedDate ? new Date(formattedDate) : new Date("2010-01-21");
    const input_data = {
      date: date,
      options: 'Over All Vs MYCS2',
    };

    setBgLoader(true);
    setBlobUrl(null);
    sendJsonData(input_data)
      .then((response) => {
        const fetchedData = response.data;
        console.log('Fetched Data:', fetchedData);

        // Create a Blob from the fetched data and generate a URL
        const blob = new Blob([JSON.stringify(fetchedData)], {
          type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);

        setBgLoader(false);

        // Set the GeoJSON URL in state
        // setGeoJsonUrl(url);
      })
      .catch((error) => {
        console.error('Error fetching OverallVsMycs2 data:', error);
        alert("Check the date and layer");
      });
  }, [selectedDate]); // Empty dependency array ensures this runs only once

  // Update the layer when geoJsonUrl, symbolType, or is3D changes
  useEffect(() => {
    if (!blobUrl) return; // Don't proceed until the GeoJSON URL is available

    // Set Esri API Key
    esriConfig.apiKey = 'AAPTxy8BH1VEsoebNVZXo8HurAU2wRtTCz35rS0IvyV5k0_FmOjKifjQ4MXaetOWAPxQ99ta0HCHYBSsLmJ-RxrEVoyLsT6hCItuii1Wq0Ctiu8ofOMIIcBYiR8_N3HQmOSC4MrerZZW_MiUovETiVP-I6qSZhn0k8qO1SF990cDX26ydD9ug32faqQlUjvebO0WHRrwPN3h0mdKEKlKMAZE8hjWCQHcEG7BM34DXJKiL7A.AT1_B2uSZ31B';

    // Define Popup Template
    const template = {
      title: 'Site Information',
      content: `<b>Site ID:</b> {SITEID}<br>
                <b>Status:</b> {STATUS}<br>
                <b>Description:</b> {Description}<br>
                <b>DOMES:</b> {DOMES}`,
    };

    // Define Renderer based on symbolType and is3D
    const renderer = is3D && symbolType === 'object'
      ? {
          type: 'unique-value',
          field: 'STATUS',
          uniqueValueInfos: [
            {
              value: 'MYCS2 Prediction',
              symbol: {
                type: 'point-3d',
                symbolLayers: [
                  {
                    type: 'object',
                    resource: { primitive: 'cylinder' },
                    material: { color: 'orange' },
                    width: 8000,
                    height: 80000,
                  },
                ],
              },
              label: 'MYCS2 Prediction',
            },
            {
              value: 'Observation',
              symbol: {
                type: 'point-3d',
                symbolLayers: [
                  {
                    type: 'object',
                    resource: { primitive: 'cylinder' },
                    material: { color: 'green' },
                    width: 8000,
                    height: 80000,
                  },
                ],
              },
              label: 'Observation',
            },
          ],
        }
      : {
          type: 'unique-value',
          field: 'STATUS',
          uniqueValueInfos: [
            {
              value: 'MYCS2 Prediction',
              symbol: {
                type: 'simple-marker',
                color: 'orange',
                size: '10px',
                outline: {
                  color: 'white',
                  width: 1,
                },
              },
              label: 'MYCS2 Prediction',
            },
            {
              value: 'Observation',
              symbol: {
                type: 'simple-marker',
                color: 'green',
                size: '10px',
                outline: {
                  color: 'white',
                  width: 1,
                },
              },
              label: 'Observation',
            },
          ],
        };

    // Create GeoJSONLayer
    const geojsonLayer = new GeoJSONLayer({
      url: blobUrl,
      popupTemplate: template,
      renderer: renderer,
    });
    // setGeojsonLayer(geojsonLayer);
    // Notify the parent component about the GeoJSON layer
    if (onLayerReady) {
      onLayerReady(geojsonLayer);
    }
    // setBgLoader(false);
  }, [selectedDate,blobUrl, onLayerReady, symbolType, is3D]); // Dependencies that trigger this effect

  return bg_loader ? <BgLoader /> : null; // This component does not render anything
};

export default OverallVsMycs2;
