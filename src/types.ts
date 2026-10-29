export interface SiteRoute {
  path: string;
  title: string;
  description: string;
  template: string;
  label: string;
}

export type ServiceName = "Guardería" | "Hotel" | "Pasadía";

export interface ServiceSuggestion {
  service: ServiceName;
  description: string;
  url: string;
}
