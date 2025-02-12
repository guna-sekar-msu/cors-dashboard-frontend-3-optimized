import React, { useEffect, useRef, useState } from 'react';
import '@arcgis/core/assets/esri/themes/light/main.css';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import SceneView from '@arcgis/core/views/SceneView';
import Search from '@arcgis/core/widgets/Search';
import Widgets from './layers/Widgets'; // Widgets Component
import StacovFile from './layers/StacovFile';
import Overall from './layers/Overall';
import OPUSnet from './layers/OPUSnet';
import OverallVsMycs2 from './layers/OverallVsMycs2';
import esriRequest from '@arcgis/core/request';
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';

const CORSMap = ({ selectedLayer = null, is3D = false, selectedDate, Coordinates}) => {
  const mapRef = useRef(null);
  const viewRef = useRef(null);
  const [map, setMap] = useState(null);
  const [symbolType, setSymbolType] = useState('icon');
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [hasMarkers, setHasMarkers] = useState(false); // State to track if there are markers
  const layerUrlRef = useRef(null);
  const markerLayer = useRef(null);
  const [blobUrl, setBlobUrl] = useState(null);
  

  useEffect(() => {
    const mapInstance = new Map({
      basemap: 'gray-vector',
    });

    const view = is3D
      ? new SceneView({
          container: mapRef.current,
          map: mapInstance,
          center: [-99.7129, 37.0902],
          zoom: 4,
        })
      : new MapView({
          container: mapRef.current,
          map: mapInstance,
          center: [-95.7129, 37.0902],
          zoom: 3,
        });

    const markerLayerInstance = new GraphicsLayer();
    mapInstance.add(markerLayerInstance);
    markerLayer.current = markerLayerInstance;

    view.when(() => {
      setIsMapLoaded(true);
    });

    viewRef.current = view;
    setMap(mapInstance);

    return () => {
      if (view) {
        view.destroy();
      }
    };
  }, [is3D]);

  const handleLayerReady = (layer) => {
    if (map) {
      map.layers.removeAll();
      map.add(layer);
  
      if (markerLayer.current) {
        map.add(markerLayer.current);
      }
    }
  };
  
  const addSearchWidget = (view, url) => {
    // Always add the search widget, no conditions
    const existingSearchWidget = view.ui.find('customSearchWidget');
    if (existingSearchWidget) {
      view.ui.remove(existingSearchWidget); // Remove the old widget if it exists
    }
  
    const customSearchSource = {
      placeholder: 'Search by SITEID',
      getSuggestions: (params) => {
        return esriRequest(url, {
          responseType: 'json',
        }).then((results) => {
          return results.data.features
            .filter((feature) => feature.properties.SITEID.includes(params.suggestTerm))
            .map((feature) => ({
              key: feature.properties.SITEID,
              text: feature.properties.SITEID,
              sourceIndex: params.sourceIndex,
            }));
        });
      },
      getResults: (params) => {
        return esriRequest(url, {
          responseType: 'json',
        }).then((results) => {
          const filteredFeatures = results.data.features.filter(
            (feature) => feature.properties.SITEID === params.suggestResult.text.trim()
          );
  
          return filteredFeatures.map((feature) => {
            const graphic = new Graphic({
              geometry: new Point({
                x: feature.geometry.coordinates[0],
                y: feature.geometry.coordinates[1],
                spatialReference: { wkid: 4326 },
              }),
              attributes: feature.properties,
            });
  
            return {
              feature: graphic,
              name: `SITEID: ${graphic.attributes.SITEID}`,
            };
          });
        });
      },
      selectResult: (result) => {
        const searchPoint = new Graphic({
          geometry: result.feature.geometry,
          symbol: {
            type: 'simple-marker',
            style: 'circle',
            color: [0, 255, 0],
            size: 12,
            outline: {
              color: [255, 255, 255],
              width: 2,
            },
          },
        });
  
        markerLayer.current.removeAll();
        markerLayer.current.add(searchPoint);
        setHasMarkers(true); // Set hasMarkers to true when a marker is added
  
        view.goTo(
          {
            center: result.feature.geometry,
            zoom: 15,
          },
          {
            animate: true,
            duration: 1000,
            easing: 'ease-in-out',
          }
        );
      },
    };
  
    const searchWidget = new Search({
      view: view,
      sources: [customSearchSource],
    });
  
    searchWidget.id = 'customSearchWidget';
    view.ui.add(searchWidget, {
      position: 'top-right',
    });
  };
  
  useEffect(() => {
    
    if (viewRef.current && map && blobUrl) {
      console.log("blobUrl",blobUrl)
      // Always add the search widget as soon as the map and view are available
      addSearchWidget(viewRef.current, blobUrl);
    }
    else if(viewRef.current){
      const existingSearchWidget = viewRef.current.ui.find('customSearchWidget');
      if (existingSearchWidget) {
        viewRef.current.ui.remove(existingSearchWidget); // Remove the old widget if it exists
      }
    }
  }, [map, viewRef.current,blobUrl,selectedLayer]);
  
  useEffect(() => {
    if (Coordinates && viewRef.current && markerLayer.current) {
      const lat = Coordinates.lat;
      const lon = Coordinates.lon;
      const point = new Point({
        latitude: parseFloat(lat),
        longitude: parseFloat(lon),
        spatialReference: { wkid: 4326 },
      });

      const markerSymbol = {
        type: 'simple-marker',
        style: 'circle',
        color: [255, 0, 0],
        size: 12,
        outline: {
          color: [255, 255, 255],
          width: 2,
        },
      };

      const marker = new Graphic({
        geometry: point,
        symbol: markerSymbol,
      });

      markerLayer.current.removeAll();
      markerLayer.current.add(marker);
      setHasMarkers(true); // Set hasMarkers to true when a marker is added

      viewRef.current.goTo({
        center: point,
        zoom: 10,
      });
    }
  }, [Coordinates]);

  const clearMarkers = () => {
    if (markerLayer.current) {
      markerLayer.current.removeAll();
      setHasMarkers(false); // Set hasMarkers to false when markers are cleared
    }
  };
  const handleSymbolChange = (event) => {
    setSymbolType(event.target.value);
  };

  const toggleFullscreen = () => {
    if (mapRef.current) {
      if (!document.fullscreenElement) {
        mapRef.current.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }
  };
  

  const renderLayerComponent = () => {
    switch (selectedLayer) {
      case 'Static JSON + STACOV File':
        return <StacovFile onLayerReady={handleLayerReady} selectedDate={selectedDate} symbolType={symbolType} is3D={is3D} setBlobUrl={setBlobUrl} blobUrl={blobUrl}/>;
      case 'Over All Site Info':
        return <Overall onLayerReady={handleLayerReady} selectedDate={selectedDate} symbolType={symbolType} is3D={is3D} setBlobUrl={setBlobUrl} blobUrl={blobUrl}/>;
      case 'OPUSNET Data':
        return <OPUSnet onLayerReady={handleLayerReady} selectedDate={selectedDate} symbolType={symbolType} is3D={is3D} setBlobUrl={setBlobUrl} blobUrl={blobUrl}/>;
      case 'Over All Vs MYCS2':
        return <OverallVsMycs2 onLayerReady={handleLayerReady} selectedDate={selectedDate} symbolType={symbolType} is3D={is3D} setBlobUrl={setBlobUrl} blobUrl={blobUrl}/>;
      default:
        if (map) {
          map.layers.removeAll();
        }
        return null;
    }
  };

  return (
    <div>
      <div className="cors-map" style={{ position: 'relative' }}>
        <div ref={mapRef} className="h-[88vh] w-full"></div>
        {isMapLoaded && (
          <Widgets view={viewRef.current} onToggleFullscreen={toggleFullscreen} is3D={is3D} blobUrl={blobUrl} selectedLayer={selectedLayer} />
        )}
        {hasMarkers && (
          <button
            onClick={clearMarkers}
            className="absolute bottom-16 left-1/2 bg-red-500 text-white px-4 py-2 rounded shadow hover:bg-red-600"
          >
            Clear Markers
          </button>
        )}
        {renderLayerComponent()}
         {/* Control Panel */}
      {is3D && (
        <div
          style={{
            position: 'absolute',
            top: 400,
            right: 18,
            padding: 12,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            color: 'white',
          }}
        >
          Show points as:
          <div>
            <input
              type="radio"
              name="symbolType"
              value="icon"
              checked={symbolType === 'icon'}
              onChange={handleSymbolChange}
            />
            <label htmlFor="asIcon">2D shape</label>
          </div>
          <div>
            <input
              type="radio"
              name="symbolType"
              value="object"
              checked={symbolType === 'object'}
              onChange={handleSymbolChange}
            />
            <label htmlFor="asObject">3D shape</label>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default CORSMap;

