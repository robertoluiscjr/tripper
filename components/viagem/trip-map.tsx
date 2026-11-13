"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { itemPinIcon, type TripItemDTO } from "@/lib/trip-items";
import type { MapPin } from "./trip-map-leaflet";

const LeafletMap = dynamic(() => import("./trip-map-leaflet"), {
  ssr: false,
  loading: () => <Skeleton className="size-full rounded-none" />,
});

// Sem coordenadas do destino: mostra o Brasil inteiro
const BRASIL = { lat: -14.24, lng: -51.93, zoom: 3 };

export function TripMap({
  latitude,
  longitude,
  items = [],
}: {
  latitude: number | null;
  longitude: number | null;
  /** Itens do roteiro: cada um com localização vira um pino */
  items?: TripItemDTO[];
}) {
  const hasCoords = latitude !== null && longitude !== null;
  const pins: MapPin[] = items.flatMap((item) =>
    item.latitude !== null && item.longitude !== null
      ? [{ id: item.id, lat: item.latitude, lng: item.longitude, icon: itemPinIcon(item), label: item.title }]
      : [],
  );
  // O Next 16 guarda páginas já visitadas escondidas (React <Activity>): ao esconder, o Leaflet
  // destrói o mapa; ao voltar, a TileLayer tentava usar o mapa destruído. Montar o mapa só
  // enquanto a página está visível faz o Leaflet recriar tudo do zero a cada volta.
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza com o ciclo do Leaflet (sistema externo)
    setVisible(true);
    return () => setVisible(false);
  }, []);

  return (
    <div className="relative isolate h-[226px] w-full overflow-hidden bg-tripper-light-300">
      {visible ? (
        <LeafletMap
          lat={hasCoords ? latitude : BRASIL.lat}
          lng={hasCoords ? longitude : BRASIL.lng}
          zoom={hasCoords ? 12 : BRASIL.zoom}
          pins={pins}
        />
      ) : (
        <Skeleton className="size-full rounded-none" />
      )}
      {!hasCoords && (
        <p className="pointer-events-none absolute inset-x-6 top-3 z-[500] rounded-full bg-white/90 px-3 py-1 text-center text-small text-muted-foreground shadow-sm">
          Não encontramos o destino no mapa — edite o nome da viagem
        </p>
      )}
    </div>
  );
}
