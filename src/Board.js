import React from 'react';
import { useState, useEffect } from 'react';
import { makeStyles } from "@material-ui/core/styles";
import { Pieces, FEN, line_of_sight, movesToBoard } from './BoardUtils';
import player1Sprite from './first.svg';
import player2Sprite from './second.svg';
import arrowSprite from './arrow.svg';
import bowSprite from './bowandarrow.jpg';
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
  sq: {
    overflow: 'hidden',
  },
  // Todo: Make the background transparent so we don't need mix blend mode.
  // Todo: Find find a cleaner way to make the image not expand the box.
  bow: {
    width: '70.71%',  // 100% / sqrt 2: So the image doesn't expand the box.
    height: '70.71%',
    mixBlendMode: 'multiply',
  },
});

function Board(props) {
  // props:
  //    startPosition ::= FEN string
  //    finishTurn ::= (moves) => void
  //    moves ::= [move]
  //      where move ::= [sourceSq, destinationSq, arrowSq]
  //      where Sq ::= [x, y]
  //    player ::= Pieces.player1 || Pieces.player2
  const classes = useStyles();
  const [board, setBoard] = useState([]);
  const [player, setPlayer] = useState(Pieces.player1);
  const [playerToMove, setPlayerToMove] = useState(Pieces.player1);
  const [moves, setMoves] = useState([]);
  const phases = {selectPiece:0, selectDestination:1, placeArrow:2};
  const [movePhase, setMovePhase] = useState(phases.selectPiece);
  const [sourceSq, setSourceSq] = useState(null);
  const [destinationSq, setDestinationSq] = useState(null);
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

  // Todo: Fix bug where user is stuck in select phase if they swap sides.
  useEffect(()=>{setBoard(FEN.toBoard(props.startPosition || defaultBoard))}, [props.startPosition]);
  useEffect(()=>{setPlayer(props.player || Pieces.player1)}, [props.player]);
  useEffect(()=>{setMoves(props.moves)}, [props.moves]);
  useEffect(renderSelection, [sourceSq]);
  useEffect(renderMove, [destinationSq]);
  useEffect(renderMoves, [moves]);

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

    // Don't render the same move twice.
    if (board[y][x].piece) { return; }
    let _board = board.map(row=>row.map(sq=>({...sq, selected:false})));
    _board[y][x].piece = _board[y0][x0].piece;
    _board[y0][x0].piece = '';
    setBoard(_board);
  }

  function finishMove(arrowSq) {
    setSourceSq(null);
    setDestinationSq(null);
    let move = [sourceSq, destinationSq, arrowSq];
    setMoves([...moves, move]);
    if (props.finishTurn) {
      props.finishTurn([...moves, move]);
    }
  }

  function renderMoves() {
    if (!moves || !moves.length) { return; }
    setBoard(movesToBoard(moves));
    setPlayerToMove(moves.length%2===0 ? Pieces.player1 : Pieces.player2);
  }

  function clickSq(e) {
    if (playerToMove !== player) { return; }
    const x = +e.target.dataset.x;
    const y = +e.target.dataset.y;

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
        finishMove([x, y]);
        setMovePhase(phases.selectPiece);
        break;
      default:
        console.log("Error: Move phase not found.");
    }
  }

  function rotateBow(e) {
    for (let bow of document.getElementsByClassName(classes.bow)) {
      const rect = bow.getBoundingClientRect();
      const x0 = rect.left + rect.width / 2;
      const y0 = rect.top + rect.height / 2;
      const x = e.clientX;
      const y = e.clientY;
      const angle = Math.atan2(y-y0, x-x0) * 360 / (2 * Math.PI);
      bow.style.transform = 'rotateZ('+angle+'deg)';
    }
  }

  return (
    <table className="board-table" onMouseMove={rotateBow}>
    <tbody className="board">
    {
      board.map((row, y) =>
        <tr>
          {
            row.map((sq, x) =>
              <td
                data-x={x}
                data-y={y}
                onClick={clickSq}
                className={[classes.sq, classes[sq.piece],
                  (sq.selected ? classes.selected : '')].join(' ')}>
                {
                  destinationSq && destinationSq.join() === [x, y].join()
                  ? <img className={classes.bow} src={bowSprite} alt="bow" />
                  : ""
                }
              </td>)
          }
        </tr>)
    }
    </tbody>
    </table>
  );
}
export default Board;
