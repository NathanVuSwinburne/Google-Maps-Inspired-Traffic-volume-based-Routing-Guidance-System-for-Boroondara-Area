export function calcTravelTime(distanceKm: number, trafficVolume: number | null): number {
  const vol = trafficVolume != null && trafficVolume > 0 ? trafficVolume : 100;
  const a = -1.4648375;
  const b = 93.75;
  const c = -vol;
  const d = b * b - 4 * a * c;
  let speed = (-b - Math.sqrt(d)) / (2 * a);
  speed = Math.min(60, Math.max(5, speed));
  return (distanceKm / speed) * 60 + 0.5;
}
