import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

export default function RouteMap({ data = [] }) {
  const [routePoints, setRoutePoints] = useState([]);
  const [addressMap, setAddressMap] = useState({}); // lat,lng -> address

  useEffect(() => {
    if (!Array.isArray(data) || data.length === 0) {
      setRoutePoints([]);
      setAddressMap({});
      return;
    }

    const points = data.map((x) => ({
      lat: parseFloat(x.latitude),
      lng: parseFloat(x.longitude),
      timestamp: x.timestamp,
      sl_no: x.sl_no,
    }));

    points.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    setRoutePoints(points);
  }, [data]);

  // 🔁 Reverse geocode
  useEffect(() => {
    if (routePoints.length === 0) return;

    async function fetchAddresses() {
      const newAddresses = {};

      for (const p of routePoints) {
        const key = `${p.lat},${p.lng}`;

        if (addressMap[key]) continue; // already fetched

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${p.lat}&lon=${p.lng}`
          );
          const json = await res.json();

          newAddresses[key] =
            json.display_name || "Unknown location";
        } catch (err) {
          console.error("Reverse geocode error:", err);
          newAddresses[key] = "Location not found";
        }

        // ⏱ polite delay (important for free API)
        await new Promise((r) => setTimeout(r, 1000));
      }

      setAddressMap((prev) => ({ ...prev, ...newAddresses }));
    }

    fetchAddresses();
  }, [routePoints]);

  if (routePoints.length === 0) {
    return <p className="text-center mt-5">No route data to display</p>;
  }

  const polylinePositions = routePoints.map((p) => [p.lat, p.lng]);
  const startPoint = routePoints[0];
  const endPoint = routePoints[routePoints.length - 1];

  return (
    <div style={{ height: "600px", width: "100%", marginTop: 20 }}>
      <MapContainer
        center={[startPoint.lat, startPoint.lng]}
        zoom={16}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />

        <Polyline positions={polylinePositions} />

        {/* Start marker */}
        <Marker position={[startPoint.lat, startPoint.lng]}>
          <Popup>
            <b>✅ Start</b>
            <br />
            ⏱ {startPoint.timestamp}
            <br />
            📍{" "}
            {addressMap[`${startPoint.lat},${startPoint.lng}`] ||
              "Fetching location..."}
          </Popup>
        </Marker>

        {/* End marker */}
        <Marker position={[endPoint.lat, endPoint.lng]}>
          <Popup>
            <b>🏁 End</b>
            <br />
            ⏱ {endPoint.timestamp}
            <br />
            📍{" "}
            {addressMap[`${endPoint.lat},${endPoint.lng}`] ||
              "Fetching location..."}
          </Popup>
        </Marker>

        {/* All points */}
        {routePoints.map((p) => (
          <Marker key={p.sl_no} position={[p.lat, p.lng]}>
            <Popup>
              <b>Point #{p.sl_no}</b>
              <br />
              ⏱ {p.timestamp}
              <br />
              📍{" "}
              {addressMap[`${p.lat},${p.lng}`] ||
                "Fetching location..."}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
