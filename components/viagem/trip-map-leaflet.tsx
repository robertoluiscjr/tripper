"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useMemo } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";

export type MapPin = { id: string; lat: number; lng: number; icon: string; label: string };

/**
 * Mapa da cidade (Figma "Mapa da cidade", 393 × 226) com OpenStreetMap
 * (gratuito, sem chave). Carregado só no cliente.
 * Pinos = componente "Location (W200)" do Figma (2434:2905): gota azul de 36px com contorno
 * branco e o ícone do item (15px, branco) dentro.
 */
export default function TripMapLeaflet({ lat, lng, zoom, pins = [] }: { lat: number; lng: number; zoom: number; pins?: MapPin[] }) {
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
      {pins.map((pin) => (
        <PinMarker key={pin.id} pin={pin} />
      ))}
      <FitPins center={[lat, lng]} pins={pins} zoom={zoom} />
    </MapContainer>
  );
}

function PinMarker({ pin }: { pin: MapPin }) {
  const icon = useMemo(
    () =>
      L.divIcon({
        className: "", // sem o fundo branco padrão do Leaflet
        iconSize: [36, 36],
        iconAnchor: [18, 32], // ponta da gota
        // tamanhos via style: o CSS do Leaflet força width:auto nas imagens dos marcadores
        html: `<span style="position:relative;display:block;width:36px;height:36px">
          <img src="/icons/itens/pin.svg" alt="" style="display:block;width:36px;height:36px" />
          <img src="${pin.icon}" alt="" style="position:absolute;left:10.5px;top:9px;width:15px;height:15px" />
        </span>`,
      }),
    [pin.icon],
  );
  return <Marker position={[pin.lat, pin.lng]} icon={icon} title={pin.label} alt={pin.label} keyboard={false} />;
}

/** Enquadra o destino da viagem e todos os pinos (sem aproximar demais). */
function FitPins({ center, pins, zoom }: { center: [number, number]; pins: MapPin[]; zoom: number }) {
  const map = useMap();
  const key = pins.map((p) => `${p.lat},${p.lng}`).join("|");
  useEffect(() => {
    if (!pins.length) {
      map.setView(center, zoom);
      return;
    }
    const bounds = L.latLngBounds([center, ...pins.map((p) => [p.lat, p.lng] as [number, number])]);
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: zoom });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reenquadra só quando os pinos mudam
  }, [map, key]);
  return null;
}
