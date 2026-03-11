export function formatPrice(price: number, perMonth = false): string {
  if (price >= 10000000) {
    return `NPR ${(price / 10000000).toFixed(1)}Cr${perMonth ? "/mo" : ""}`;
  } else if (price >= 100000) {
    return `NPR ${(price / 100000).toFixed(1)}L${perMonth ? "/mo" : ""}`;
  } else if (price >= 1000) {
    return `NPR ${(price / 1000).toFixed(0)}K${perMonth ? "/mo" : ""}`;
  }
  return `NPR ${price.toLocaleString()}${perMonth ? "/mo" : ""}`;
}

export function formatArea(dhur: number): string {
  return `${dhur} Dhur`;
}

export function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

export const SERVICE_TYPE_ICONS: Record<string, string> = {
  plumber: "droplets",
  brick_supplier: "layers",
  electrician: "zap",
  cement_supplier: "box",
  contractor: "hard-hat",
  hardware_store: "tool",
  sand_gravel_supplier: "mountain",
  tile_supplier: "grid",
  iron_supplier: "anchor",
  interior_designer: "home",
};

export const AMENITY_ICONS: Record<string, string> = {
  parking: "car",
  balcony: "sun",
  garden: "feather",
  water: "droplet",
  internet: "wifi",
  road_access: "map",
  solar: "sun",
  security: "shield",
  terrace: "home",
  lift: "arrow-up",
};
