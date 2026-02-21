export class PathfindingGrid {
  constructor(mapWidth, mapHeight, tileSize, boundaries, scaleFactor) {
    this.tileSize = tileSize;
    this.scaleFactor = scaleFactor;
    this.cols = Math.ceil(mapWidth / tileSize);
    this.rows = Math.ceil(mapHeight / tileSize);

    // 0 = walkable, 1 = blocked
    this.grid = Array.from({ length: this.rows }, () =>
      new Array(this.cols).fill(0)
    );

    for (const b of boundaries) {
      const startCol = Math.floor(b.x / tileSize);
      const startRow = Math.floor(b.y / tileSize);
      const endCol = Math.ceil((b.x + b.width) / tileSize);
      const endRow = Math.ceil((b.y + b.height) / tileSize);
      for (let r = startRow; r < endRow && r < this.rows; r++) {
        for (let c = startCol; c < endCol && c < this.cols; c++) {
          if (r >= 0 && c >= 0) this.grid[r][c] = 1;
        }
      }
    }
  }

  worldToTile(worldX, worldY) {
    return {
      col: Math.floor(worldX / (this.tileSize * this.scaleFactor)),
      row: Math.floor(worldY / (this.tileSize * this.scaleFactor)),
    };
  }

  tileToWorld(col, row) {
    return {
      x: (col + 0.5) * this.tileSize * this.scaleFactor,
      y: (row + 0.5) * this.tileSize * this.scaleFactor,
    };
  }

  isWalkable(col, row) {
    return (
      col >= 0 &&
      row >= 0 &&
      col < this.cols &&
      row < this.rows &&
      this.grid[row][col] === 0
    );
  }

  findPath(startX, startY, endX, endY) {
    const start = this.worldToTile(startX, startY);
    const end = this.worldToTile(endX, endY);
    if (!this.isWalkable(end.col, end.row)) return null;

    const openSet = [{ ...start, g: 0, h: 0, f: 0, parent: null }];
    const closedSet = new Set();
    const key = (c, r) => `${c},${r}`;

    openSet[0].h =
      Math.abs(end.col - start.col) + Math.abs(end.row - start.row);
    openSet[0].f = openSet[0].h;

    while (openSet.length > 0) {
      let currentIdx = 0;
      for (let i = 1; i < openSet.length; i++) {
        if (openSet[i].f < openSet[currentIdx].f) currentIdx = i;
      }
      const current = openSet.splice(currentIdx, 1)[0];

      if (current.col === end.col && current.row === end.row) {
        const path = [];
        let node = current;
        while (node) {
          path.unshift(this.tileToWorld(node.col, node.row));
          node = node.parent;
        }
        return path;
      }

      closedSet.add(key(current.col, current.row));

      const neighbors = [
        { col: current.col, row: current.row - 1 },
        { col: current.col, row: current.row + 1 },
        { col: current.col - 1, row: current.row },
        { col: current.col + 1, row: current.row },
      ];

      for (const n of neighbors) {
        if (!this.isWalkable(n.col, n.row)) continue;
        if (closedSet.has(key(n.col, n.row))) continue;

        const g = current.g + 1;
        const h = Math.abs(end.col - n.col) + Math.abs(end.row - n.row);
        const f = g + h;

        const existing = openSet.find(
          (o) => o.col === n.col && o.row === n.row
        );
        if (existing && g >= existing.g) continue;

        if (existing) {
          existing.g = g;
          existing.f = f;
          existing.parent = current;
        } else {
          openSet.push({ ...n, g, h, f, parent: current });
        }
      }
    }
    return null;
  }
}
