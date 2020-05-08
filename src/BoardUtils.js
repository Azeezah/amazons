export const Pieces = {
  player1: 'player1',
  player2: 'player2',
  arrow: 'arrow',
}

export class FEN {
  static toPiece = {
    'b': Pieces.player1,
    'w': Pieces.player2,
    'a': Pieces.arrow,
  }

  static fromPiece = {
    [Pieces.player1] : 'b',
    [Pieces.player2] : 'w',
    [Pieces.arrow] : 'a',
  }

  static toBoard(fen, size=8) {
    let board = [];
    let y = 0;
    for (let row of fen.split('/')) {
      let x = 0;
      board.push(Array(size).fill(''));
      for (let token of row.match(/\d+|w|b/g)) {
        if (+token) {
          x += +token;
        }
        else {
          board[y][x] = { piece: FEN.toPiece[token] };
          x++;
        }
      }
      y++;
    }
    return board;
  }

  static fromBoard(board) {
    const row_fen = row => {
      let fen = "";
      let num_empty = 0;
      for (let sq of row) {
        if (!sq.piece) { num_empty += 1 }
        else {
          fen += (num_empty || "") + FEN.fromPiece[sq.piece];
          num_empty = 0;
        }

      }
      fen += num_empty || "";
      return fen;
    }
    return board.map(row_fen).join('/');
  }

  static verify(fen, size=8) {
    function all(bools) { return bools.reduce((truth, b) => truth && b, true) }

    // Verify that there are `size` rows, formatted with the correct tokens.
    if (!fen.match(new RegExp(Array(size).fill("([wb]|\\d+)*").join('/')))) {
      return false;
    }
    // Verify that each row's contents sum to `size`.
    return all(fen.split('/').map(row => !row || size === row.match(/\d+|w|b/g)
        .reduce((sum, token) => sum + (+token||1), 0)));
  }
}

export function line_of_sight(board, start, finish) {
  let [x0, y0] = start;
  let [x, y] = finish;
  let [dx, dy] = [x-x0, y-y0];

  // Check whether start and finish are colinear.
  if (![dx+dy, dx-dy, dx, dy].includes(0)) {
    return false;
  }

  // Map (-inf, inf) onto {-1, 0, 1}.
  let [ux, uy] = [dx?dx/Math.abs(dx):0, dy?dy/Math.abs(dy):0];

  // Iterate over intervening squares and return false if any are not empty
  // (excluding start square, including end square).
  for (let i=ux, j=uy; i!==dx+ux || j!==dy+uy; i+=ux, j+=uy) {
    if (board[y0+j][x0+i].piece) {
      return false;
    }
  }
  return true;
}

