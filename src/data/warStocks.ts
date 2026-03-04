export type WarStockSector = "Defense" | "Cybersecurity" | "Energy" | "Mining" | "Shipping";

export interface WarStock {
  ticker: string;
  name: string;
  sector: WarStockSector;
  exchange?: string;
  price?: null;
  change24h?: null;
}

export const warStocks: WarStock[] = [
  // Defense / Aerospace / Gov Contractors
  { ticker: "LMT", name: "Lockheed Martin", sector: "Defense" },
  { ticker: "NOC", name: "Northrop Grumman", sector: "Defense" },
  { ticker: "RTX", name: "RTX", sector: "Defense" },
  { ticker: "GD", name: "General Dynamics", sector: "Defense" },
  { ticker: "BA", name: "Boeing", sector: "Defense" },
  { ticker: "LHX", name: "L3Harris Technologies", sector: "Defense" },
  { ticker: "HII", name: "Huntington Ingalls Industries", sector: "Defense" },
  { ticker: "AVAV", name: "AeroVironment", sector: "Defense" },
  { ticker: "KTOS", name: "Kratos Defense & Security Solutions", sector: "Defense" },
  { ticker: "PLTR", name: "Palantir Technologies", sector: "Defense" },
  { ticker: "LDOS", name: "Leidos", sector: "Defense" },
  { ticker: "SAIC", name: "SAIC", sector: "Defense" },
  { ticker: "BAH", name: "Booz Allen Hamilton", sector: "Defense" },
  { ticker: "BA.L", name: "BAE Systems", sector: "Defense", exchange: "LSE" },
  { ticker: "HO.PA", name: "Thales", sector: "Defense", exchange: "Euronext" },
  { ticker: "LDO.MI", name: "Leonardo", sector: "Defense", exchange: "Borsa Italiana" },
  { ticker: "RHM.DE", name: "Rheinmetall", sector: "Defense", exchange: "Xetra" },
  { ticker: "SAAB-B.ST", name: "Saab", sector: "Defense", exchange: "Nasdaq Stockholm" },
  { ticker: "AM.PA", name: "Dassault Aviation", sector: "Defense", exchange: "Euronext" },
  { ticker: "ESLT", name: "Elbit Systems", sector: "Defense" },

  // Cybersecurity / Software
  { ticker: "CHKP", name: "Check Point Software", sector: "Cybersecurity" },
  { ticker: "NICE", name: "NICE", sector: "Cybersecurity" },
  { ticker: "CRWD", name: "CrowdStrike", sector: "Cybersecurity" },
  { ticker: "PANW", name: "Palo Alto Networks", sector: "Cybersecurity" },
  { ticker: "FTNT", name: "Fortinet", sector: "Cybersecurity" },
  { ticker: "ZS", name: "Zscaler", sector: "Cybersecurity" },
  { ticker: "S", name: "SentinelOne", sector: "Cybersecurity" },

  // Energy (Oil & Gas / Services / Refining)
  { ticker: "XOM", name: "Exxon Mobil", sector: "Energy" },
  { ticker: "CVX", name: "Chevron", sector: "Energy" },
  { ticker: "COP", name: "ConocoPhillips", sector: "Energy" },
  { ticker: "SHEL", name: "Shell", sector: "Energy" },
  { ticker: "BP", name: "BP", sector: "Energy" },
  { ticker: "TTE", name: "TotalEnergies", sector: "Energy" },
  { ticker: "OXY", name: "Occidental Petroleum", sector: "Energy" },
  { ticker: "EOG", name: "EOG Resources", sector: "Energy" },
  { ticker: "MPC", name: "Marathon Petroleum", sector: "Energy" },
  { ticker: "VLO", name: "Valero Energy", sector: "Energy" },
  { ticker: "SLB", name: "Schlumberger", sector: "Energy" },
  { ticker: "HAL", name: "Halliburton", sector: "Energy" },
  { ticker: "BKR", name: "Baker Hughes", sector: "Energy" },

  // Mining (Gold)
  { ticker: "NEM", name: "Newmont", sector: "Mining" },
  { ticker: "GOLD", name: "Barrick Gold", sector: "Mining" },
  { ticker: "AEM", name: "Agnico Eagle Mines", sector: "Mining" },
  { ticker: "FNV", name: "Franco-Nevada", sector: "Mining" },

  // Shipping (Tankers / LNG)
  { ticker: "FRO", name: "Frontline", sector: "Shipping" },
  { ticker: "TNK", name: "Teekay Tankers", sector: "Shipping" },
  { ticker: "DHT", name: "DHT Holdings", sector: "Shipping" },
  { ticker: "NAT", name: "Nordic American Tankers", sector: "Shipping" },
  { ticker: "GLNG", name: "Golar LNG", sector: "Shipping" },
  { ticker: "FLNG", name: "Flex LNG", sector: "Shipping" },
];

export const warStockSectors: WarStockSector[] = ["Defense", "Cybersecurity", "Energy", "Mining", "Shipping"];
