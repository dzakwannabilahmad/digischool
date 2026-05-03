export interface Note {
  id: string;
  title: string;
  folderId: string | null;
  content: string; // JSON string of Konva stage
  updatedAt: number;
  previewImage?: string;
}

export interface Folder {
  id: string;
  name: string;
  color: string;
}

export interface DrawingElement {
  id: string;
  type: 'line' | 'text' | 'image' | 'flashcard';
  points?: number[];
  color?: string;
  strokeWidth?: number;
  text?: string;
  x?: number;
  y?: number;
  isAiGenerated?: boolean;
}
