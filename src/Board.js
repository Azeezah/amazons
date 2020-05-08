import React from 'react';
import { useState, useEffect } from 'react';
import { makeStyles } from "@material-ui/core/styles";
import { Pieces, FEN, line_of_sight } from './BoardUtils';
import player1Sprite from './first.svg';
import player2Sprite from './second.svg';
import arrowSprite from './arrow.svg';
import './Board.css';

const useStyles = makeStyles({
  [Pieces.player1]: {
    backgroundImage: "url("+ player1Sprite + ")",
    cursor: "pointer",
  },
  [Pieces.player2]: {
    backgroundImage: "url("+ player2Sprite + ")",
    cursor: "pointer",
  },
  [Pieces.arrow]: {
    backgroundImage: "url("+ arrowSprite + ")",
  },
  selected: {
    backgroundColor: "#33aa3377 !important",
  },
});

function Board(props) {
  // props:
  //    position ::= fen string
  //    doMove ::= (x, y) => void
  //    opponentMove ::= [[x0,y0], [x,y], [ax, ay]]
  const classes = useStyles();
  const [board, setBoard] = useState([]);
  const [player, setPlayer] = useState(Pieces.player1);
  const [opponent, setOpponent] = useState(Pieces.player2);
  const [playerToMove, setPlayerToMove] = useState(Pieces.player1);
  const phases = {selectPiece:0, selectDestination:1, placeArrow:2};
  const [movePhase, setMovePhase] = useState(phases.selectPiece);
  const [sourceSq, setSourceSq] = useState(null);
  const [destinationSq, setDestinationSq] = useState(null);
  const [arrowSq, setArrowSq] = useState(null);
  const [opponentMove, setOpponentMove] = useState(props.opponentMove);
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

  useEffect(()=>{setBoard(FEN.toBoard(props.fen || defaultBoard))}, [props.fen]);
  useEffect(()=>{setPlayer(props.player || Pieces.player1)}, [props.player]);
  useEffect(()=>{setOpponent(props.opponent || Pieces.player2)}, [props.opponent]);
  useEffect(()=>{setOpponentMove(props.opponentMove)}, [props.opponentMove]);
  useEffect(renderSelection, [sourceSq]);
  useEffect(renderMove, [destinationSq]);
  useEffect(renderArrow, [arrowSq]);
  useEffect(renderOpponentMove, [opponentMove]);

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
    _board[y][x].piece = Pieces.arrow;
    setBoard(_board);
    setPlayerToMove(opponent);
    if (props.finishTurn) {
      props.finishTurn(_board);
    }
  }

  function renderOpponentMove() {
    if (!opponentMove || !board) { return; }
    let [[x0, y0], [x, y], [ax, ay]] = opponentMove;
    let _board = board.map(row=>row.map(sq=>({...sq})));
    _board[y][x].piece = _board[y0][x0].piece;
    _board[y0][x0].piece = '';
    _board[ay][ax].piece = Pieces.arrow;
    setBoard(_board);
    setPlayerToMove(player);
  }

  /*
  // Todo: See if this way of managing moves isn't too laggy.
  function renderMoves() {
    if (!moves || !board) { return; }
    let _board = board.map(row=>row.map(sq=>({...sq})));
    for (let [[x0, y0], [x, y], [ax, ay]] of moves) {
      _board[y][x].piece = _board[y0][x0].piece;
      _board[y0][x0].piece = '';
      _board[ay][ax].piece = 'a';
    }
    setBoard(_board);
  }
  */

  function clickSq(e) {
    if (playerToMove !== player) { return; }
    let x = +e.target.dataset.x;
    let y = +e.target.dataset.y;

    switch(movePhase) {
      case phases.selectPiece:
        if (board[y][x].piece !== player) { return; }
        setSourceSq([x, y]);
        setMovePhase(phases.selectDestination);
        break;
      case phases.selectDestination:
        if (!line_of_sight(board, sourceSq, [x, y])) { return; }
        setDestinationSq([x, y]);
        setMovePhase(phases.placeArrow);
        // Todo: Allow player to change selection.
        break;
      case phases.placeArrow:
        if (!line_of_sight(board, destinationSq, [x, y])) { return; }
        setArrowSq([x, y]);
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
