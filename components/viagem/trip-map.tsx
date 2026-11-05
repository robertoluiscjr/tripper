"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const LeafletMap = dynamic(() => import("./trip-map-leaflet"), {
  ssr: false,
  loading: () => <Skeleton className="size-full rounded-none" />,
});

// Sem coordenadas do destino: mostra o Brasil inteiro
const BRASIL = { lat: -14.24, lng: -51.93, zoom: 3 };

export function TripMap({ latitude, longitude }: { latitude: number | null; longitude: number | null }) {
  const hasCoords = latitude !== null && longitude !== null;
  return (
    <div className="relative isolate h-[226px] w-full overflow-hidden bg-tripper-light-300">
      <LeafletMap
        lat={hasCoords ? latitude : BRASIL.lat}
        lng={hasCoords ? longitude : BRASIL.lng}
        zoom={hasCoords ? 12 : BRASIL.zoom}
      />
      {!hasCoords && (
        <p className="pointer-events-none absolute inset-x-6 top-3 z-[500] rounded-full bg-white/90 px-3 py-1 text-center text-small text-muted-foreground shadow-sm">
          Não encontramos o destino no mapa — edite o nome da viagem
        </p>
      )}
    </div>
  );
}
