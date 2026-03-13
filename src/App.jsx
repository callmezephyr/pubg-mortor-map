import React, { useState, useMemo, useEffect } from 'react';
import { MapContainer, ImageOverlay, Marker, Polyline, useMapEvents, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';

const MAP_SIZE = 8000;
const mapBounds = [[0, 0], [MAP_SIZE, MAP_SIZE]];

// Refined SVG Icons - 12x12 Crosshair
const sourceIcon = L.divIcon({
  className: 'custom-icon',
  html: `<svg width="12" height="12" viewBox="0 0 12 12"><line x1="6" y1="0" x2="6" y2="12" stroke="#00ff00" stroke-width="2"/><line x1="0" y1="6" x2="12" y2="6" stroke="#00ff00" stroke-width="2"/></svg>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

const targetIcon = L.divIcon({
  className: 'custom-icon',
  html: `<svg width="12" height="12" viewBox="0 0 12 12"><line x1="6" y1="0" x2="6" y2="12" stroke="#ff4d4d" stroke-width="2"/><line x1="0" y1="6" x2="12" y2="6" stroke="#ff4d4d" stroke-width="2"/></svg>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

function MapController({ onMapClick, onReset }) {
  useMapEvents({
    click: (e) => onMapClick(e.latlng),
    keydown: (e) => {
      if (e.originalEvent.key === 'Escape') {
        onReset();
      }
    },
  });
  return null;
}

function App() {
  const [origin, setOrigin] = useState(() => {
    const saved = localStorage.getItem('mortar_origin');
    return saved ? JSON.parse(saved) : null;
  });
  const [target, setTarget] = useState(() => {
    const saved = localStorage.getItem('mortar_target');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (origin) localStorage.setItem('mortar_origin', JSON.stringify(origin));
    else localStorage.removeItem('mortar_origin');
  }, [origin]);

  useEffect(() => {
    if (target) localStorage.setItem('mortar_target', JSON.stringify(target));
    else localStorage.removeItem('mortar_target');
  }, [target]);

  const distance = useMemo(() => {
    if (!origin || !target) return null;
    const dx = target.lng - origin.lng;
    const dy = target.lat - origin.lat;
    return Math.sqrt(dx * dx + dy * dy);
  }, [origin, target]);

  const handleMapClick = (latlng) => {
    if (!origin || (origin && target)) {
      setOrigin(latlng);
      setTarget(null);
    } else {
      setTarget(latlng);
    }
  };

  const resetSystem = () => {
    setOrigin(null);
    setTarget(null);
  };

  const isWithinRange = distance >= 121 && distance <= 700;
  const statusColor = distance === null ? '#ffffff' : isWithinRange ? '#39FF14' : '#FF3131';

  return (
    <div className="field-manual-container">
      {/* Semantic Instruction Header */}
      <header className={`step-banner ${!origin ? 'step-1' : !target ? 'step-2' : 'step-3'}`}>
        {!origin 
          ? 'STEP 1: CLICK YOUR POSITION ON THE MAP' 
          : !target 
            ? 'STEP 2: CLICK YOUR TARGET DESTINATION' 
            : `CALCULATION COMPLETE - ADJUST MORTAR TO ${Math.round(distance)} METERS`
        }
      </header>

      {/* Optimized Tactical HUD */}
      {distance !== null && (
        <main className="massive-hud" style={{ color: statusColor }}>
          <h1 className="hud-label">MORTAR TACTICAL DATA</h1>
          <div className="hud-value">{Math.round(distance)}m</div>
          <div className="hud-alert">
            {isWithinRange ? 'READY TO FIRE' : distance < 121 ? 'TOO CLOSE' : 'OUT OF RANGE'}
          </div>
        </main>
      )}

      {/* Visual Legend */}
      <section className="visual-legend" aria-label="Map Legend">
        <div className="legend-item">
          <span className="dot green"></span> YOU
        </div>
        <div className="legend-item">
          <span className="cross red">+</span> ENEMY
        </div>
        <div className="legend-item">
          <span className="line dashed">---</span> SHELL PATH
        </div>
      </section>

      {/* Reset Map Button */}
      <button className="physical-reset-button" onClick={resetSystem} aria-label="Reset Tactical Map">
        RESET MAP
      </button>

      {/* Tactical Keyword Footer */}
      <footer className="tactical-footer">
        Designed for the PUBG community. Accurate Erangel coordinate system for mortar deployment (121m to 700m).
      </footer>

      <div className="map-wrapper">
        <MapContainer
          crs={L.CRS.Simple}
          bounds={mapBounds}
          maxBounds={mapBounds}
          center={[MAP_SIZE / 2, MAP_SIZE / 2]}
          zoom={-1}
          minZoom={-3}
          maxZoom={3}
          style={{ height: '100%', width: '100%' }}
          attributionControl={false}
        >
          <ImageOverlay
            url="/erangel.webp"
            bounds={mapBounds}
            className="tactical-map"
          />
          <MapController onMapClick={handleMapClick} onReset={resetSystem} />
          
          {origin && (
            <Marker position={origin} icon={sourceIcon}>
              <Popup className="tactical-popup">MORTAR</Popup>
            </Marker>
          )}
          
          {target && (
            <Marker position={target} icon={targetIcon}>
              <Popup className="tactical-popup">TARGET</Popup>
            </Marker>
          )}

          {origin && target && (
            <Polyline 
              positions={[origin, target]} 
              className={`pulsing-line ${isWithinRange ? 'green' : 'red'}`}
              weight={3} 
              dashArray="10, 15" 
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
}

export default App;
