function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function minutesToTime(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${pad(h)}:${pad(m)}`;
}
export type dersProgram = {
  type: "ders" | "tenefus" | "oglen_arasi";
  start: string;
  index: number;
  end: string;
};
export function generateSchedule(config: any): dersProgram[] {
  const {
    ders_baslama,
    ders_sure,
    tenefus,
    oglen_arası_sure,
    toplam_ders,
    oglen_arası,
  } = config;

  const schedule: dersProgram[] = [];
  let current = Math.floor(ders_baslama / 100) * 60 + (ders_baslama % 100);

  for (let i = 1; i <= toplam_ders; i++) {
    // Ders
    const start = current;
    const end = current + ders_sure;
    schedule.push({
      type: "ders",
      index: i,
      start: minutesToTime(start),
      end: minutesToTime(end),
    });
    current = end;

    if (i === oglen_arası) {
      schedule.push({
        type: "oglen_arasi",
        start: minutesToTime(current),
        end: minutesToTime(current + oglen_arası_sure),
        index: 0,
      });
      current += oglen_arası_sure;
    } else if (i < toplam_ders) {
      schedule.push({
        type: "tenefus",
        start: minutesToTime(current),
        end: minutesToTime(current + tenefus),
        index: 0,
      });
      current += tenefus;
    }
  }

  return schedule as any;
}
