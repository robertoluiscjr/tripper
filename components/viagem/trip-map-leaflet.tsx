"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer } from "react-leaflet";

/**
 * Mapa da cidade (Figma "Mapa da cidade", 393 × 226) com OpenStreetMap
 * (gratuito, sem chave). Carregado só no cliente.
 */
export default function TripMapLeaflet({ lat, lng, zoom }: { lat: number; lng: number; zoom: number }) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={zoom}
      zoomControl={false}
      scrollWheelZoom={false}
      attributionControl
      className="size-full"
    >
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        maxZoom={19}
      />
    </MapContainer>
  );
}
