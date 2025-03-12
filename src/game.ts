import { Point, Piece, GameState, COLORS } from './types';

const GAME_RADIUS = 200;
const MIN_DISTANCE = 30;
const BLOCK_SIZE = 20;
const ROTATION_SPEED = 0.05;
const FALL_SPEED = 0.5;

// Piece templates in polar coordinates (angle, distance)
const PIECES = [
  // I piece
  {
    blocks: [
      [0, 0],
      [0, 1],
      [0, 2],
      [0, 3],
    ],
    color: COLORS[0],
  },
  // Square piece
  {
    blocks: [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
    ],
    color: COLORS[1],
  },
  // L piece
  {
    blocks: [
      [0, 0],
      [0, 1],
      [0, 2],
      [1, 2],
    ],
    color: COLORS[2],
  },
  // T piece
  {
    blocks: [
      [0, 0],
      [-1, 1],
      [0, 1],
      [1, 1],
    ],
    color: COLORS[3],
  },
];

export class CircularTetris {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private state: GameState;
  private lastTime: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.state = {
      pieces: [],
      currentPiece: null,
      score: 0,
      gameOver: false,
    };

    this.init();
  }

  private init() {
    // Center the coordinate system
    this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
    this.spawnPiece();
    this.animate();
  }

  private spawnPiece() {
    const template = PIECES[Math.floor(Math.random() * PIECES.length)];
    this.state.currentPiece = {
      blocks: template.blocks.map(([angle, dist]) => ({
        x: Math.cos(angle) * (dist * BLOCK_SIZE),
        y: Math.sin(angle) * (dist * BLOCK_SIZE),
      })),
      color: template.color,
      angle: Math.random() * Math.PI * 2,
      distance: GAME_RADIUS,
    };
  }

  private animate(time: number = 0) {
    const deltaTime = time - this.lastTime;
    this.lastTime = time;

    this.update(deltaTime);
    this.draw();

    if (!this.state.gameOver) {
      requestAnimationFrame((t) => this.animate(t));
    }
  }

  private update(deltaTime: number) {
    if (!this.state.currentPiece || this.state.gameOver) return;

    // Store previous position
    const previousDistance = this.state.currentPiece.distance;

    // Move piece towards center
    this.state.currentPiece.distance -= FALL_SPEED;

    // Check for collisions
    if (this.checkCollision()) {
      // Restore previous position
      this.state.currentPiece.distance = previousDistance;
      this.state.pieces.push({ ...this.state.currentPiece });
      this.checkLines();
      this.spawnPiece();

      // Check game over - now only if a piece is placed at the outer edge
      if (this.state.currentPiece.distance >= GAME_RADIUS - BLOCK_SIZE * 2) {
        this.state.gameOver = true;
      }
    }
  }

  private checkCollision(): boolean {
    if (!this.state.currentPiece) return false;

    // Get current piece blocks
    const currentBlocks = this.getPieceBlocks(this.state.currentPiece);

    // Check if any block would be too close to center after the move
    for (const block of currentBlocks) {
      const distanceFromCenter = Math.sqrt(
        block.x * block.x + block.y * block.y
      );
      if (distanceFromCenter <= MIN_DISTANCE + BLOCK_SIZE) {
        return true;
      }
    }

    // Check collision with other pieces
    for (const piece of this.state.pieces) {
      const pieceBlocks = this.getPieceBlocks(piece);
      for (const block of currentBlocks) {
        for (const otherBlock of pieceBlocks) {
          const dx = block.x - otherBlock.x;
          const dy = block.y - otherBlock.y;
          if (Math.abs(dx) < BLOCK_SIZE && Math.abs(dy) < BLOCK_SIZE) {
            return true;
          }
        }
      }
    }

    return false;
  }

  private getPieceBlocks(piece: Piece): Point[] {
    return piece.blocks.map((block) => ({
      x:
        block.x * Math.cos(piece.angle) -
        block.y * Math.sin(piece.angle) +
        piece.distance * Math.cos(piece.angle),
      y:
        block.x * Math.sin(piece.angle) +
        block.y * Math.cos(piece.angle) +
        piece.distance * Math.sin(piece.angle),
    }));
  }

  private checkLines() {
    // TODO: Implement line clearing logic
  }

  private draw() {
    this.ctx.clearRect(
      -this.canvas.width / 2,
      -this.canvas.height / 2,
      this.canvas.width,
      this.canvas.height
    );

    // Draw game boundary
    this.ctx.beginPath();
    this.ctx.arc(0, 0, GAME_RADIUS, 0, Math.PI * 2);
    this.ctx.strokeStyle = '#FF0000';
    this.ctx.lineWidth = 3;
    this.ctx.stroke();

    // Draw center boundary
    this.ctx.beginPath();
    this.ctx.arc(0, 0, MIN_DISTANCE, 0, Math.PI * 2);
    this.ctx.strokeStyle = '#444';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // Draw placed pieces
    for (const piece of this.state.pieces) {
      this.drawPiece(piece);
    }

    // Draw current piece
    if (this.state.currentPiece) {
      this.drawPiece(this.state.currentPiece);
    }

    // Draw score
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '20px Arial';
    this.ctx.fillText(`Score: ${this.state.score}`, -GAME_RADIUS, -GAME_RADIUS);

    if (this.state.gameOver) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      this.ctx.fillRect(
        -GAME_RADIUS,
        -GAME_RADIUS,
        GAME_RADIUS * 2,
        GAME_RADIUS * 2
      );
      this.ctx.fillStyle = '#fff';
      this.ctx.font = '40px Arial';
      this.ctx.fillText('Game Over!', -100, 0);
    }
  }

  private drawPiece(piece: Piece) {
    const blocks = this.getPieceBlocks(piece);
    for (const block of blocks) {
      // Save the current context state
      this.ctx.save();

      // Translate to the block position
      this.ctx.translate(block.x, block.y);

      // Rotate the block to match the piece angle
      this.ctx.rotate(piece.angle);

      // Draw the rectangular block
      this.ctx.fillStyle = piece.color;
      this.ctx.strokeStyle = '#fff';
      this.ctx.lineWidth = 2;

      // Draw centered rectangle
      this.ctx.fillRect(
        -BLOCK_SIZE / 2,
        -BLOCK_SIZE / 2,
        BLOCK_SIZE,
        BLOCK_SIZE
      );
      this.ctx.strokeRect(
        -BLOCK_SIZE / 2,
        -BLOCK_SIZE / 2,
        BLOCK_SIZE,
        BLOCK_SIZE
      );

      // Restore the context state
      this.ctx.restore();
    }
  }

  public rotateLeft() {
    if (this.state.currentPiece) {
      this.state.currentPiece.angle -= ROTATION_SPEED;
    }
  }

  public rotateRight() {
    if (this.state.currentPiece) {
      this.state.currentPiece.angle += ROTATION_SPEED;
    }
  }

  public speedUp() {
    if (this.state.currentPiece) {
      this.state.currentPiece.distance -= FALL_SPEED * 5;
    }
  }
}
