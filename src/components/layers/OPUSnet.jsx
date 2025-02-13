import React, { useEffect, useState } from 'react';
import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import esriConfig from '@arcgis/core/config';
import Graphic from '@arcgis/core/Graphic';
import Circle from '@arcgis/core/geometry/Circle';
import Point from '@arcgis/core/geometry/Point';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import sendJsonData from '../../apiService';
import BgLoader from '../bg_loader';
import { useGeojson } from "../../context/GeojsonProvider"; // Import Context
import moment from 'moment-timezone'; // Import moment-timezone for date manipulation

const OPUSnet = ({ onLayerReady, symbolType, is3D, selectedDate, setBlobUrl }) => {
  const { setGeojsonLayer } = useGeojson(); // Get setter from Context
  const [bg_loader, setBgLoader] = useState(true);
  const [fetchedData, setFetchedData] = useState(null);

  // First useEffect for data fetching
  useEffect(() => {
    const formattedDate = moment(selectedDate).tz('America/Los_Angeles').format('YYYY-MM-DD');
    console.log('Formatted Date:', formattedDate);

    const date = selectedDate ? new Date(formattedDate) : new Date("2018-10-28");
    const input_data = {
      date: date,
      options: 'OPUSNET Data',
    };

    console.log("Symbol Type:", symbolType);
    console.log("Is 3D:", is3D);

    setBgLoader(true);
    setBlobUrl(null);

    sendJsonData(input_data)
      .then((response) => {
        const data = response.data;
        setFetchedData(data); // Save the fetched data
        console.log("Fetched Data:", data);
        setBgLoader(false);
      })
      .catch((error) => {
        console.error('Error fetching STACOV data:', error);
        setBgLoader(false); // Stop the loader even if there is an error
      });
  }, [selectedDate]);

  // Second useEffect for layer setup (after data is fetched)
  useEffect(() => {
    if (!fetchedData) return; // Don't proceed until we have data

    // Set Esri API Key
    esriConfig.apiKey = 'AAPTxy8BH1VEsoebNVZXo8HurAU2wRtTCz35rS0IvyV5k0_FmOjKifjQ4MXaetOWAPxQ99ta0HCHYBSsLmJ-RxrEVoyLsT6hCItuii1Wq0Ctiu8ofOMIIcBYiR8_N3HQmOSC4MrerZZW_MiUovETiVP-I6qSZhn0k8qO1SF990cDX26ydD9ug32faqQlUjvebO0WHRrwPN3h0mdKEKlKMAZE8hjWCQHcEG7BM34DXJKiL7A.AT1_B2uSZ31B';

    // Create a Blob from the fetched data and generate a URL
    const blob = new Blob([JSON.stringify(fetchedData)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);

    // Define Popup Template
    const template = {
      title: 'Site Information',
      content: `<b>Site ID:</b> {SITEID}<br><b>Status:</b> {STATUS}`,
    };

    // Define Renderer
    const renderer = {
      type: 'unique-value',
      field: 'STATUS',
      uniqueValueInfos: [
        {
          value: 'Uncertainty',
          symbol: {
            type: 'simple-marker',
            color: 'orange',
            size: '10px',
            outline: {
              color: 'black',
              width: 1,
            },
          },
          label: 'Uncertainty',
        },
      ],
    };

    // Create GeoJSONLayer
    const geojsonLayer = new GeoJSONLayer({
      url: url,
      popupTemplate: template,
      renderer: renderer,
    });
    setGeojsonLayer(geojsonLayer);

    // Create GraphicsLayer for uncertainty circles and markers
    const graphicsLayer = new GraphicsLayer();

    // Handle uncertainty if enabled in the fetched data
    if (fetchedData.uncertainty) {
      fetchedData.features.forEach((feature) => {
        const point = new Point({
          latitude: feature.geometry.coordinates[1],
          longitude: feature.geometry.coordinates[0],
        });

        // Adjust the scaling factor to make the uncertainty circle bigger
        const uncertaintyRadius = Math.max(...feature.geometry.Uncertainty) * 1e6; // Scale uncertainty value (larger multiplier)

        // Create a circle for uncertainty
        const uncertaintyCircle = new Circle({
          center: point,
          radius: uncertaintyRadius,
          radiusUnit: "meters",
        });

        // Define the symbol for the uncertainty circle
        const fillSymbol = new SimpleFillSymbol({
          color: [255, 0, 0, 0.3], // Semi-transparent red fill for uncertainty
          outline: {
            color: [255, 0, 0, 0.8], // Red outline for uncertainty
            width: 1,
          },
        });

        // Create a graphic for the uncertainty circle
        const circleGraphic = new Graphic({
          geometry: uncertaintyCircle,
          symbol: fillSymbol,
        });

        // Create a marker symbol for the lat/lon point
        const markerSymbol =
          is3D && symbolType === 'object'
            ? {
                type: 'point-3d', // Use 3D point symbol
                symbolLayers: [
                  {
                    type: 'object', // Use object layer for 3D symbols
                    resource: { primitive: 'cylinder' }, // 3D shape
                    material: { color: [0, 110, 51] }, // Green cylinder color
                    height: 30000, // Height of the cylinder
                    width: 1000, // Diameter of the cylinder
                  },
                ],
              }
            : {
                type: 'simple-marker', // Style for the marker
                color: [0, 110, 51], // Green marker color
                outline: {
                  color: [255, 255, 255], // White outline
                  width: 2,
                },
                size: '10px', // Size of the marker
              };

        // Create a graphic for the marker at the lat/lon point
        const pointGraphic = new Graphic({
          geometry: point,
          symbol: markerSymbol,
        });

        // Add the uncertainty circle and point marker to the graphics layer
        graphicsLayer.add(circleGraphic);
        graphicsLayer.add(pointGraphic);
      });
    }

    // Notify parent component that the layers are ready
    if (onLayerReady) {
      onLayerReady(geojsonLayer); // Add GeoJSON layer first
      onLayerReady(graphicsLayer); // Add Graphics layer for uncertainty
    }
  }, [fetchedData, onLayerReady, symbolType, is3D, setGeojsonLayer]);

  return bg_loader ? <BgLoader /> : null; // Show loader while fetching data
};

export default OPUSnet;