import React from 'react';
import { useState, useEffect } from 'react';
import { SkittleBot } from './Bots';
import { Pieces } from './BoardUtils';
import Board from './Board';
import firebase from 'firebase';

function Play(props) {
  const [gameid, setGameid] = useState(props.gameid || "defaultgame");
  const [moves, setMoves] = useState([]);
  const [player, setPlayer] = useState(Pieces.player1);
  const [opponent, setOpponent] = useState(Pieces.player2);

  useEffect(() => {
    const unsubscribe = firebase.firestore().collection('games')
      .doc(gameid).onSnapshot(doc => {
      if (!doc.exists) {
        console.log("Game not found:", gameid);
        return;
      }
      console.log('player to move:', doc.data().playerToMove);
      console.log('your move:', doc.data().playerToMove === player);
      if (doc.data().playerToMove === player) {
        let moves = JSON.parse(doc.data().moves);
        if (moves && moves.length) {
          setMoves(moves);
        }
      }
    });
    return () => unsubscribe();
  }, [player, opponent, gameid]);


  function sendMoves(moves) {
    let _moves = JSON.stringify(moves);
    firebase.firestore().collection('games').doc(gameid).set({moves:_moves, playerToMove:opponent});
  }

  function runBot(board, moves) {
    let player_piece = opponent;
    let move = SkittleBot.move(board, player_piece);
    setMoves([...moves, move]);
    // Local bot should send moves to the database for the spectators.
    let _moves = JSON.stringify([...moves, move]);
    firebase.firestore().collection('games').doc(gameid).set({moves:_moves, playerToMove:player});
  }

  function finishTurn(board, moves) {
    let useBot = false;
    if (useBot) {
      runBot(board, moves);
    } else {
      sendMoves(moves);
    }
  }

  function swapSides() {
    setPlayer(Pieces.player2);
    setOpponent(Pieces.player1);
  }

  return (<>
    You are {player}<br />
    <button onClick={swapSides}>swap</button>
    <Board finishTurn={finishTurn} moves={moves} player={player}
           opponent={opponent} />
    </>);
}

export default Play;
