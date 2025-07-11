import React, { useState, useEffect, useRef } from "react";
import { FaLocationCrosshairs } from "react-icons/fa6";
import { FaMapMarkedAlt, FaStreetView, FaSatellite } from "react-icons/fa";
import {
  RiFullscreenExitFill,
  RiFullscreenLine,
  RiZoomInFill,
  RiZoomOutFill,
} from "react-icons/ri";
import { GoogleMap, Marker } from "@react-google-maps/api";

const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#263c3f" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b9a76" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2835" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f3d19c" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2f3948" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#17263c" }],
  },
];

const Map = ({ selectedLocation, setSelectedLocation }) => {
  const mapRef = useRef(null);
  const [search, setSearch] = useState("");
  const [predictions, setPredictions] = useState([]);
  const [service, setService] = useState(null);
  const [inputFocused, setInputFocused] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapType, setMapType] = useState("roadmap");
  const [streetViewActive, setStreetViewActive] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mapContainerRef = useRef(null);
  const OFFSET_X = 3;
  const OFFSET_Y = 3;

  const MarkerFunc = () => {
    return <Marker position={selectedLocation} />;
  };

  useEffect(() => {
    if (window.google && mapRef.current && !service) {
      setService(new window.google.maps.places.AutocompleteService());
    }
  }, [service, mapRef.current]);

  useEffect(() => {
    if (service && search.length > 0) {
      service.getPlacePredictions(
        {
          input: search,
          locationBias: {
            radius: 5000,
            center: selectedLocation,
          },
          types: ["establishment", "geocode"],
        },
        (preds) => setPredictions(preds || [])
      );
    } else {
      setPredictions([]);
    }
  }, [search, service, selectedLocation]);

  useEffect(() => {
    if (mapLoaded && mapRef.current && selectedLocation) {
      mapRef.current.panTo(selectedLocation);
    }
  }, [selectedLocation, mapLoaded]);

  useEffect(() => {
    if (isFullscreen && mapContainerRef.current) {
      document.exitFullscreen().then(() => {
        setTimeout(() => {
          mapContainerRef.current.requestFullscreen();
        }, 100);
      });
    }
  }, [selectedLocation]);

  const handlePredictionClick = (prediction) => {
    const placesService = new window.google.maps.places.PlacesService(
      mapRef.current
    );
    placesService.getDetails(
      { placeId: prediction.place_id, fields: ["geometry"] },
      (place, status) => {
        if (
          status === window.google.maps.places.PlacesServiceStatus.OK &&
          place.geometry &&
          place.geometry.location
        ) {
          const coords = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          };
          setSelectedLocation(coords);
          setSearch(prediction.description);
          setPredictions([]);
        }
      }
    );
  };

  const handleLocate = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setSelectedLocation(coords);
        },
        () => alert("No se pudo obtener la ubicación actual.")
      );
    }
  };

  const handleZoom = (delta) => {
    if (mapRef.current) {
      const currentZoom = mapRef.current.getZoom();
      mapRef.current.setZoom(currentZoom + delta);
    }
  };

  const handleMapType = () => {
    if (mapRef.current) {
      const nextType = mapType === "roadmap" ? "satellite" : "roadmap";
      mapRef.current.setMapTypeId(nextType);
      setMapType(nextType);
    }
  };

  const handleStreetView = () => {
    if (mapRef.current) {
      const sv = mapRef.current.getStreetView();
      sv.setPosition(selectedLocation);
      sv.setVisible(!streetViewActive);
      setStreetViewActive(!streetViewActive);
    }
  };

  const handleDragStart = (e) => {
    const rect = mapContainerRef.current.getBoundingClientRect();
    setDragging(true);
    setDragPos({
      x: e.clientX - rect.left + OFFSET_X,
      y: e.clientY - rect.top + OFFSET_Y,
    });
    document.body.style.userSelect = "none";
  };

  const handleDrag = (e) => {
    if (dragging) {
      const rect = mapContainerRef.current.getBoundingClientRect();
      setDragPos({
        x: e.clientX - rect.left + OFFSET_X,
        y: e.clientY - rect.top + OFFSET_Y,
      });
    }
  };

  const handleDragEnd = (e) => {
    setDragging(false);
    document.body.style.userSelect = "";
    const mapDiv = mapRef.current.getDiv();
    const rect = mapDiv.getBoundingClientRect();
    const x = e.clientX - rect.left + OFFSET_X;
    const y = e.clientY - rect.top + OFFSET_Y;
    if (
      x >= 0 &&
      y >= 0 &&
      x <= rect.width &&
      y <= rect.height &&
      mapRef.current
    ) {
      const projection = mapRef.current.getProjection();
      if (projection) {
        const bounds = mapRef.current.getBounds();
        const topRight = projection.fromLatLngToPoint(bounds.getNorthEast());
        const bottomLeft = projection.fromLatLngToPoint(bounds.getSouthWest());
        const point = new window.google.maps.Point(
          bottomLeft.x + (x / rect.width) * (topRight.x - bottomLeft.x),
          topRight.y + (y / rect.height) * (bottomLeft.y - topRight.y)
        );
        const latLng = projection.fromPointToLatLng(point);
        if (latLng) {
          const coords = {
            lat: latLng.lat(),
            lng: latLng.lng(),
          };
          const sv = mapRef.current.getStreetView();
          const streetViewService = new window.google.maps.StreetViewService();
          streetViewService.getPanorama(
            {
              location: coords,
              radius: 50,
              source: window.google.maps.StreetViewSource.OUTDOOR,
            },
            (data, status) => {
              if (status === window.google.maps.StreetViewStatus.OK) {
                sv.setPosition(data.location.latLng);
                sv.setVisible(true);
                setStreetViewActive(true);
              } else {
                alert("No se encontró una vista de calle cercana.");
              }
            }
          );
        }
      }
    }
  };

  useEffect(() => {
    if (dragging) {
      window.addEventListener("mousemove", handleDrag);
      window.addEventListener("mouseup", handleDragEnd);
      return () => {
        window.removeEventListener("mousemove", handleDrag);
        window.removeEventListener("mouseup", handleDragEnd);
      };
    }
  }, [dragging]);

  return (
    <div className="custom-map-glass">
      <div ref={mapContainerRef}>
        {!streetViewActive && (
          <>
            <div className="map-search-box">
              <div
                className={`search-inner ${
                  inputFocused && predictions.length > 0
                    ? "with-predictions"
                    : ""
                }`}
              >
                <input
                  name="SearchBox"
                  id="SearchBox"
                  type="text"
                  autoComplete="off"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setTimeout(() => setInputFocused(false), 200)}
                  placeholder="Buscar lugar o dirección..."
                />
                {inputFocused && predictions.length > 0 && (
                  <div className="search-predictions">
                    <div className="custom-scrollbar">
                      {predictions.map((pred) => (
                        <div
                          key={pred.place_id}
                          className="prediction-item"
                          onMouseDown={() => handlePredictionClick(pred)}
                        >
                          <div className="main-text">
                            {pred.structured_formatting.main_text}
                          </div>
                          <div className="secondary-text">
                            {pred.structured_formatting.secondary_text}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="map-controls" style={{ right: "110px" }}>
              <button
                type="button"
                title={
                  mapType === "roadmap" ? "Vista satelital" : "Vista normal"
                }
                className="map-btn"
                onClick={handleMapType}
              >
                {mapType === "roadmap" ? (
                  <FaSatellite className="icon-map" />
                ) : (
                  <FaMapMarkedAlt className="icon-map" />
                )}
              </button>
            </div>
            <div className="map-controls" style={{ right: "60px" }}>
              <button
                type="button"
                title="Street View (arrástrame al mapa)"
                className="map-btn"
                style={{
                  cursor: dragging ? "grabbing" : "grab",
                  opacity: dragging ? 0.7 : 1,
                }}
                onMouseDown={handleDragStart}
                onClick={handleStreetView}
              >
                <FaStreetView className="icon-map" />
              </button>
            </div>
            <div className="map-controls">
              <button
                type="button"
                title="Acercar"
                className="map-btn"
                onClick={() => handleZoom(1)}
              >
                <RiZoomInFill className="icon-map" />
              </button>
              <button
                type="button"
                title="Alejar"
                className="map-btn"
                onClick={() => handleZoom(-1)}
              >
                <RiZoomOutFill className="icon-map" />
              </button>

              <button
                type="button"
                title="Ir a mi ubicación"
                className="map-btn"
                onClick={handleLocate}
              >
                <FaLocationCrosshairs className="icon-map" />
              </button>
            </div>
            <div
              className="map-controls"
              style={{ bottom: isFullscreen ? "93%" : "85%" }}
            >
              <button
                type="button"
                title="Pantalla completa"
                className="map-btn"
                onClick={() => {
                  const wrapperDiv = mapContainerRef.current;
                  if (wrapperDiv) {
                    if (document.fullscreenElement) {
                      document.exitFullscreen();
                      setIsFullscreen(false);
                    } else {
                      wrapperDiv.requestFullscreen();
                      setIsFullscreen(true);
                    }
                  }
                }}
              >
                {isFullscreen ? (
                  <RiFullscreenExitFill className="icon-map" />
                ) : (
                  <RiFullscreenLine className="icon-map" />
                )}
              </button>
            </div>
          </>
        )}
        {dragging && (
          <div
            className="streetview-drag-icon"
            style={{
              left: `${dragPos.x}px`,
              top: `${dragPos.y}px`,
            }}
          >
            <FaStreetView className="icon-map" />
          </div>
        )}
        <GoogleMap
          mapContainerStyle={{
            width: "100%",
            height: isFullscreen ? "100%" : "400px",
            borderRadius: "0.25rem",
          }}
          center={selectedLocation}
          zoom={15}
          options={{
            styles: darkMapStyle,
            disableDefaultUI: true,
            draggableCursor: "default",
            draggingCursor: "grabbing",
            gestureHandling: "cooperative",
          }}
          onLoad={(mapInstance) => {
            mapRef.current = mapInstance;
            setMapLoaded(true);
            const streetView = mapInstance.getStreetView();
            streetView.addListener("visible_changed", () => {
              setStreetViewActive(streetView.getVisible());
            });
          }}
          onClick={(e) => {
            if (e.latLng) {
              setSelectedLocation({
                lat: e.latLng.lat(),
                lng: e.latLng.lng(),
              });
            }
          }}
        >
          <MarkerFunc />
        </GoogleMap>
      </div>
    </div>
  );
};

export default Map;
