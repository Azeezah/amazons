import { line_of_sight } from './BoardUtils';

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
          if (line_of_sight(board, source, destination)) {
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

