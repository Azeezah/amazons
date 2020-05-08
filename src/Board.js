import React from 'react';
import { useState, useEffect } from 'react';
import { makeStyles } from "@material-ui/core/styles";
import black_piece from './first.svg';
import white_piece from './second.svg';
import arrow from './arrow.svg';
import './Board.css';

const useStyles = makeStyles({
  b: {
    backgroundImage: "url("+ black_piece + ")",
    cursor: "pointer",
  },
  w: {
    backgroundImage: "url("+ white_piece + ")",
    cursor: "pointer",
  },
  a: {
    backgroundImage: "url("+ arrow + ")",
  },
  selected: {
    backgroundColor: "#33aa3377 !important",
  },
});

function Board(props) {
  // props:
  //    position ::= fen string
  //    doMove ::= (x, y) => void
  const classes = useStyles();
  const phases = {selectPiece:0, selectDestination:1, placeArrow:2};
  const [movePhase, setMovePhase] = useState(phases.selectPiece);
  const [sourceSq, setSourceSq] = useState(null);
  const [destinationSq, setDestinationSq] = useState(null);
  const [arrowSq, setArrowSq] = useState(null);
  const [board, setBoard] = useState([]);
  const defaultBoard = "8/2w2b2/1b4w1/8/8/1w4b1/2b2w2/8";
  /*
  default board:
  . . . . . . . .
  . . w . . b . .
  . b . . . . w .
  . . . . . . . .
  . . . . . . . .
  . w . . . . b .
  . . b . . w . .
  . . . . . . . .
  */

  useEffect(()=>{setBoard(from_fen_string(props.fen || defaultBoard))}, [props.fen]);
  useEffect(renderSelection, [sourceSq]);
  useEffect(renderMove, [destinationSq]);
  useEffect(renderArrow, [arrowSq]);

  function renderSelection() {
    if (!board || !board.length) { return; }
    let _board = board.map(row=>row.map(sq=>({...sq, selected:false})));
    if (sourceSq) {
      let [x, y] = sourceSq;
      _board[y][x].selected = true;
    }
    setBoard(_board);
  }

  function renderMove() {
    if (!sourceSq || !destinationSq || !board) { return; }
    let [x0, y0] = sourceSq;
    let [x, y] = destinationSq;
    let _board = board.map(row=>row.map(sq=>({...sq, selected:false})));
    _board[y][x].piece = _board[y0][x0].piece;
    _board[y0][x0].piece = '';
    setBoard(_board);
  }

  function renderArrow() {
    if (!arrowSq || !board) { return; }
    let _board = board.map(row=>row.map(sq=>({...sq})));
    let [x, y] = arrowSq;
    _board[y][x].piece = 'a';
    setBoard(_board);
  }

  function from_fen_string(fen, size=8) {
    let _board = [];
    let y = 0;
    for (let row of fen.split('/')) {
      let x = 0;
      _board.push(Array(size).fill(''));
      for (let token of row.match(/\d+|w|b/g)) {
        if (+token) {
          x += +token;
        }
        else {
          _board[y][x] = { piece:token };
          x++;
        }
      }
      y++;
    }
    return _board;
  }

  function to_fen_string(_board) {
    const row_fen = row => {
      let fen = "";
      let num_empty = 0;
      for (let token of row) {
        if (!token) { num_empty += 1 }
        else {
          fen += (num_empty || "") + token;
          num_empty = 0;
        }

      }
      fen += num_empty || "";
      return fen;
    }
    return board.map(row_fen).join('/');
  }

  function all(bools) { return bools.reduce((truth, b) => truth && b, true) }

  function verify_fen(fen, size=8) {
    // Verify that there are `size` rows, formatted with the correct tokens.
    if (!fen.match(new RegExp(Array(size).fill("([wb]|\\d+)*").join('/')))) {
      return false;
    }
    // Verify that each row's contents sum to `size`.
    return all(fen.split('/').map(row => !row || size === row.match(/\d+|w|b/g)
        .reduce((sum, token) => sum + (+token||1), 0)));
  }

  function clickSq(e) {
    console.log(e.target.dataset, movePhase);
    let {x, y} = e.target.dataset;
    switch(movePhase) {
      case phases.selectPiece:
        setSourceSq([x, y]);
        setMovePhase(phases.selectDestination);
        break;
      case phases.selectDestination:
        setDestinationSq([x, y]);
        setMovePhase(phases.placeArrow);
        // Todo: Allow player to change selection.
        break;
      case phases.placeArrow:
        let _arrowSq = [x, y];
        setArrowSq(_arrowSq);
        if (props.doMove) {
          props.doMove(sourceSq, destinationSq, _arrowSq);
        }
        setMovePhase(phases.selectPiece);
        break;
      default:
        console.log("Error: Move phase not found.");
    }
  }

  return (
    <table className="board-table"><tbody className="board">
    {
      board.map((row, y) =>
        <tr>
          {
            row.map((sq, x) =>
              <td
                data-x={x}
                data-y={y}
                onClick={clickSq}
                className={[classes[sq.piece],
                  (sq.selected ? classes.selected : '')].join(' ')}></td>)
          }
        </tr>)
    }
    </tbody></table>
  );
}
export default Board;
