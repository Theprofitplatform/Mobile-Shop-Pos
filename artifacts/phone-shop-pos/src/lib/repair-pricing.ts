export interface RepairPriceItem {
  id: string;
  model: string;
  repairType: string;
  basePrice: number;
  partCost: number;
  estimatedTime: string;
}

export const REPAIR_TYPES = [
  { id: "Screen Replacement", label: "Screen" },
  { id: "Battery Replacement", label: "Battery" },
  { id: "Charging Port", label: "Port" },
  { id: "Back Glass", label: "Glass" },
  { id: "Other", label: "Other" },
  { id: "Diagnostic", label: "Diagnostic" },
] as const;

export const REPAIR_PRICING: RepairPriceItem[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // APPLE IPHONE (Aftermarket prices - OEM calculated at 40% markup in UI)
  // ═══════════════════════════════════════════════════════════════════════════

  // iPhone 17 Series (2025) - Estimated based on market trends
  { id: 'p17-1', model: 'iPhone 17 Pro Max', repairType: 'Screen Replacement', basePrice: 420, partCost: 280, estimatedTime: '1h 30m' },
  { id: 'p17-2', model: 'iPhone 17 Pro Max', repairType: 'Battery Replacement', basePrice: 179, partCost: 75, estimatedTime: '1h' },
  { id: 'p17-3', model: 'iPhone 17 Pro Max', repairType: 'Back Glass', basePrice: 249, partCost: 150, estimatedTime: '3h' },
  { id: 'p17-4', model: 'iPhone 17 Pro Max', repairType: 'Charging Port', basePrice: 189, partCost: 85, estimatedTime: '1h' },
  { id: 'p17-5', model: 'iPhone 17 Pro', repairType: 'Screen Replacement', basePrice: 399, partCost: 260, estimatedTime: '1h 30m' },
  { id: 'p17-6', model: 'iPhone 17 Pro', repairType: 'Battery Replacement', basePrice: 179, partCost: 75, estimatedTime: '1h' },
  { id: 'p17-7', model: 'iPhone 17 Pro', repairType: 'Back Glass', basePrice: 229, partCost: 140, estimatedTime: '3h' },
  { id: 'p17-8', model: 'iPhone 17 Pro', repairType: 'Charging Port', basePrice: 189, partCost: 85, estimatedTime: '1h' },
  { id: 'p17-9', model: 'iPhone 17 Plus', repairType: 'Screen Replacement', basePrice: 349, partCost: 220, estimatedTime: '1h' },
  { id: 'p17-10', model: 'iPhone 17 Plus', repairType: 'Battery Replacement', basePrice: 159, partCost: 65, estimatedTime: '1h' },
  { id: 'p17-11', model: 'iPhone 17', repairType: 'Screen Replacement', basePrice: 329, partCost: 200, estimatedTime: '1h' },
  { id: 'p17-12', model: 'iPhone 17', repairType: 'Battery Replacement', basePrice: 159, partCost: 65, estimatedTime: '1h' },

  // iPhone 16 Series (2024)
  { id: 'p16-1', model: 'iPhone 16 Pro Max', repairType: 'Screen Replacement', basePrice: 379, partCost: 250, estimatedTime: '1h 30m' },
  { id: 'p16-2', model: 'iPhone 16 Pro Max', repairType: 'Battery Replacement', basePrice: 169, partCost: 70, estimatedTime: '1h' },
  { id: 'p16-3', model: 'iPhone 16 Pro Max', repairType: 'Back Glass', basePrice: 229, partCost: 140, estimatedTime: '3h' },
  { id: 'p16-4', model: 'iPhone 16 Pro Max', repairType: 'Charging Port', basePrice: 169, partCost: 80, estimatedTime: '1h' },
  { id: 'p16-5', model: 'iPhone 16 Pro', repairType: 'Screen Replacement', basePrice: 349, partCost: 230, estimatedTime: '1h 30m' },
  { id: 'p16-6', model: 'iPhone 16 Pro', repairType: 'Battery Replacement', basePrice: 169, partCost: 70, estimatedTime: '1h' },
  { id: 'p16-7', model: 'iPhone 16 Pro', repairType: 'Back Glass', basePrice: 219, partCost: 130, estimatedTime: '3h' },
  { id: 'p16-8', model: 'iPhone 16 Pro', repairType: 'Charging Port', basePrice: 169, partCost: 80, estimatedTime: '1h' },
  { id: 'p16-9', model: 'iPhone 16 Plus', repairType: 'Screen Replacement', basePrice: 289, partCost: 180, estimatedTime: '1h' },
  { id: 'p16-10', model: 'iPhone 16 Plus', repairType: 'Battery Replacement', basePrice: 149, partCost: 55, estimatedTime: '1h' },
  { id: 'p16-11', model: 'iPhone 16', repairType: 'Screen Replacement', basePrice: 269, partCost: 170, estimatedTime: '1h' },
  { id: 'p16-12', model: 'iPhone 16', repairType: 'Battery Replacement', basePrice: 149, partCost: 55, estimatedTime: '1h' },
  { id: 'p16-13', model: 'iPhone 16', repairType: 'Back Glass', basePrice: 189, partCost: 110, estimatedTime: '3h' },
  { id: 'p16-14', model: 'iPhone 16', repairType: 'Charging Port', basePrice: 149, partCost: 65, estimatedTime: '1h' },

  // iPhone 15 Series
  { id: 'p15-1', model: 'iPhone 15 Pro Max', repairType: 'Screen Replacement', basePrice: 399, partCost: 260, estimatedTime: '1h' },
  { id: 'p15-2', model: 'iPhone 15 Pro Max', repairType: 'Battery Replacement', basePrice: 149, partCost: 60, estimatedTime: '1h' },
  { id: 'p15-3', model: 'iPhone 15 Pro Max', repairType: 'Back Glass', basePrice: 199, partCost: 120, estimatedTime: '3h' },
  { id: 'p15-4', model: 'iPhone 15 Pro Max', repairType: 'Charging Port', basePrice: 159, partCost: 70, estimatedTime: '1h' },
  { id: 'p15-5', model: 'iPhone 15 Pro', repairType: 'Screen Replacement', basePrice: 369, partCost: 240, estimatedTime: '1h' },
  { id: 'p15-6', model: 'iPhone 15 Pro', repairType: 'Battery Replacement', basePrice: 149, partCost: 60, estimatedTime: '1h' },
  { id: 'p15-7', model: 'iPhone 15 Pro', repairType: 'Back Glass', basePrice: 189, partCost: 110, estimatedTime: '3h' },
  { id: 'p15-8', model: 'iPhone 15 Pro', repairType: 'Charging Port', basePrice: 159, partCost: 70, estimatedTime: '1h' },
  { id: 'p15-9', model: 'iPhone 15 Plus', repairType: 'Screen Replacement', basePrice: 299, partCost: 190, estimatedTime: '1h' },
  { id: 'p15-10', model: 'iPhone 15 Plus', repairType: 'Battery Replacement', basePrice: 139, partCost: 50, estimatedTime: '1h' },
  { id: 'p15-11', model: 'iPhone 15', repairType: 'Screen Replacement', basePrice: 279, partCost: 170, estimatedTime: '1h' },
  { id: 'p15-12', model: 'iPhone 15', repairType: 'Battery Replacement', basePrice: 139, partCost: 50, estimatedTime: '1h' },
  { id: 'p15-13', model: 'iPhone 15', repairType: 'Back Glass', basePrice: 159, partCost: 90, estimatedTime: '3h' },
  { id: 'p15-14', model: 'iPhone 15', repairType: 'Charging Port', basePrice: 139, partCost: 60, estimatedTime: '1h' },

  // iPhone 14 Series
  { id: 'p14-1', model: 'iPhone 14 Pro Max', repairType: 'Screen Replacement', basePrice: 369, partCost: 240, estimatedTime: '1h' },
  { id: 'p14-2', model: 'iPhone 14 Pro Max', repairType: 'Battery Replacement', basePrice: 139, partCost: 55, estimatedTime: '1h' },
  { id: 'p14-3', model: 'iPhone 14 Pro Max', repairType: 'Back Glass', basePrice: 179, partCost: 110, estimatedTime: '3h' },
  { id: 'p14-4', model: 'iPhone 14 Pro Max', repairType: 'Charging Port', basePrice: 139, partCost: 55, estimatedTime: '1h' },
  { id: 'p14-5', model: 'iPhone 14 Pro', repairType: 'Screen Replacement', basePrice: 349, partCost: 220, estimatedTime: '1h' },
  { id: 'p14-6', model: 'iPhone 14 Pro', repairType: 'Battery Replacement', basePrice: 139, partCost: 55, estimatedTime: '1h' },
  { id: 'p14-7', model: 'iPhone 14 Pro', repairType: 'Back Glass', basePrice: 169, partCost: 100, estimatedTime: '3h' },
  { id: 'p14-8', model: 'iPhone 14 Pro', repairType: 'Charging Port', basePrice: 129, partCost: 50, estimatedTime: '1h' },
  { id: 'p14-9', model: 'iPhone 14 Plus', repairType: 'Screen Replacement', basePrice: 219, partCost: 130, estimatedTime: '1h' },
  { id: 'p14-10', model: 'iPhone 14 Plus', repairType: 'Battery Replacement', basePrice: 119, partCost: 45, estimatedTime: '45m' },
  { id: 'p14-11', model: 'iPhone 14', repairType: 'Screen Replacement', basePrice: 199, partCost: 120, estimatedTime: '45m' },
  { id: 'p14-12', model: 'iPhone 14', repairType: 'Battery Replacement', basePrice: 119, partCost: 45, estimatedTime: '45m' },
  { id: 'p14-13', model: 'iPhone 14', repairType: 'Back Glass', basePrice: 139, partCost: 75, estimatedTime: '3h' },
  { id: 'p14-14', model: 'iPhone 14', repairType: 'Charging Port', basePrice: 119, partCost: 45, estimatedTime: '45m' },

  // iPhone 13 Series
  { id: 'p13-1', model: 'iPhone 13 Pro Max', repairType: 'Screen Replacement', basePrice: 259, partCost: 160, estimatedTime: '45m' },
  { id: 'p13-2', model: 'iPhone 13 Pro Max', repairType: 'Battery Replacement', basePrice: 109, partCost: 45, estimatedTime: '45m' },
  { id: 'p13-3', model: 'iPhone 13 Pro Max', repairType: 'Back Glass', basePrice: 149, partCost: 90, estimatedTime: '3h' },
  { id: 'p13-4', model: 'iPhone 13 Pro Max', repairType: 'Charging Port', basePrice: 119, partCost: 45, estimatedTime: '45m' },
  { id: 'p13-5', model: 'iPhone 13 Pro', repairType: 'Screen Replacement', basePrice: 239, partCost: 150, estimatedTime: '45m' },
  { id: 'p13-6', model: 'iPhone 13 Pro', repairType: 'Battery Replacement', basePrice: 109, partCost: 45, estimatedTime: '45m' },
  { id: 'p13-7', model: 'iPhone 13 Pro', repairType: 'Back Glass', basePrice: 139, partCost: 80, estimatedTime: '3h' },
  { id: 'p13-8', model: 'iPhone 13 Pro', repairType: 'Charging Port', basePrice: 109, partCost: 40, estimatedTime: '45m' },
  { id: 'p13-9', model: 'iPhone 13', repairType: 'Screen Replacement', basePrice: 179, partCost: 110, estimatedTime: '45m' },
  { id: 'p13-10', model: 'iPhone 13', repairType: 'Battery Replacement', basePrice: 99, partCost: 40, estimatedTime: '30m' },
  { id: 'p13-11', model: 'iPhone 13', repairType: 'Back Glass', basePrice: 119, partCost: 65, estimatedTime: '3h' },
  { id: 'p13-12', model: 'iPhone 13', repairType: 'Charging Port', basePrice: 99, partCost: 35, estimatedTime: '45m' },
  { id: 'p13-13', model: 'iPhone 13 Mini', repairType: 'Screen Replacement', basePrice: 169, partCost: 100, estimatedTime: '45m' },
  { id: 'p13-14', model: 'iPhone 13 Mini', repairType: 'Battery Replacement', basePrice: 99, partCost: 40, estimatedTime: '30m' },

  // iPhone 12 Series
  { id: 'p12-1', model: 'iPhone 12 Pro Max', repairType: 'Screen Replacement', basePrice: 189, partCost: 115, estimatedTime: '45m' },
  { id: 'p12-2', model: 'iPhone 12 Pro Max', repairType: 'Battery Replacement', basePrice: 99, partCost: 40, estimatedTime: '30m' },
  { id: 'p12-3', model: 'iPhone 12 Pro Max', repairType: 'Back Glass', basePrice: 119, partCost: 70, estimatedTime: '3h' },
  { id: 'p12-4', model: 'iPhone 12 Pro Max', repairType: 'Charging Port', basePrice: 99, partCost: 35, estimatedTime: '45m' },
  { id: 'p12-5', model: 'iPhone 12 Pro', repairType: 'Screen Replacement', basePrice: 169, partCost: 100, estimatedTime: '45m' },
  { id: 'p12-6', model: 'iPhone 12 Pro', repairType: 'Battery Replacement', basePrice: 99, partCost: 40, estimatedTime: '30m' },
  { id: 'p12-7', model: 'iPhone 12 Pro', repairType: 'Back Glass', basePrice: 109, partCost: 60, estimatedTime: '3h' },
  { id: 'p12-8', model: 'iPhone 12', repairType: 'Screen Replacement', basePrice: 149, partCost: 90, estimatedTime: '45m' },
  { id: 'p12-9', model: 'iPhone 12', repairType: 'Battery Replacement', basePrice: 89, partCost: 35, estimatedTime: '30m' },
  { id: 'p12-10', model: 'iPhone 12', repairType: 'Back Glass', basePrice: 99, partCost: 55, estimatedTime: '3h' },
  { id: 'p12-11', model: 'iPhone 12', repairType: 'Charging Port', basePrice: 89, partCost: 30, estimatedTime: '45m' },
  { id: 'p12-12', model: 'iPhone 12 Mini', repairType: 'Screen Replacement', basePrice: 139, partCost: 80, estimatedTime: '45m' },
  { id: 'p12-13', model: 'iPhone 12 Mini', repairType: 'Battery Replacement', basePrice: 89, partCost: 35, estimatedTime: '30m' },

  // iPhone 11 Series
  { id: 'p11-1', model: 'iPhone 11 Pro Max', repairType: 'Screen Replacement', basePrice: 159, partCost: 95, estimatedTime: '40m' },
  { id: 'p11-2', model: 'iPhone 11 Pro Max', repairType: 'Battery Replacement', basePrice: 89, partCost: 35, estimatedTime: '30m' },
  { id: 'p11-3', model: 'iPhone 11 Pro Max', repairType: 'Back Glass', basePrice: 99, partCost: 55, estimatedTime: '3h' },
  { id: 'p11-4', model: 'iPhone 11 Pro Max', repairType: 'Charging Port', basePrice: 89, partCost: 30, estimatedTime: '45m' },
  { id: 'p11-5', model: 'iPhone 11 Pro', repairType: 'Screen Replacement', basePrice: 149, partCost: 85, estimatedTime: '40m' },
  { id: 'p11-6', model: 'iPhone 11 Pro', repairType: 'Battery Replacement', basePrice: 89, partCost: 35, estimatedTime: '30m' },
  { id: 'p11-7', model: 'iPhone 11 Pro', repairType: 'Back Glass', basePrice: 89, partCost: 50, estimatedTime: '3h' },
  { id: 'p11-8', model: 'iPhone 11', repairType: 'Screen Replacement', basePrice: 129, partCost: 70, estimatedTime: '30m' },
  { id: 'p11-9', model: 'iPhone 11', repairType: 'Battery Replacement', basePrice: 79, partCost: 30, estimatedTime: '20m' },
  { id: 'p11-10', model: 'iPhone 11', repairType: 'Back Glass', basePrice: 79, partCost: 45, estimatedTime: '3h' },
  { id: 'p11-11', model: 'iPhone 11', repairType: 'Charging Port', basePrice: 79, partCost: 25, estimatedTime: '45m' },

  // iPhone X/XS/XR Series
  { id: 'px-1', model: 'iPhone XS Max', repairType: 'Screen Replacement', basePrice: 149, partCost: 85, estimatedTime: '30m' },
  { id: 'px-2', model: 'iPhone XS Max', repairType: 'Battery Replacement', basePrice: 79, partCost: 30, estimatedTime: '20m' },
  { id: 'px-3', model: 'iPhone XS', repairType: 'Screen Replacement', basePrice: 139, partCost: 75, estimatedTime: '30m' },
  { id: 'px-4', model: 'iPhone XS', repairType: 'Battery Replacement', basePrice: 79, partCost: 30, estimatedTime: '20m' },
  { id: 'px-5', model: 'iPhone XR', repairType: 'Screen Replacement', basePrice: 119, partCost: 60, estimatedTime: '30m' },
  { id: 'px-6', model: 'iPhone XR', repairType: 'Battery Replacement', basePrice: 79, partCost: 25, estimatedTime: '20m' },
  { id: 'px-7', model: 'iPhone X', repairType: 'Screen Replacement', basePrice: 129, partCost: 70, estimatedTime: '30m' },
  { id: 'px-8', model: 'iPhone X', repairType: 'Battery Replacement', basePrice: 79, partCost: 25, estimatedTime: '20m' },
  { id: 'px-9', model: 'iPhone X', repairType: 'Charging Port', basePrice: 79, partCost: 20, estimatedTime: '45m' },

  // iPhone 8/7/6 Series
  { id: 'p8-1', model: 'iPhone 8 Plus', repairType: 'Screen Replacement', basePrice: 99, partCost: 45, estimatedTime: '30m' },
  { id: 'p8-2', model: 'iPhone 8 Plus', repairType: 'Battery Replacement', basePrice: 69, partCost: 25, estimatedTime: '20m' },
  { id: 'p8-3', model: 'iPhone 8', repairType: 'Screen Replacement', basePrice: 89, partCost: 40, estimatedTime: '30m' },
  { id: 'p8-4', model: 'iPhone 8', repairType: 'Battery Replacement', basePrice: 69, partCost: 25, estimatedTime: '20m' },
  { id: 'p7-1', model: 'iPhone 7 Plus', repairType: 'Screen Replacement', basePrice: 89, partCost: 40, estimatedTime: '30m' },
  { id: 'p7-2', model: 'iPhone 7 Plus', repairType: 'Battery Replacement', basePrice: 69, partCost: 20, estimatedTime: '20m' },
  { id: 'p7-3', model: 'iPhone 7', repairType: 'Screen Replacement', basePrice: 79, partCost: 35, estimatedTime: '30m' },
  { id: 'p7-4', model: 'iPhone 7', repairType: 'Battery Replacement', basePrice: 59, partCost: 18, estimatedTime: '20m' },
  { id: 'p6s-1', model: 'iPhone 6s Plus', repairType: 'Screen Replacement', basePrice: 79, partCost: 35, estimatedTime: '30m' },
  { id: 'p6s-2', model: 'iPhone 6s', repairType: 'Screen Replacement', basePrice: 69, partCost: 28, estimatedTime: '30m' },
  { id: 'p6-1', model: 'iPhone 6 Plus', repairType: 'Screen Replacement', basePrice: 69, partCost: 28, estimatedTime: '30m' },
  { id: 'p6-2', model: 'iPhone 6', repairType: 'Screen Replacement', basePrice: 59, partCost: 22, estimatedTime: '30m' },

  // iPhone SE
  { id: 'pse-1', model: 'iPhone SE (3rd Gen)', repairType: 'Screen Replacement', basePrice: 139, partCost: 75, estimatedTime: '30m' },
  { id: 'pse-2', model: 'iPhone SE (3rd Gen)', repairType: 'Battery Replacement', basePrice: 89, partCost: 35, estimatedTime: '25m' },
  { id: 'pse-3', model: 'iPhone SE (2nd Gen)', repairType: 'Screen Replacement', basePrice: 99, partCost: 50, estimatedTime: '30m' },
  { id: 'pse-4', model: 'iPhone SE (2nd Gen)', repairType: 'Battery Replacement', basePrice: 79, partCost: 28, estimatedTime: '20m' },

  // Other iPhone Models
  { id: 'pother-1', model: 'iPhone (Other Model)', repairType: 'Screen Replacement', basePrice: 149, partCost: 80, estimatedTime: '45m' },
  { id: 'pother-2', model: 'iPhone (Other Model)', repairType: 'Battery Replacement', basePrice: 89, partCost: 35, estimatedTime: '30m' },
  { id: 'pother-3', model: 'iPhone (Other Model)', repairType: 'Charging Port', basePrice: 89, partCost: 25, estimatedTime: '45m' },
  { id: 'pother-4', model: 'iPhone (Other Model)', repairType: 'Back Glass', basePrice: 99, partCost: 50, estimatedTime: '3h' },

  // ═══════════════════════════════════════════════════════════════════════════
  // SAMSUNG (Original OEM prices only)
  // ═══════════════════════════════════════════════════════════════════════════

  // Samsung S25 Series (2025)
  { id: 's25-1', model: 'Samsung Galaxy S25 Ultra', repairType: 'Screen Replacement', basePrice: 529, partCost: 350, estimatedTime: '1h 30m' },
  { id: 's25-2', model: 'Samsung Galaxy S25 Ultra', repairType: 'Battery Replacement', basePrice: 149, partCost: 55, estimatedTime: '1h' },
  { id: 's25-3', model: 'Samsung Galaxy S25 Ultra', repairType: 'Back Glass', basePrice: 129, partCost: 45, estimatedTime: '2h' },
  { id: 's25-4', model: 'Samsung Galaxy S25 Ultra', repairType: 'Charging Port', basePrice: 139, partCost: 35, estimatedTime: '1h' },
  { id: 's25-5', model: 'Samsung Galaxy S25+', repairType: 'Screen Replacement', basePrice: 399, partCost: 250, estimatedTime: '1h' },
  { id: 's25-6', model: 'Samsung Galaxy S25+', repairType: 'Battery Replacement', basePrice: 149, partCost: 55, estimatedTime: '1h' },
  { id: 's25-7', model: 'Samsung Galaxy S25+', repairType: 'Back Glass', basePrice: 129, partCost: 45, estimatedTime: '2h' },
  { id: 's25-8', model: 'Samsung Galaxy S25+', repairType: 'Charging Port', basePrice: 139, partCost: 35, estimatedTime: '1h' },
  { id: 's25-9', model: 'Samsung Galaxy S25', repairType: 'Screen Replacement', basePrice: 349, partCost: 200, estimatedTime: '1h' },
  { id: 's25-10', model: 'Samsung Galaxy S25', repairType: 'Battery Replacement', basePrice: 149, partCost: 55, estimatedTime: '1h' },
  { id: 's25-11', model: 'Samsung Galaxy S25', repairType: 'Back Glass', basePrice: 129, partCost: 45, estimatedTime: '2h' },
  { id: 's25-12', model: 'Samsung Galaxy S25', repairType: 'Charging Port', basePrice: 139, partCost: 35, estimatedTime: '1h' },
  { id: 's25-13', model: 'Samsung Galaxy S25 FE', repairType: 'Screen Replacement', basePrice: 279, partCost: 160, estimatedTime: '1h' },

  // Samsung S24 Series
  { id: 's24-1', model: 'Samsung Galaxy S24 Ultra', repairType: 'Screen Replacement', basePrice: 449, partCost: 290, estimatedTime: '1h 30m' },
  { id: 's24-2', model: 'Samsung Galaxy S24 Ultra', repairType: 'Battery Replacement', basePrice: 149, partCost: 55, estimatedTime: '1h' },
  { id: 's24-3', model: 'Samsung Galaxy S24 Ultra', repairType: 'Back Glass', basePrice: 129, partCost: 45, estimatedTime: '2h' },
  { id: 's24-4', model: 'Samsung Galaxy S24 Ultra', repairType: 'Charging Port', basePrice: 139, partCost: 35, estimatedTime: '1h' },
  { id: 's24-5', model: 'Samsung Galaxy S24+', repairType: 'Screen Replacement', basePrice: 349, partCost: 210, estimatedTime: '1h' },
  { id: 's24-6', model: 'Samsung Galaxy S24+', repairType: 'Battery Replacement', basePrice: 149, partCost: 55, estimatedTime: '1h' },
  { id: 's24-7', model: 'Samsung Galaxy S24+', repairType: 'Back Glass', basePrice: 129, partCost: 45, estimatedTime: '2h' },
  { id: 's24-8', model: 'Samsung Galaxy S24+', repairType: 'Charging Port', basePrice: 139, partCost: 35, estimatedTime: '1h' },
  { id: 's24-9', model: 'Samsung Galaxy S24', repairType: 'Screen Replacement', basePrice: 329, partCost: 190, estimatedTime: '1h' },
  { id: 's24-10', model: 'Samsung Galaxy S24', repairType: 'Battery Replacement', basePrice: 149, partCost: 55, estimatedTime: '1h' },
  { id: 's24-11', model: 'Samsung Galaxy S24', repairType: 'Back Glass', basePrice: 129, partCost: 45, estimatedTime: '2h' },
  { id: 's24-12', model: 'Samsung Galaxy S24', repairType: 'Charging Port', basePrice: 139, partCost: 35, estimatedTime: '1h' },
  { id: 's24-13', model: 'Samsung Galaxy S24 FE', repairType: 'Screen Replacement', basePrice: 249, partCost: 140, estimatedTime: '1h' },

  // Samsung S23 Series
  { id: 's23-1', model: 'Samsung Galaxy S23 Ultra', repairType: 'Screen Replacement', basePrice: 449, partCost: 280, estimatedTime: '1h 30m' },
  { id: 's23-2', model: 'Samsung Galaxy S23 Ultra', repairType: 'Battery Replacement', basePrice: 149, partCost: 50, estimatedTime: '1h' },
  { id: 's23-3', model: 'Samsung Galaxy S23 Ultra', repairType: 'Back Glass', basePrice: 149, partCost: 40, estimatedTime: '2h' },
  { id: 's23-4', model: 'Samsung Galaxy S23 Ultra', repairType: 'Charging Port', basePrice: 119, partCost: 35, estimatedTime: '1h' },
  { id: 's23-5', model: 'Samsung Galaxy S23+', repairType: 'Screen Replacement', basePrice: 329, partCost: 190, estimatedTime: '1h' },
  { id: 's23-6', model: 'Samsung Galaxy S23+', repairType: 'Battery Replacement', basePrice: 149, partCost: 50, estimatedTime: '1h' },
  { id: 's23-7', model: 'Samsung Galaxy S23+', repairType: 'Charging Port', basePrice: 119, partCost: 35, estimatedTime: '1h' },
  { id: 's23-8', model: 'Samsung Galaxy S23', repairType: 'Screen Replacement', basePrice: 299, partCost: 175, estimatedTime: '1h' },
  { id: 's23-9', model: 'Samsung Galaxy S23', repairType: 'Battery Replacement', basePrice: 149, partCost: 50, estimatedTime: '1h' },
  { id: 's23-10', model: 'Samsung Galaxy S23', repairType: 'Charging Port', basePrice: 119, partCost: 35, estimatedTime: '1h' },
  { id: 's23-11', model: 'Samsung Galaxy S23 FE', repairType: 'Screen Replacement', basePrice: 249, partCost: 140, estimatedTime: '1h' },

  // Samsung S22 Series
  { id: 's22-1', model: 'Samsung Galaxy S22 Ultra', repairType: 'Screen Replacement', basePrice: 449, partCost: 280, estimatedTime: '1h 30m' },
  { id: 's22-2', model: 'Samsung Galaxy S22 Ultra', repairType: 'Battery Replacement', basePrice: 149, partCost: 45, estimatedTime: '1h' },
  { id: 's22-3', model: 'Samsung Galaxy S22 Ultra', repairType: 'Charging Port', basePrice: 149, partCost: 35, estimatedTime: '1h' },
  { id: 's22-4', model: 'Samsung Galaxy S22+', repairType: 'Screen Replacement', basePrice: 329, partCost: 190, estimatedTime: '1h' },
  { id: 's22-5', model: 'Samsung Galaxy S22+', repairType: 'Battery Replacement', basePrice: 149, partCost: 45, estimatedTime: '1h' },
  { id: 's22-6', model: 'Samsung Galaxy S22', repairType: 'Screen Replacement', basePrice: 299, partCost: 170, estimatedTime: '1h' },
  { id: 's22-7', model: 'Samsung Galaxy S22', repairType: 'Battery Replacement', basePrice: 149, partCost: 45, estimatedTime: '1h' },
  { id: 's22-8', model: 'Samsung Galaxy S22', repairType: 'Charging Port', basePrice: 119, partCost: 35, estimatedTime: '1h' },
  { id: 's22-9', model: 'Samsung Galaxy S22 FE', repairType: 'Screen Replacement', basePrice: 229, partCost: 130, estimatedTime: '1h' },

  // Samsung S21 Series
  { id: 's21-1', model: 'Samsung Galaxy S21 Ultra', repairType: 'Screen Replacement', basePrice: 349, partCost: 210, estimatedTime: '1h' },
  { id: 's21-2', model: 'Samsung Galaxy S21 Ultra', repairType: 'Battery Replacement', basePrice: 139, partCost: 40, estimatedTime: '1h' },
  { id: 's21-3', model: 'Samsung Galaxy S21 Ultra', repairType: 'Charging Port', basePrice: 149, partCost: 35, estimatedTime: '1h' },
  { id: 's21-4', model: 'Samsung Galaxy S21+', repairType: 'Screen Replacement', basePrice: 299, partCost: 170, estimatedTime: '1h' },
  { id: 's21-5', model: 'Samsung Galaxy S21+', repairType: 'Battery Replacement', basePrice: 119, partCost: 38, estimatedTime: '1h' },
  { id: 's21-6', model: 'Samsung Galaxy S21', repairType: 'Screen Replacement', basePrice: 279, partCost: 155, estimatedTime: '1h' },
  { id: 's21-7', model: 'Samsung Galaxy S21', repairType: 'Battery Replacement', basePrice: 119, partCost: 38, estimatedTime: '1h' },
  { id: 's21-8', model: 'Samsung Galaxy S21', repairType: 'Charging Port', basePrice: 149, partCost: 35, estimatedTime: '1h' },
  { id: 's21-9', model: 'Samsung Galaxy S21 FE', repairType: 'Screen Replacement', basePrice: 249, partCost: 140, estimatedTime: '1h' },

  // Samsung S20 Series
  { id: 's20-1', model: 'Samsung Galaxy S20 Ultra', repairType: 'Screen Replacement', basePrice: 299, partCost: 175, estimatedTime: '1h' },
  { id: 's20-2', model: 'Samsung Galaxy S20 Ultra', repairType: 'Battery Replacement', basePrice: 119, partCost: 38, estimatedTime: '1h' },
  { id: 's20-3', model: 'Samsung Galaxy S20+', repairType: 'Screen Replacement', basePrice: 269, partCost: 155, estimatedTime: '1h' },
  { id: 's20-4', model: 'Samsung Galaxy S20', repairType: 'Screen Replacement', basePrice: 249, partCost: 140, estimatedTime: '1h' },
  { id: 's20-5', model: 'Samsung Galaxy S20 FE', repairType: 'Screen Replacement', basePrice: 199, partCost: 110, estimatedTime: '1h' },

  // Samsung Z Fold Series (Original prices)
  { id: 'sz-1', model: 'Samsung Galaxy Z Fold 6', repairType: 'Screen Replacement', basePrice: 899, partCost: 580, estimatedTime: '2h' },
  { id: 'sz-2', model: 'Samsung Galaxy Z Fold 6', repairType: 'Battery Replacement', basePrice: 199, partCost: 90, estimatedTime: '1h 30m' },
  { id: 'sz-3', model: 'Samsung Galaxy Z Fold 6', repairType: 'Back Glass', basePrice: 99, partCost: 45, estimatedTime: '1h' },
  { id: 'sz-4', model: 'Samsung Galaxy Z Fold 6', repairType: 'Charging Port', basePrice: 139, partCost: 40, estimatedTime: '1h' },
  { id: 'sz-5', model: 'Samsung Galaxy Z Fold 5', repairType: 'Screen Replacement', basePrice: 929, partCost: 560, estimatedTime: '2h' },
  { id: 'sz-6', model: 'Samsung Galaxy Z Fold 5', repairType: 'Battery Replacement', basePrice: 199, partCost: 85, estimatedTime: '1h 30m' },
  { id: 'sz-7', model: 'Samsung Galaxy Z Fold 5', repairType: 'Back Glass', basePrice: 149, partCost: 45, estimatedTime: '1h' },
  { id: 'sz-8', model: 'Samsung Galaxy Z Fold 4', repairType: 'Screen Replacement', basePrice: 849, partCost: 520, estimatedTime: '2h' },
  { id: 'sz-9', model: 'Samsung Galaxy Z Fold 3', repairType: 'Screen Replacement', basePrice: 749, partCost: 460, estimatedTime: '2h' },

  // Samsung Z Flip Series (Original prices)
  { id: 'szf-1', model: 'Samsung Galaxy Z Flip 6', repairType: 'Screen Replacement', basePrice: 649, partCost: 380, estimatedTime: '1h 30m' },
  { id: 'szf-2', model: 'Samsung Galaxy Z Flip 6', repairType: 'Battery Replacement', basePrice: 250, partCost: 85, estimatedTime: '1h' },
  { id: 'szf-3', model: 'Samsung Galaxy Z Flip 6', repairType: 'Back Glass', basePrice: 139, partCost: 45, estimatedTime: '1h' },
  { id: 'szf-4', model: 'Samsung Galaxy Z Flip 6', repairType: 'Charging Port', basePrice: 139, partCost: 35, estimatedTime: '1h' },
  { id: 'szf-5', model: 'Samsung Galaxy Z Flip 5', repairType: 'Screen Replacement', basePrice: 599, partCost: 340, estimatedTime: '1h 30m' },
  { id: 'szf-6', model: 'Samsung Galaxy Z Flip 5', repairType: 'Battery Replacement', basePrice: 179, partCost: 75, estimatedTime: '1h' },
  { id: 'szf-7', model: 'Samsung Galaxy Z Flip 4', repairType: 'Screen Replacement', basePrice: 549, partCost: 310, estimatedTime: '1h 30m' },
  { id: 'szf-8', model: 'Samsung Galaxy Z Flip 3', repairType: 'Screen Replacement', basePrice: 449, partCost: 260, estimatedTime: '1h 30m' },

  // Samsung A Series (Original prices)
  { id: 'sa-1', model: 'Samsung Galaxy A54 5G', repairType: 'Screen Replacement', basePrice: 250, partCost: 130, estimatedTime: '1h' },
  { id: 'sa-2', model: 'Samsung Galaxy A54 5G', repairType: 'Battery Replacement', basePrice: 119, partCost: 35, estimatedTime: '45m' },
  { id: 'sa-3', model: 'Samsung Galaxy A54 5G', repairType: 'Back Glass', basePrice: 99, partCost: 30, estimatedTime: '1h' },
  { id: 'sa-4', model: 'Samsung Galaxy A54 5G', repairType: 'Charging Port', basePrice: 99, partCost: 25, estimatedTime: '45m' },
  { id: 'sa-5', model: 'Samsung Galaxy A53 5G', repairType: 'Screen Replacement', basePrice: 219, partCost: 115, estimatedTime: '1h' },
  { id: 'sa-6', model: 'Samsung Galaxy A53 5G', repairType: 'Battery Replacement', basePrice: 119, partCost: 35, estimatedTime: '45m' },
  { id: 'sa-7', model: 'Samsung Galaxy A34 5G', repairType: 'Screen Replacement', basePrice: 199, partCost: 105, estimatedTime: '1h' },
  { id: 'sa-8', model: 'Samsung Galaxy A34 5G', repairType: 'Battery Replacement', basePrice: 119, partCost: 35, estimatedTime: '45m' },
  { id: 'sa-9', model: 'Samsung Galaxy A24', repairType: 'Screen Replacement', basePrice: 179, partCost: 90, estimatedTime: '1h' },
  { id: 'sa-10', model: 'Samsung Galaxy A24', repairType: 'Battery Replacement', basePrice: 119, partCost: 35, estimatedTime: '45m' },
  { id: 'sa-11', model: 'Samsung Galaxy A55 5G', repairType: 'Screen Replacement', basePrice: 269, partCost: 145, estimatedTime: '1h' },
  { id: 'sa-12', model: 'Samsung Galaxy A35 5G', repairType: 'Screen Replacement', basePrice: 219, partCost: 120, estimatedTime: '1h' },
  { id: 'sa-13', model: 'Samsung Galaxy A25 5G', repairType: 'Screen Replacement', basePrice: 179, partCost: 95, estimatedTime: '1h' },
  { id: 'sa-14', model: 'Samsung Galaxy A15 5G', repairType: 'Screen Replacement', basePrice: 149, partCost: 75, estimatedTime: '45m' },
  { id: 'sa-15', model: 'Samsung Galaxy A14', repairType: 'Screen Replacement', basePrice: 139, partCost: 65, estimatedTime: '45m' },
  { id: 'sa-16', model: 'Samsung Galaxy A13', repairType: 'Screen Replacement', basePrice: 129, partCost: 60, estimatedTime: '45m' },

  // Other Samsung Models
  { id: 'sother-1', model: 'Samsung (Other Model)', repairType: 'Screen Replacement', basePrice: 199, partCost: 100, estimatedTime: '1h' },
  { id: 'sother-2', model: 'Samsung (Other Model)', repairType: 'Battery Replacement', basePrice: 119, partCost: 40, estimatedTime: '45m' },
  { id: 'sother-3', model: 'Samsung (Other Model)', repairType: 'Charging Port', basePrice: 99, partCost: 30, estimatedTime: '1h' },
  { id: 'sother-4', model: 'Samsung (Other Model)', repairType: 'Back Glass', basePrice: 99, partCost: 35, estimatedTime: '1h' },

  // ═══════════════════════════════════════════════════════════════════════════
  // GOOGLE PIXEL (Original OEM prices only)
  // ═══════════════════════════════════════════════════════════════════════════

  { id: 'pix-1', model: 'Google Pixel 9 Pro', repairType: 'Screen Replacement', basePrice: 279, partCost: 320, estimatedTime: '1h' },
  { id: 'pix-2', model: 'Google Pixel 9 Pro', repairType: 'Battery Replacement', basePrice: 149, partCost: 80, estimatedTime: '1h' },
  { id: 'pix-3', model: 'Google Pixel 9 Pro', repairType: 'Charging Port', basePrice: 139, partCost: 55, estimatedTime: '1h' },
  { id: 'pix-4', model: 'Google Pixel 9', repairType: 'Screen Replacement', basePrice: 279, partCost: 300, estimatedTime: '1h' },
  { id: 'pix-5', model: 'Google Pixel 9', repairType: 'Battery Replacement', basePrice: 149, partCost: 80, estimatedTime: '1h' },
  { id: 'pix-6', model: 'Google Pixel 8 Pro', repairType: 'Screen Replacement', basePrice: 335, partCost: 280, estimatedTime: '1h' },
  { id: 'pix-7', model: 'Google Pixel 8 Pro', repairType: 'Battery Replacement', basePrice: 149, partCost: 82, estimatedTime: '1h' },
  { id: 'pix-8', model: 'Google Pixel 8 Pro', repairType: 'Charging Port', basePrice: 199, partCost: 70, estimatedTime: '1h' },
  { id: 'pix-9', model: 'Google Pixel 8', repairType: 'Screen Replacement', basePrice: 245, partCost: 210, estimatedTime: '1h' },
  { id: 'pix-10', model: 'Google Pixel 8', repairType: 'Battery Replacement', basePrice: 149, partCost: 82, estimatedTime: '1h' },
  { id: 'pix-11', model: 'Google Pixel 8', repairType: 'Charging Port', basePrice: 199, partCost: 70, estimatedTime: '1h' },
  { id: 'pix-12', model: 'Google Pixel 7 Pro', repairType: 'Screen Replacement', basePrice: 279, partCost: 280, estimatedTime: '1h' },
  { id: 'pix-13', model: 'Google Pixel 7 Pro', repairType: 'Battery Replacement', basePrice: 229, partCost: 80, estimatedTime: '1h' },
  { id: 'pix-14', model: 'Google Pixel 7 Pro', repairType: 'Charging Port', basePrice: 199, partCost: 60, estimatedTime: '1h' },
  { id: 'pix-15', model: 'Google Pixel 7', repairType: 'Screen Replacement', basePrice: 265, partCost: 210, estimatedTime: '1h' },
  { id: 'pix-16', model: 'Google Pixel 7', repairType: 'Battery Replacement', basePrice: 199, partCost: 80, estimatedTime: '1h' },
  { id: 'pix-17', model: 'Google Pixel 7a', repairType: 'Screen Replacement', basePrice: 229, partCost: 160, estimatedTime: '1h' },
  { id: 'pix-18', model: 'Google Pixel 6 Pro', repairType: 'Screen Replacement', basePrice: 279, partCost: 270, estimatedTime: '1h' },
  { id: 'pix-19', model: 'Google Pixel 6 Pro', repairType: 'Battery Replacement', basePrice: 149, partCost: 75, estimatedTime: '1h' },
  { id: 'pix-20', model: 'Google Pixel 6', repairType: 'Screen Replacement', basePrice: 299, partCost: 245, estimatedTime: '1h' },
  { id: 'pix-21', model: 'Google Pixel 6', repairType: 'Battery Replacement', basePrice: 139, partCost: 75, estimatedTime: '1h' },
  { id: 'pix-22', model: 'Google Pixel 6a', repairType: 'Screen Replacement', basePrice: 229, partCost: 160, estimatedTime: '1h' },

  // Other Google Pixel Models
  { id: 'pixother-1', model: 'Google Pixel (Other Model)', repairType: 'Screen Replacement', basePrice: 249, partCost: 150, estimatedTime: '1h' },
  { id: 'pixother-2', model: 'Google Pixel (Other Model)', repairType: 'Battery Replacement', basePrice: 149, partCost: 70, estimatedTime: '45m' },
  { id: 'pixother-3', model: 'Google Pixel (Other Model)', repairType: 'Charging Port', basePrice: 149, partCost: 55, estimatedTime: '1h' },

  // ═══════════════════════════════════════════════════════════════════════════
  // OPPO (Original OEM prices only)
  // ═══════════════════════════════════════════════════════════════════════════

  { id: 'opp-1', model: 'OPPO Find X5 Pro', repairType: 'Screen Replacement', basePrice: 499, partCost: 320, estimatedTime: '1h' },
  { id: 'opp-2', model: 'OPPO Find X5 Pro', repairType: 'Battery Replacement', basePrice: 199, partCost: 80, estimatedTime: '1h' },
  { id: 'opp-3', model: 'OPPO Find X5 Pro', repairType: 'Charging Port', basePrice: 180, partCost: 55, estimatedTime: '1h' },
  { id: 'opp-4', model: 'OPPO Find X5', repairType: 'Screen Replacement', basePrice: 399, partCost: 250, estimatedTime: '1h' },
  { id: 'opp-5', model: 'OPPO Reno 10 5G', repairType: 'Screen Replacement', basePrice: 299, partCost: 165, estimatedTime: '1h' },
  { id: 'opp-6', model: 'OPPO Reno 10 5G', repairType: 'Battery Replacement', basePrice: 149, partCost: 55, estimatedTime: '45m' },
  { id: 'opp-7', model: 'OPPO Reno 8 5G', repairType: 'Screen Replacement', basePrice: 269, partCost: 145, estimatedTime: '1h' },
  { id: 'opp-8', model: 'OPPO A98 5G', repairType: 'Screen Replacement', basePrice: 229, partCost: 110, estimatedTime: '45m' },
  { id: 'opp-9', model: 'OPPO A98 5G', repairType: 'Battery Replacement', basePrice: 149, partCost: 50, estimatedTime: '45m' },
  { id: 'opp-10', model: 'OPPO A78 5G', repairType: 'Screen Replacement', basePrice: 180, partCost: 85, estimatedTime: '45m' },
  { id: 'opp-11', model: 'OPPO A78 5G', repairType: 'Battery Replacement', basePrice: 149, partCost: 50, estimatedTime: '45m' },
  { id: 'opp-12', model: 'OPPO A54', repairType: 'Screen Replacement', basePrice: 149, partCost: 65, estimatedTime: '45m' },

  // Other OPPO Models
  { id: 'oppother-1', model: 'OPPO (Other Model)', repairType: 'Screen Replacement', basePrice: 199, partCost: 100, estimatedTime: '1h' },
  { id: 'oppother-2', model: 'OPPO (Other Model)', repairType: 'Battery Replacement', basePrice: 129, partCost: 50, estimatedTime: '45m' },
  { id: 'oppother-3', model: 'OPPO (Other Model)', repairType: 'Charging Port', basePrice: 129, partCost: 40, estimatedTime: '45m' },

  // ═══════════════════════════════════════════════════════════════════════════
  // MOTOROLA (Original OEM prices only)
  // ═══════════════════════════════════════════════════════════════════════════

  { id: 'moto-1', model: 'Motorola Moto G84 5G', repairType: 'Screen Replacement', basePrice: 199, partCost: 100, estimatedTime: '1h' },
  { id: 'moto-2', model: 'Motorola Moto G84 5G', repairType: 'Battery Replacement', basePrice: 99, partCost: 40, estimatedTime: '45m' },
  { id: 'moto-3', model: 'Motorola Moto G54 5G', repairType: 'Screen Replacement', basePrice: 179, partCost: 85, estimatedTime: '1h' },
  { id: 'moto-4', model: 'Motorola Edge 40', repairType: 'Screen Replacement', basePrice: 299, partCost: 170, estimatedTime: '1h' },
  { id: 'moto-5', model: 'Motorola Razr 40 Ultra', repairType: 'Screen Replacement', basePrice: 649, partCost: 420, estimatedTime: '1h 30m' },

  // Other Motorola Models
  { id: 'motoother-1', model: 'Motorola (Other Model)', repairType: 'Screen Replacement', basePrice: 179, partCost: 85, estimatedTime: '1h' },
  { id: 'motoother-2', model: 'Motorola (Other Model)', repairType: 'Battery Replacement', basePrice: 99, partCost: 40, estimatedTime: '45m' },

  // ═══════════════════════════════════════════════════════════════════════════
  // XIAOMI (Popular in Australia - OEM prices)
  // ═══════════════════════════════════════════════════════════════════════════

  // Xiaomi 14 Series (2024)
  { id: 'xi14-1', model: 'Xiaomi 14 Ultra', repairType: 'Screen Replacement', basePrice: 449, partCost: 290, estimatedTime: '1h 30m' },
  { id: 'xi14-2', model: 'Xiaomi 14 Ultra', repairType: 'Battery Replacement', basePrice: 149, partCost: 55, estimatedTime: '1h' },
  { id: 'xi14-3', model: 'Xiaomi 14 Pro', repairType: 'Screen Replacement', basePrice: 379, partCost: 240, estimatedTime: '1h' },
  { id: 'xi14-4', model: 'Xiaomi 14 Pro', repairType: 'Battery Replacement', basePrice: 139, partCost: 50, estimatedTime: '1h' },
  { id: 'xi14-5', model: 'Xiaomi 14', repairType: 'Screen Replacement', basePrice: 299, partCost: 180, estimatedTime: '1h' },
  { id: 'xi14-6', model: 'Xiaomi 14', repairType: 'Battery Replacement', basePrice: 129, partCost: 45, estimatedTime: '45m' },

  // Xiaomi 13 Series (2023)
  { id: 'xi13-1', model: 'Xiaomi 13 Pro', repairType: 'Screen Replacement', basePrice: 349, partCost: 220, estimatedTime: '1h' },
  { id: 'xi13-2', model: 'Xiaomi 13 Pro', repairType: 'Battery Replacement', basePrice: 129, partCost: 45, estimatedTime: '1h' },
  { id: 'xi13-3', model: 'Xiaomi 13', repairType: 'Screen Replacement', basePrice: 279, partCost: 165, estimatedTime: '1h' },
  { id: 'xi13-4', model: 'Xiaomi 13', repairType: 'Battery Replacement', basePrice: 119, partCost: 40, estimatedTime: '45m' },
  { id: 'xi13-5', model: 'Xiaomi 13 Lite', repairType: 'Screen Replacement', basePrice: 199, partCost: 110, estimatedTime: '45m' },
  { id: 'xi13-6', model: 'Xiaomi 13 Lite', repairType: 'Battery Replacement', basePrice: 99, partCost: 35, estimatedTime: '45m' },

  // Redmi Note Series
  { id: 'rn-1', model: 'Redmi Note 13 Pro+ 5G', repairType: 'Screen Replacement', basePrice: 229, partCost: 130, estimatedTime: '1h' },
  { id: 'rn-2', model: 'Redmi Note 13 Pro+ 5G', repairType: 'Battery Replacement', basePrice: 109, partCost: 38, estimatedTime: '45m' },
  { id: 'rn-3', model: 'Redmi Note 13 Pro 5G', repairType: 'Screen Replacement', basePrice: 199, partCost: 110, estimatedTime: '1h' },
  { id: 'rn-4', model: 'Redmi Note 13 Pro 5G', repairType: 'Battery Replacement', basePrice: 99, partCost: 35, estimatedTime: '45m' },
  { id: 'rn-5', model: 'Redmi Note 13 5G', repairType: 'Screen Replacement', basePrice: 169, partCost: 90, estimatedTime: '45m' },
  { id: 'rn-6', model: 'Redmi Note 13 5G', repairType: 'Battery Replacement', basePrice: 89, partCost: 30, estimatedTime: '45m' },
  { id: 'rn-7', model: 'Redmi Note 12 Pro+ 5G', repairType: 'Screen Replacement', basePrice: 199, partCost: 105, estimatedTime: '1h' },
  { id: 'rn-8', model: 'Redmi Note 12 Pro 5G', repairType: 'Screen Replacement', basePrice: 179, partCost: 95, estimatedTime: '45m' },
  { id: 'rn-9', model: 'Redmi Note 12 5G', repairType: 'Screen Replacement', basePrice: 149, partCost: 75, estimatedTime: '45m' },

  // POCO Series
  { id: 'poco-1', model: 'POCO F6 Pro', repairType: 'Screen Replacement', basePrice: 249, partCost: 145, estimatedTime: '1h' },
  { id: 'poco-2', model: 'POCO F6 Pro', repairType: 'Battery Replacement', basePrice: 119, partCost: 42, estimatedTime: '45m' },
  { id: 'poco-3', model: 'POCO F6', repairType: 'Screen Replacement', basePrice: 199, partCost: 110, estimatedTime: '1h' },
  { id: 'poco-4', model: 'POCO F6', repairType: 'Battery Replacement', basePrice: 99, partCost: 35, estimatedTime: '45m' },
  { id: 'poco-5', model: 'POCO X6 Pro 5G', repairType: 'Screen Replacement', basePrice: 189, partCost: 100, estimatedTime: '1h' },
  { id: 'poco-6', model: 'POCO X6 5G', repairType: 'Screen Replacement', basePrice: 169, partCost: 85, estimatedTime: '45m' },
  { id: 'poco-7', model: 'POCO M6 Pro', repairType: 'Screen Replacement', basePrice: 149, partCost: 70, estimatedTime: '45m' },

  // Other Xiaomi Models
  { id: 'xiother-1', model: 'Xiaomi (Other Model)', repairType: 'Screen Replacement', basePrice: 199, partCost: 100, estimatedTime: '1h' },
  { id: 'xiother-2', model: 'Xiaomi (Other Model)', repairType: 'Battery Replacement', basePrice: 109, partCost: 38, estimatedTime: '45m' },
  { id: 'xiother-3', model: 'Xiaomi (Other Model)', repairType: 'Charging Port', basePrice: 99, partCost: 30, estimatedTime: '45m' },

  // ═══════════════════════════════════════════════════════════════════════════
  // ONEPLUS (OEM prices)
  // ═══════════════════════════════════════════════════════════════════════════

  // OnePlus 12 Series (2024)
  { id: 'op12-1', model: 'OnePlus 12', repairType: 'Screen Replacement', basePrice: 349, partCost: 220, estimatedTime: '1h' },
  { id: 'op12-2', model: 'OnePlus 12', repairType: 'Battery Replacement', basePrice: 139, partCost: 50, estimatedTime: '1h' },
  { id: 'op12-3', model: 'OnePlus 12', repairType: 'Charging Port', basePrice: 129, partCost: 40, estimatedTime: '45m' },
  { id: 'op12-4', model: 'OnePlus 12R', repairType: 'Screen Replacement', basePrice: 279, partCost: 165, estimatedTime: '1h' },
  { id: 'op12-5', model: 'OnePlus 12R', repairType: 'Battery Replacement', basePrice: 119, partCost: 42, estimatedTime: '45m' },

  // OnePlus 11 Series (2023)
  { id: 'op11-1', model: 'OnePlus 11', repairType: 'Screen Replacement', basePrice: 299, partCost: 180, estimatedTime: '1h' },
  { id: 'op11-2', model: 'OnePlus 11', repairType: 'Battery Replacement', basePrice: 129, partCost: 45, estimatedTime: '1h' },
  { id: 'op11-3', model: 'OnePlus 11R', repairType: 'Screen Replacement', basePrice: 249, partCost: 140, estimatedTime: '1h' },
  { id: 'op11-4', model: 'OnePlus 11R', repairType: 'Battery Replacement', basePrice: 109, partCost: 38, estimatedTime: '45m' },

  // OnePlus Nord Series
  { id: 'opn-1', model: 'OnePlus Nord 4', repairType: 'Screen Replacement', basePrice: 219, partCost: 120, estimatedTime: '1h' },
  { id: 'opn-2', model: 'OnePlus Nord 4', repairType: 'Battery Replacement', basePrice: 99, partCost: 35, estimatedTime: '45m' },
  { id: 'opn-3', model: 'OnePlus Nord CE 4', repairType: 'Screen Replacement', basePrice: 179, partCost: 95, estimatedTime: '45m' },
  { id: 'opn-4', model: 'OnePlus Nord CE 4', repairType: 'Battery Replacement', basePrice: 89, partCost: 32, estimatedTime: '45m' },
  { id: 'opn-5', model: 'OnePlus Nord CE 3 Lite 5G', repairType: 'Screen Replacement', basePrice: 149, partCost: 75, estimatedTime: '45m' },
  { id: 'opn-6', model: 'OnePlus Nord N30 5G', repairType: 'Screen Replacement', basePrice: 139, partCost: 65, estimatedTime: '45m' },

  // Other OnePlus Models
  { id: 'opother-1', model: 'OnePlus (Other Model)', repairType: 'Screen Replacement', basePrice: 199, partCost: 100, estimatedTime: '1h' },
  { id: 'opother-2', model: 'OnePlus (Other Model)', repairType: 'Battery Replacement', basePrice: 109, partCost: 38, estimatedTime: '45m' },
  { id: 'opother-3', model: 'OnePlus (Other Model)', repairType: 'Charging Port', basePrice: 99, partCost: 30, estimatedTime: '45m' },

  // ═══════════════════════════════════════════════════════════════════════════
  // NOKIA (OEM prices - sold at Telstra, Optus, JB Hi-Fi)
  // ═══════════════════════════════════════════════════════════════════════════

  // Nokia G Series
  { id: 'nok-1', model: 'Nokia G60 5G', repairType: 'Screen Replacement', basePrice: 179, partCost: 90, estimatedTime: '45m' },
  { id: 'nok-2', model: 'Nokia G60 5G', repairType: 'Battery Replacement', basePrice: 89, partCost: 32, estimatedTime: '45m' },
  { id: 'nok-3', model: 'Nokia G42 5G', repairType: 'Screen Replacement', basePrice: 149, partCost: 75, estimatedTime: '45m' },
  { id: 'nok-4', model: 'Nokia G42 5G', repairType: 'Battery Replacement', basePrice: 79, partCost: 28, estimatedTime: '45m' },
  { id: 'nok-5', model: 'Nokia G22', repairType: 'Screen Replacement', basePrice: 129, partCost: 60, estimatedTime: '45m' },
  { id: 'nok-6', model: 'Nokia G22', repairType: 'Battery Replacement', basePrice: 69, partCost: 25, estimatedTime: '30m' },
  { id: 'nok-7', model: 'Nokia G21', repairType: 'Screen Replacement', basePrice: 119, partCost: 55, estimatedTime: '45m' },
  { id: 'nok-8', model: 'Nokia G21', repairType: 'Battery Replacement', basePrice: 69, partCost: 25, estimatedTime: '30m' },

  // Nokia X Series
  { id: 'nok-9', model: 'Nokia X30 5G', repairType: 'Screen Replacement', basePrice: 199, partCost: 105, estimatedTime: '1h' },
  { id: 'nok-10', model: 'Nokia X30 5G', repairType: 'Battery Replacement', basePrice: 99, partCost: 35, estimatedTime: '45m' },
  { id: 'nok-11', model: 'Nokia XR21', repairType: 'Screen Replacement', basePrice: 219, partCost: 120, estimatedTime: '1h' },
  { id: 'nok-12', model: 'Nokia XR21', repairType: 'Battery Replacement', basePrice: 99, partCost: 35, estimatedTime: '45m' },

  // Other Nokia Models
  { id: 'nokother-1', model: 'Nokia (Other Model)', repairType: 'Screen Replacement', basePrice: 149, partCost: 70, estimatedTime: '45m' },
  { id: 'nokother-2', model: 'Nokia (Other Model)', repairType: 'Battery Replacement', basePrice: 79, partCost: 28, estimatedTime: '45m' },
  { id: 'nokother-3', model: 'Nokia (Other Model)', repairType: 'Charging Port', basePrice: 79, partCost: 25, estimatedTime: '45m' },

  // ═══════════════════════════════════════════════════════════════════════════
  // REALME (OEM prices - JB Hi-Fi, Officeworks)
  // ═══════════════════════════════════════════════════════════════════════════

  // Realme GT Series
  { id: 'rm-1', model: 'Realme GT 5 Pro', repairType: 'Screen Replacement', basePrice: 279, partCost: 165, estimatedTime: '1h' },
  { id: 'rm-2', model: 'Realme GT 5 Pro', repairType: 'Battery Replacement', basePrice: 119, partCost: 42, estimatedTime: '45m' },
  { id: 'rm-3', model: 'Realme GT Neo 5', repairType: 'Screen Replacement', basePrice: 229, partCost: 130, estimatedTime: '1h' },
  { id: 'rm-4', model: 'Realme GT Neo 5', repairType: 'Battery Replacement', basePrice: 109, partCost: 38, estimatedTime: '45m' },
  { id: 'rm-5', model: 'Realme GT 3', repairType: 'Screen Replacement', basePrice: 199, partCost: 110, estimatedTime: '1h' },
  { id: 'rm-6', model: 'Realme GT 3', repairType: 'Battery Replacement', basePrice: 99, partCost: 35, estimatedTime: '45m' },

  // Realme Number Series
  { id: 'rm-7', model: 'Realme 12 Pro+ 5G', repairType: 'Screen Replacement', basePrice: 219, partCost: 120, estimatedTime: '1h' },
  { id: 'rm-8', model: 'Realme 12 Pro+ 5G', repairType: 'Battery Replacement', basePrice: 99, partCost: 35, estimatedTime: '45m' },
  { id: 'rm-9', model: 'Realme 12 Pro 5G', repairType: 'Screen Replacement', basePrice: 189, partCost: 100, estimatedTime: '1h' },
  { id: 'rm-10', model: 'Realme 12 Pro 5G', repairType: 'Battery Replacement', basePrice: 89, partCost: 32, estimatedTime: '45m' },
  { id: 'rm-11', model: 'Realme 11 Pro+ 5G', repairType: 'Screen Replacement', basePrice: 179, partCost: 95, estimatedTime: '45m' },
  { id: 'rm-12', model: 'Realme 11 Pro 5G', repairType: 'Screen Replacement', basePrice: 159, partCost: 80, estimatedTime: '45m' },

  // Realme C Series (Budget)
  { id: 'rm-13', model: 'Realme C67', repairType: 'Screen Replacement', basePrice: 119, partCost: 55, estimatedTime: '45m' },
  { id: 'rm-14', model: 'Realme C67', repairType: 'Battery Replacement', basePrice: 69, partCost: 25, estimatedTime: '30m' },
  { id: 'rm-15', model: 'Realme C55', repairType: 'Screen Replacement', basePrice: 109, partCost: 50, estimatedTime: '45m' },
  { id: 'rm-16', model: 'Realme C53', repairType: 'Screen Replacement', basePrice: 99, partCost: 45, estimatedTime: '45m' },

  // Other Realme Models
  { id: 'rmother-1', model: 'Realme (Other Model)', repairType: 'Screen Replacement', basePrice: 149, partCost: 70, estimatedTime: '45m' },
  { id: 'rmother-2', model: 'Realme (Other Model)', repairType: 'Battery Replacement', basePrice: 79, partCost: 28, estimatedTime: '45m' },
  { id: 'rmother-3', model: 'Realme (Other Model)', repairType: 'Charging Port', basePrice: 79, partCost: 25, estimatedTime: '45m' },

  // ═══════════════════════════════════════════════════════════════════════════
  // iPAD TABLETS (Original OEM prices only)
  // ═══════════════════════════════════════════════════════════════════════════

  // iPad Pro M4 (2024)
  { id: 'ipad-m4-1', model: 'iPad Pro 13" (M4)', repairType: 'Screen Replacement', basePrice: 1099, partCost: 650, estimatedTime: '2h' },
  { id: 'ipad-m4-2', model: 'iPad Pro 13" (M4)', repairType: 'Battery Replacement', basePrice: 329, partCost: 120, estimatedTime: '1h 30m' },
  { id: 'ipad-m4-3', model: 'iPad Pro 13" (M4)', repairType: 'Charging Port', basePrice: 249, partCost: 85, estimatedTime: '1h 30m' },
  { id: 'ipad-m4-4', model: 'iPad Pro 11" (M4)', repairType: 'Screen Replacement', basePrice: 799, partCost: 450, estimatedTime: '2h' },
  { id: 'ipad-m4-5', model: 'iPad Pro 11" (M4)', repairType: 'Battery Replacement', basePrice: 299, partCost: 110, estimatedTime: '1h 30m' },
  { id: 'ipad-m4-6', model: 'iPad Pro 11" (M4)', repairType: 'Charging Port', basePrice: 229, partCost: 80, estimatedTime: '1h 30m' },

  // iPad Pro M2 (2022)
  { id: 'ipad-pro-1', model: 'iPad Pro 12.9" (M2)', repairType: 'Screen Replacement', basePrice: 949, partCost: 550, estimatedTime: '2h' },
  { id: 'ipad-pro-2', model: 'iPad Pro 12.9" (M2)', repairType: 'Battery Replacement', basePrice: 299, partCost: 100, estimatedTime: '1h 30m' },
  { id: 'ipad-pro-2c', model: 'iPad Pro 12.9" (M2)', repairType: 'Charging Port', basePrice: 229, partCost: 75, estimatedTime: '1h 30m' },
  { id: 'ipad-pro-3', model: 'iPad Pro 11" (M2)', repairType: 'Screen Replacement', basePrice: 599, partCost: 320, estimatedTime: '2h' },
  { id: 'ipad-pro-4', model: 'iPad Pro 11" (M2)', repairType: 'Battery Replacement', basePrice: 279, partCost: 95, estimatedTime: '1h 30m' },
  { id: 'ipad-pro-4c', model: 'iPad Pro 11" (M2)', repairType: 'Charging Port', basePrice: 199, partCost: 70, estimatedTime: '1h 30m' },

  // iPad Pro M1 (2021)
  { id: 'ipad-m1-1', model: 'iPad Pro 12.9" (M1)', repairType: 'Screen Replacement', basePrice: 849, partCost: 490, estimatedTime: '2h' },
  { id: 'ipad-m1-2', model: 'iPad Pro 12.9" (M1)', repairType: 'Battery Replacement', basePrice: 279, partCost: 95, estimatedTime: '1h 30m' },
  { id: 'ipad-m1-3', model: 'iPad Pro 11" (M1)', repairType: 'Screen Replacement', basePrice: 549, partCost: 290, estimatedTime: '2h' },
  { id: 'ipad-m1-4', model: 'iPad Pro 11" (M1)', repairType: 'Battery Replacement', basePrice: 259, partCost: 90, estimatedTime: '1h 30m' },

  // iPad Pro Older (2018-2020)
  { id: 'ipad-pro-o1', model: 'iPad Pro 12.9" (4th Gen)', repairType: 'Screen Replacement', basePrice: 749, partCost: 420, estimatedTime: '2h' },
  { id: 'ipad-pro-o2', model: 'iPad Pro 12.9" (4th Gen)', repairType: 'Battery Replacement', basePrice: 249, partCost: 85, estimatedTime: '1h 30m' },
  { id: 'ipad-pro-o3', model: 'iPad Pro 11" (2nd Gen)', repairType: 'Screen Replacement', basePrice: 499, partCost: 260, estimatedTime: '2h' },
  { id: 'ipad-pro-o4', model: 'iPad Pro 11" (2nd Gen)', repairType: 'Battery Replacement', basePrice: 229, partCost: 80, estimatedTime: '1h 30m' },
  { id: 'ipad-pro-o5', model: 'iPad Pro 12.9" (3rd Gen)', repairType: 'Screen Replacement', basePrice: 649, partCost: 360, estimatedTime: '2h' },
  { id: 'ipad-pro-o6', model: 'iPad Pro 12.9" (3rd Gen)', repairType: 'Battery Replacement', basePrice: 229, partCost: 80, estimatedTime: '1h 30m' },
  { id: 'ipad-pro-o7', model: 'iPad Pro 11" (1st Gen)', repairType: 'Screen Replacement', basePrice: 449, partCost: 240, estimatedTime: '2h' },
  { id: 'ipad-pro-o8', model: 'iPad Pro 11" (1st Gen)', repairType: 'Battery Replacement', basePrice: 199, partCost: 70, estimatedTime: '1h 30m' },

  // iPad Air M2 (2024)
  { id: 'ipad-air-m2-1', model: 'iPad Air 13" (M2)', repairType: 'Screen Replacement', basePrice: 649, partCost: 380, estimatedTime: '1h 30m' },
  { id: 'ipad-air-m2-2', model: 'iPad Air 13" (M2)', repairType: 'Battery Replacement', basePrice: 199, partCost: 80, estimatedTime: '1h' },
  { id: 'ipad-air-m2-3', model: 'iPad Air 11" (M2)', repairType: 'Screen Replacement', basePrice: 549, partCost: 310, estimatedTime: '1h 30m' },
  { id: 'ipad-air-m2-4', model: 'iPad Air 11" (M2)', repairType: 'Battery Replacement', basePrice: 189, partCost: 75, estimatedTime: '1h' },

  // iPad Air 5th Gen (M1)
  { id: 'ipad-air-3', model: 'iPad Air (5th Gen)', repairType: 'Screen Replacement', basePrice: 449, partCost: 260, estimatedTime: '1h 30m' },
  { id: 'ipad-air-4', model: 'iPad Air (5th Gen)', repairType: 'Battery Replacement', basePrice: 169, partCost: 70, estimatedTime: '1h' },

  // iPad Air 4th Gen
  { id: 'ipad-air-5', model: 'iPad Air (4th Gen)', repairType: 'Screen Replacement', basePrice: 399, partCost: 230, estimatedTime: '1h 30m' },
  { id: 'ipad-air-6', model: 'iPad Air (4th Gen)', repairType: 'Battery Replacement', basePrice: 159, partCost: 65, estimatedTime: '1h' },

  // iPad Air 3rd Gen
  { id: 'ipad-air-7', model: 'iPad Air (3rd Gen)', repairType: 'Screen Replacement', basePrice: 299, partCost: 160, estimatedTime: '1h 30m' },
  { id: 'ipad-air-8', model: 'iPad Air (3rd Gen)', repairType: 'Battery Replacement', basePrice: 139, partCost: 55, estimatedTime: '1h' },

  // iPad Base Models
  { id: 'ipad-10', model: 'iPad (10th Gen)', repairType: 'Screen Replacement', basePrice: 299, partCost: 130, estimatedTime: '1h 30m' },
  { id: 'ipad-11', model: 'iPad (10th Gen)', repairType: 'Battery Replacement', basePrice: 149, partCost: 55, estimatedTime: '1h' },
  { id: 'ipad-9', model: 'iPad (9th Gen)', repairType: 'Screen Replacement', basePrice: 199, partCost: 95, estimatedTime: '1h 30m' },
  { id: 'ipad-9b', model: 'iPad (9th Gen)', repairType: 'Battery Replacement', basePrice: 139, partCost: 50, estimatedTime: '1h' },
  { id: 'ipad-8', model: 'iPad (8th Gen)', repairType: 'Screen Replacement', basePrice: 179, partCost: 85, estimatedTime: '1h 30m' },
  { id: 'ipad-8b', model: 'iPad (8th Gen)', repairType: 'Battery Replacement', basePrice: 129, partCost: 45, estimatedTime: '1h' },
  { id: 'ipad-7', model: 'iPad (7th Gen)', repairType: 'Screen Replacement', basePrice: 169, partCost: 80, estimatedTime: '1h 30m' },
  { id: 'ipad-7b', model: 'iPad (7th Gen)', repairType: 'Battery Replacement', basePrice: 119, partCost: 42, estimatedTime: '1h' },
  { id: 'ipad-6', model: 'iPad (6th Gen)', repairType: 'Screen Replacement', basePrice: 149, partCost: 70, estimatedTime: '1h 30m' },
  { id: 'ipad-6b', model: 'iPad (6th Gen)', repairType: 'Battery Replacement', basePrice: 109, partCost: 38, estimatedTime: '1h' },

  // iPad Mini
  { id: 'ipad-mini6-1', model: 'iPad Mini (6th Gen)', repairType: 'Screen Replacement', basePrice: 449, partCost: 260, estimatedTime: '1h 30m' },
  { id: 'ipad-mini6-2', model: 'iPad Mini (6th Gen)', repairType: 'Battery Replacement', basePrice: 169, partCost: 65, estimatedTime: '1h' },
  { id: 'ipad-mini5-1', model: 'iPad Mini (5th Gen)', repairType: 'Screen Replacement', basePrice: 299, partCost: 160, estimatedTime: '1h 30m' },
  { id: 'ipad-mini5-2', model: 'iPad Mini (5th Gen)', repairType: 'Battery Replacement', basePrice: 139, partCost: 50, estimatedTime: '1h' },
  { id: 'ipad-mini4-1', model: 'iPad Mini 4', repairType: 'Screen Replacement', basePrice: 229, partCost: 120, estimatedTime: '1h 30m' },
  { id: 'ipad-mini4-2', model: 'iPad Mini 4', repairType: 'Battery Replacement', basePrice: 119, partCost: 42, estimatedTime: '1h' },

  // iPad Mini Legacy (2012-2014)
  { id: 'ipad-mini3-1', model: 'iPad Mini 3', repairType: 'Screen Replacement', basePrice: 199, partCost: 100, estimatedTime: '1h' },
  { id: 'ipad-mini3-2', model: 'iPad Mini 3', repairType: 'Battery Replacement', basePrice: 99, partCost: 35, estimatedTime: '45m' },
  { id: 'ipad-mini2-1', model: 'iPad Mini 2', repairType: 'Screen Replacement', basePrice: 169, partCost: 85, estimatedTime: '1h' },
  { id: 'ipad-mini2-2', model: 'iPad Mini 2', repairType: 'Battery Replacement', basePrice: 89, partCost: 32, estimatedTime: '45m' },
  { id: 'ipad-mini1-1', model: 'iPad Mini (1st Gen)', repairType: 'Screen Replacement', basePrice: 149, partCost: 70, estimatedTime: '1h' },
  { id: 'ipad-mini1-2', model: 'iPad Mini (1st Gen)', repairType: 'Battery Replacement', basePrice: 79, partCost: 28, estimatedTime: '45m' },

  // ═══════════════════════════════════════════════════════════════════════════
  // iPAD PRO LEGACY (2015-2017)
  // ═══════════════════════════════════════════════════════════════════════════

  { id: 'ipad-pro-leg-1', model: 'iPad Pro 12.9" (2nd Gen)', repairType: 'Screen Replacement', basePrice: 549, partCost: 310, estimatedTime: '2h' },
  { id: 'ipad-pro-leg-2', model: 'iPad Pro 12.9" (2nd Gen)', repairType: 'Battery Replacement', basePrice: 199, partCost: 70, estimatedTime: '1h 30m' },
  { id: 'ipad-pro-leg-3', model: 'iPad Pro 12.9" (1st Gen)', repairType: 'Screen Replacement', basePrice: 499, partCost: 280, estimatedTime: '2h' },
  { id: 'ipad-pro-leg-4', model: 'iPad Pro 12.9" (1st Gen)', repairType: 'Battery Replacement', basePrice: 179, partCost: 65, estimatedTime: '1h 30m' },
  { id: 'ipad-pro-leg-5', model: 'iPad Pro 10.5"', repairType: 'Screen Replacement', basePrice: 399, partCost: 220, estimatedTime: '1h 30m' },
  { id: 'ipad-pro-leg-6', model: 'iPad Pro 10.5"', repairType: 'Battery Replacement', basePrice: 169, partCost: 60, estimatedTime: '1h' },
  { id: 'ipad-pro-leg-7', model: 'iPad Pro 9.7"', repairType: 'Screen Replacement', basePrice: 349, partCost: 190, estimatedTime: '1h 30m' },
  { id: 'ipad-pro-leg-8', model: 'iPad Pro 9.7"', repairType: 'Battery Replacement', basePrice: 149, partCost: 55, estimatedTime: '1h' },

  // ═══════════════════════════════════════════════════════════════════════════
  // iPAD AIR LEGACY (2013-2014)
  // ═══════════════════════════════════════════════════════════════════════════

  { id: 'ipad-air2-1', model: 'iPad Air 2', repairType: 'Screen Replacement', basePrice: 249, partCost: 130, estimatedTime: '1h 30m' },
  { id: 'ipad-air2-2', model: 'iPad Air 2', repairType: 'Battery Replacement', basePrice: 129, partCost: 48, estimatedTime: '1h' },
  { id: 'ipad-air1-1', model: 'iPad Air (1st Gen)', repairType: 'Screen Replacement', basePrice: 199, partCost: 100, estimatedTime: '1h 30m' },
  { id: 'ipad-air1-2', model: 'iPad Air (1st Gen)', repairType: 'Battery Replacement', basePrice: 109, partCost: 40, estimatedTime: '1h' },

  // ═══════════════════════════════════════════════════════════════════════════
  // iPAD BASE LEGACY (2012-2017)
  // ═══════════════════════════════════════════════════════════════════════════

  { id: 'ipad-5-1', model: 'iPad (5th Gen)', repairType: 'Screen Replacement', basePrice: 139, partCost: 65, estimatedTime: '1h' },
  { id: 'ipad-5-2', model: 'iPad (5th Gen)', repairType: 'Battery Replacement', basePrice: 99, partCost: 35, estimatedTime: '45m' },
  { id: 'ipad-4-1', model: 'iPad (4th Gen)', repairType: 'Screen Replacement', basePrice: 129, partCost: 60, estimatedTime: '1h' },
  { id: 'ipad-4-2', model: 'iPad (4th Gen)', repairType: 'Battery Replacement', basePrice: 89, partCost: 32, estimatedTime: '45m' },
  { id: 'ipad-3-1', model: 'iPad (3rd Gen)', repairType: 'Screen Replacement', basePrice: 119, partCost: 55, estimatedTime: '1h' },
  { id: 'ipad-3-2', model: 'iPad (3rd Gen)', repairType: 'Battery Replacement', basePrice: 79, partCost: 28, estimatedTime: '45m' },
  { id: 'ipad-2-1', model: 'iPad 2', repairType: 'Screen Replacement', basePrice: 99, partCost: 45, estimatedTime: '1h' },
  { id: 'ipad-2-2', model: 'iPad 2', repairType: 'Battery Replacement', basePrice: 69, partCost: 25, estimatedTime: '45m' },

  // ═══════════════════════════════════════════════════════════════════════════
  // SAMSUNG TABLETS (OEM prices)
  // ═══════════════════════════════════════════════════════════════════════════

  // Galaxy Tab S9 Series (2023)
  { id: 'tab-s9u-1', model: 'Samsung Galaxy Tab S9 Ultra', repairType: 'Screen Replacement', basePrice: 799, partCost: 480, estimatedTime: '2h' },
  { id: 'tab-s9u-2', model: 'Samsung Galaxy Tab S9 Ultra', repairType: 'Battery Replacement', basePrice: 229, partCost: 85, estimatedTime: '1h 30m' },
  { id: 'tab-s9p-1', model: 'Samsung Galaxy Tab S9+', repairType: 'Screen Replacement', basePrice: 599, partCost: 350, estimatedTime: '2h' },
  { id: 'tab-s9p-2', model: 'Samsung Galaxy Tab S9+', repairType: 'Battery Replacement', basePrice: 199, partCost: 75, estimatedTime: '1h 30m' },
  { id: 'tab-s9-1', model: 'Samsung Galaxy Tab S9', repairType: 'Screen Replacement', basePrice: 449, partCost: 260, estimatedTime: '1h 30m' },
  { id: 'tab-s9-2', model: 'Samsung Galaxy Tab S9', repairType: 'Battery Replacement', basePrice: 179, partCost: 65, estimatedTime: '1h' },

  // Galaxy Tab S8 Series (2022)
  { id: 'tab-s8u-1', model: 'Samsung Galaxy Tab S8 Ultra', repairType: 'Screen Replacement', basePrice: 699, partCost: 420, estimatedTime: '2h' },
  { id: 'tab-s8u-2', model: 'Samsung Galaxy Tab S8 Ultra', repairType: 'Battery Replacement', basePrice: 199, partCost: 75, estimatedTime: '1h 30m' },
  { id: 'tab-s8p-1', model: 'Samsung Galaxy Tab S8+', repairType: 'Screen Replacement', basePrice: 549, partCost: 320, estimatedTime: '2h' },
  { id: 'tab-s8p-2', model: 'Samsung Galaxy Tab S8+', repairType: 'Battery Replacement', basePrice: 179, partCost: 65, estimatedTime: '1h 30m' },
  { id: 'tab-s8-1', model: 'Samsung Galaxy Tab S8', repairType: 'Screen Replacement', basePrice: 399, partCost: 230, estimatedTime: '1h 30m' },
  { id: 'tab-s8-2', model: 'Samsung Galaxy Tab S8', repairType: 'Battery Replacement', basePrice: 159, partCost: 58, estimatedTime: '1h' },

  // Galaxy Tab A Series (Budget)
  { id: 'tab-a9p-1', model: 'Samsung Galaxy Tab A9+', repairType: 'Screen Replacement', basePrice: 199, partCost: 105, estimatedTime: '1h' },
  { id: 'tab-a9p-2', model: 'Samsung Galaxy Tab A9+', repairType: 'Battery Replacement', basePrice: 119, partCost: 42, estimatedTime: '45m' },
  { id: 'tab-a9-1', model: 'Samsung Galaxy Tab A9', repairType: 'Screen Replacement', basePrice: 149, partCost: 75, estimatedTime: '1h' },
  { id: 'tab-a9-2', model: 'Samsung Galaxy Tab A9', repairType: 'Battery Replacement', basePrice: 99, partCost: 35, estimatedTime: '45m' },

  // Other Tablet Models
  { id: 'tabother-1', model: 'Tablet (Other Model)', repairType: 'Screen Replacement', basePrice: 299, partCost: 150, estimatedTime: '1h 30m' },
  { id: 'tabother-2', model: 'Tablet (Other Model)', repairType: 'Battery Replacement', basePrice: 149, partCost: 60, estimatedTime: '1h' },
];

export function getUniqueModels(): string[] {
  return Array.from(new Set(REPAIR_PRICING.map(p => p.model)));
}

export function getRepairsForModel(model: string): RepairPriceItem[] {
  return REPAIR_PRICING.filter(p => p.model === model);
}

export function findPrice(model: string, repairType: string): RepairPriceItem | undefined {
  return REPAIR_PRICING.find(p => p.model === model && p.repairType === repairType);
}

export function searchModels(query: string): string[] {
  if (!query.trim()) return getUniqueModels().slice(0, 15);
  const q = query.toLowerCase().trim();
  const models = getUniqueModels();
  return models
    .filter(m => m.toLowerCase().includes(q))
    .sort((a, b) => {
      const aStarts = a.toLowerCase().startsWith(q) ? 0 : 1;
      const bStarts = b.toLowerCase().startsWith(q) ? 0 : 1;
      return aStarts - bStarts || a.localeCompare(b);
    })
    .slice(0, 12);
}
