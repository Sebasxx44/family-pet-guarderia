export interface SiteRoute {
  path: string;
  title: string;
  description: string;
  template: string;
  label: string;
}

export interface EditorialPhoto {
  source: string;
  width: number;
  height: number;
  crop: [number, number, number, number];
  position: "xMidYMin" | "xMaxYMin";
  origin: string;
}

export type ServiceName = "Guardería" | "Hotel" | "Pasadía";

export interface ServiceSuggestion {
  service: ServiceName;
  description: string;
  url: string;
}
