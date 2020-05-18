import React, { useState, useEffect } from 'react';
import { makeStyles } from "@material-ui/core/styles";
import firebase from 'firebase';
import Board from './Board';
import leftArrow from './left.svg';
import rightArrow from './right.svg';

const useStyles = makeStyles({
  row: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    marginLeft: '20px',
  },
  board: {
    flexShrink: '0',
  },
  movesWidget: {
    boxShadow: '0 2px 2px 0 rgba(0,0,0,0.14), 0 3px 1px -2px rgba(0,0,0,0.2), 0 1px 5px 0 rgba(0,0,0,0.12)',
    height: '350px',
    overflow: 'auto',
  },
  coord: {
    textAlign: 'center',
  },
  moves: {
    maxHeight: 'calc(300px)',
    overflow: 'scroll',
  },
  // Todo: Don't scroll header.
  header: {
    '& th': {
      padding: '15px',
    },
  },
  highlighted: {
    // Todo: Set scroll to focus.
    backgroundColor: '#ddd',
  },
  arrow: {
    padding: '15px',
    height: '30px',
    filter: 'drop-shadow(1px 2px 1.05px rgba(0, 0, 0, 0.6))'
  },
  button: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    outline: 'none !important',  // This uses !important to override :focus.
  },
});

function Moves(props) {
  const classes = useStyles();
  return (<div className={classes.column}>
    <div className={classes.movesWidget}>
    <table>
    <tbody className={classes.moves}>
    <tr className={classes.header}>
      <th>Source</th>
      <th>Destination</th>
      <th>Arrow</th>
    </tr>
    {
      props.moves.map((move, i) =>
        <tr key={i} className={i===props.moveIndex-1 ? classes.highlighted : ""}>
          {
            move.map(([x, y])=><td className={classes.coord}>({x},{y})</td>)
          }
        </tr>)
    }
    </tbody>
    </table>
    </div>
    <div className={classes.row}>
      <button onClick={props.prevMove} className={classes.button}>
        <img src={leftArrow} className={classes.arrow} />
      </button>
      <button onClick={props.nextMove} className={classes.button}>
        <img src={rightArrow} className={classes.arrow} />
      </button>
    </div>
  </div>);
}

function Replay(props) {
  const classes = useStyles();
  const defaultMoves = [
    [[1, 2], [3, 4], [1, 2]],
    [[2, 1], [1, 1], [3, 1]],
  ];
  const [moves, setMoves] = useState(defaultMoves);
  const [moveIndex, setMoveIndex] = useState(0);
  useEffect(loadGame, [props.gameid]);

  function loadGame() {
    if (!props.gameid) { return; }
    firebase.firestore().collection('games').doc(props.gameid).get()
      .then(doc=>setMoves(JSON.parse(doc.data().moves)));
  }

  function nextMove() {
    setMoveIndex(Math.min(moveIndex + 1, moves.length));
  }

  function prevMove() {
    setMoveIndex(Math.max(moveIndex - 1, 0));
  }

  document.onkeydown = function (e) {
    e = e || window.event;
    const left = 37, right = 39;
    switch (e.keyCode) {
      case right: {
        nextMove();
        break;
      }
      case left: {
        prevMove();
        break;
      }
      default: {
        break;
      }
    }
  }

  return (
    <div className={classes.row}>
      <div className={classes.board}>
        <Board moves={moves.slice(0, moveIndex)} />
      </div>
      <Moves moves={moves} moveIndex={moveIndex} nextMove={nextMove}
        prevMove={prevMove} />
    </div>
  );
}

export default Replay;
