export interface Point {
  x: number;
  y: number;
}

export interface Piece {
  blocks: Point[];
  color: string;
  angle: number;
  distance: number;
}

export interface GameState {
  pieces: Piece[];
  currentPiece: Piece | null;
  score: number;
  gameOver: boolean;
}

export const COLORS = [
  '#FF0D0D', // red
  '#0DFF1C', // green
  '#0D85FF', // blue
  '#FFD70D', // yellow
  '#FF0DFF', // magenta
  '#0DFFF9', // cyan
  '#FF8E0D'  // orange
];