export interface GameSave {
  id: string;
  name: string;
  fileName: string;
  fileData: string; // Base64 or data URL
  description?: string;
  uploadedAt: string;
}

export interface Game {
  id: string;
  name: string;
  coverImage: string; // Base64 or data URL
  saves: GameSave[];
  createdAt: string;
}

export type SortField = 'name' | 'date';
export type SortOrder = 'asc' | 'desc';
