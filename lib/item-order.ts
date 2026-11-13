import { db } from "@/lib/db";

const hhmm = (d: Date | null) => (d ? d.toISOString().slice(11, 16) : "99:99");

/**
 * Posição de um item novo (ou que mudou de dia/horário) dentro do dia: antes do primeiro item
 * com horário mais tarde, respeitando a ordem que a pessoa definiu arrastando.
 * Renumera o dia (0, 1, 2…) abrindo espaço para ele.
 */
export async function slotByTime(tripId: string, day: number, startAt: Date | null, excludeId?: string) {
  const items = await db.tripItem.findMany({
    where: { tripId, dayNumber: day, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    select: { id: true, position: true, startAt: true },
  });
  const time = hhmm(startAt);
  let slot = items.findIndex((i) => hhmm(i.startAt) > time);
  if (slot === -1) slot = items.length;
  const updates = items
    .map((it, i) => ({ id: it.id, from: it.position, to: i < slot ? i : i + 1 }))
    .filter((u) => u.from !== u.to)
    .map((u) => db.tripItem.update({ where: { id: u.id }, data: { position: u.to } }));
  if (updates.length) await db.$transaction(updates);
  return slot;
}
