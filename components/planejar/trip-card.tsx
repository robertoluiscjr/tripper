import Image from "next/image";
import Link from "next/link";
import { daysLabel, type TripDTO } from "@/lib/trips";

/**
 * "Card + Nome + Duração" do Figma (Planejar): foto 345 × 169 com raio 12,
 * nome 20px Medium e duração 14px Regular.
 */
export function TripCard({ trip, priority }: { trip: TripDTO; priority?: boolean }) {
  return (
    <Link href={`/app/viagens/${trip.id}`} className="group flex flex-col outline-none">
      <div className="relative aspect-[345/169] w-full overflow-hidden rounded-[12px] bg-tripper-light-500 ring-ring/50 group-focus-visible:ring-3">
        {trip.coverImage ? (
          <Image
            src={trip.coverImage}
            alt={`Foto de ${trip.destination ?? trip.name}`}
            fill
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            sizes="(max-width: 448px) 92vw, 400px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <CoverPlaceholder name={trip.name} />
        )}
      </div>
      <p className="mt-2 text-h5 leading-[1.2] font-medium text-foreground">{trip.name}</p>
      <p className="mt-1 text-p14 leading-[1.2] text-foreground">{daysLabel(trip.daysCount)}</p>
    </Link>
  );
}

/** Sem foto encontrada: gradiente da marca com a inicial do destino. */
function CoverPlaceholder({ name }: { name: string }) {
  return (
    <div className="flex size-full items-center justify-center bg-gradient-to-br from-tripper-blue-300 to-tripper-blue-700">
      <span className="text-[64px] font-semibold text-white/90">{name.trim().charAt(0).toUpperCase()}</span>
    </div>
  );
}
