// Zentrale Typdefinition – überall genau diesen importieren
export type Teacher = {
  id: string | number;
  name: string;
  subject: string;
  rating?: number;     // optional reicht für die Card
  avatarUrl?: string;  // falls du später Bilder hast
};
