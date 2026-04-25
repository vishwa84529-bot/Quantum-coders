import { useMemo, useState } from "react";
import { Circle, GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const mapContainerStyle = {
  width: "100%",
  minHeight: "400px",
  height: "100%",
};

const palette = {
  LOW: "#22c55e",
  MEDIUM: "#f59e0b",
  HIGH: "#ef4444",
};

function MapView({ location, risk, rainfall, waterLevel }) {
  const [mapError, setMapError] = useState("");
  const [mapLoaded, setMapLoaded] = useState(false);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || import.meta.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  const zoneColor = palette[risk] || palette.LOW;
  const zoneLabel = `${risk || "LOW"} zone`;
  const mapLocation = useMemo(
    () => ({
      lat: Number(location?.lat || 0),
      lng: Number(location?.lon || location?.lng || 0),
    }),
    [location]
  );

  if (!apiKey) {
    return (
      <div className="relative flex min-h-[400px] items-center justify-center overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(14,165,233,0.16),_transparent_45%)]" />
        <div className="relative max-w-md rounded-3xl border border-white/10 bg-white/10 p-6 text-center text-white shadow-2xl">
          <div
            className="mx-auto flex h-36 w-36 items-center justify-center rounded-full border-4 text-sm font-semibold uppercase tracking-[0.2em]"
            style={{ borderColor: zoneColor, backgroundColor: `${zoneColor}26` }}
          >
            {zoneLabel}
          </div>
          <p className="mt-5 text-lg font-semibold">Google Maps API key missing</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Add `VITE_GOOGLE_MAPS_API_KEY` or `REACT_APP_GOOGLE_MAPS_API_KEY` to `frontend/.env`, then restart Vite.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[400px]">
      {!mapLoaded && !mapError && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/80 text-white">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-cyan-400" />
        </div>
      )}
      {mapError && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950 p-6 text-center text-white">
          <div>
            <p className="text-lg font-semibold">Unable to load Google Map</p>
            <p className="mt-2 text-sm text-slate-300">{mapError}</p>
          </div>
        </div>
      )}
      <LoadScript
        googleMapsApiKey={apiKey}
        onError={() => setMapError("Check the Google Maps key, billing, and Maps JavaScript API access.")}
      >
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={mapLocation}
          zoom={11}
          onLoad={() => {
            console.log("[map] Google Map loaded", { mapLocation, risk });
            setMapLoaded(true);
          }}
          options={{
            disableDefaultUI: true,
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
          }}
        >
          <Marker position={mapLocation} />
          <Circle
            center={mapLocation}
            radius={13000}
            options={{
              strokeColor: zoneColor,
              strokeOpacity: 0.9,
              strokeWeight: 3,
              fillColor: zoneColor,
              fillOpacity: 0.18,
            }}
          />
        </GoogleMap>
      </LoadScript>
      <div className="pointer-events-none absolute bottom-4 left-4 rounded-2xl bg-white/95 p-3 text-sm shadow-xl">
        <p className="font-semibold text-slate-950">Live Map Active</p>
        <p className="mt-1 text-slate-600">Rainfall: {rainfall ?? "--"} mm</p>
        <p className="text-slate-600">Water level: {waterLevel ?? "--"} m</p>
      </div>
    </div>
  );
}

export default MapView;
