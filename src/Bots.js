function line_of_sight(board, start, finish) {
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

function arr_eq(arr1, arr2) {
  if (arr1.length !== arr2.length) { return false; }
  for (let i=0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) { return false; }
  }
  return true;
}

export class SkittleBot {
  static move(board, piece_to_move) {
    // Locate pieces to move.
    let piece_squares = [];
    for (let y=0; y < board.length; y++) {
      for (let x=0; x < board[y].length; x++) {
        if (board[y][x].piece === piece_to_move) {
          piece_squares.push([x, y]);
        }
      }
    }

    // Locate destination squares.
    let valid_moves = [];
    for (let y=0; y < board.length; y++) {
      for (let x=0; x < board[y].length; x++) {
        for (let source of piece_squares) {
          let destination = [x, y];
          if (!arr_eq(source, destination) && line_of_sight(board, source, destination)) {
            let arrow_sq = source;
            valid_moves.push([source, destination, arrow_sq]);
          }
        }
      }
    }
    return valid_moves.length
      ? valid_moves[Math.floor(Math.random()*valid_moves.length)]
      : null;
  }
}

