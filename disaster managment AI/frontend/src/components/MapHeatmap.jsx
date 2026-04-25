import { Circle, GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const palette = {
  LOW: "#22c55e",
  MEDIUM: "#f59e0b",
  HIGH: "#ef4444",
};

const cityCoordinates = {
  Bangalore: { lat: 12.9716, lon: 77.5946 },
  Chennai: { lat: 13.0827, lon: 80.2707 },
  Mumbai: { lat: 19.076, lon: 72.8777 },
  Kolkata: { lat: 22.5726, lon: 88.3639 },
};

function MapHeatmap({ location, risk, locations }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const center = { lat: location.lat, lng: location.lon };
  const overlays = (locations || []).map((item) => ({
    ...item,
    position: cityCoordinates[item.city] || { lat: location.lat, lon: location.lon },
  }));

  if (!apiKey) {
    return (
      <div className="relative h-full overflow-hidden bg-slate-950 p-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(14,165,233,0.16),_transparent_45%)]" />
        <div className="relative grid h-full gap-4 sm:grid-cols-2">
          {(overlays.length ? overlays : [{ city: "Current", risk, score: 40, position: location }]).map((item) => (
            <div key={item.city} className="flex items-center justify-center rounded-3xl border border-white/10 bg-white/5">
              <div
                className="flex h-36 w-36 items-center justify-center rounded-full border-4 text-center text-xs font-semibold uppercase tracking-[0.18em] text-white transition"
                style={{
                  borderColor: palette[item.risk] || palette.LOW,
                  backgroundColor: `${palette[item.risk] || palette.LOW}26`,
                }}
              >
                {item.city}
                <br />
                {item.risk}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <LoadScript googleMapsApiKey={apiKey}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={5}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        }}
      >
        <Marker position={center} />
        {(overlays.length ? overlays : [{ city: "Current", risk, score: 50, position: location }]).map((item) => {
          const color = palette[item.risk] || palette.LOW;
          const point = { lat: item.position.lat, lng: item.position.lon };

          return (
            <Circle
              key={item.city}
              center={point}
              radius={Math.max(18000, (item.score || 45) * 900)}
              options={{
                strokeColor: color,
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: color,
                fillOpacity: 0.2,
              }}
            />
          );
        })}
      </GoogleMap>
    </LoadScript>
  );
}

export default MapHeatmap;
