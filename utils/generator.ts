function pad(n) {
  return n.toString().padStart(2, "0");
}

function minutesToTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${pad(h)}:${pad(m)}`;
}
export type dersProgram = {
  type: "ders" | "tenefus" | "oglen_arasi";
  start: Date;
  index: number;
  end: Date;
};
export function toDateFromTimeString(timeStr: string) {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const date = new Date();
  date.setHours(hours);
  date.setMinutes(minutes);
  date.setSeconds(0);
  date.setMilliseconds(0);
  return date;
}
export function generateSchedule(config): dersProgram[] {
  const {
    ders_baslama,
    ders_sure,
    tenefus,
    oglen_arası_sure,
    toplam_ders,
    oglen_arası,
  } = config;

  const schedule = [];
  let current = Math.floor(ders_baslama / 100) * 60 + (ders_baslama % 100); // dakikaya çevir

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

    // Öğle arası mı?
    if (i === oglen_arası) {
      schedule.push({
        type: "oglen_arasi",
        start: minutesToTime(current),
        end: minutesToTime(current + oglen_arası_sure),
      });
      current += oglen_arası_sure;
    }
    // Son ders değilse teneffüs
    else if (i < toplam_ders) {
      schedule.push({
        type: "tenefus",
        start: minutesToTime(current),
        end: minutesToTime(current + tenefus),
      });
      current += tenefus;
    }
  }

  return schedule
    .map((item) => {
      let i = { ...item };
      i.start = toDateFromTimeString(item.start);
      i.end = toDateFromTimeString(item.end);
      return i;
    })
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .map((item, index) => ({ ...item, index: index + 1 }));
}
