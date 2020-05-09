import React from 'react';
import { useState, useEffect } from 'react';
import { SkittleBot } from './Bots';
import { Pieces } from './BoardUtils';
import Board from './Board';
import firebase from 'firebase';

function Play(props) {
  const [gameid, setGameid] = useState(props.gameid || "defaultgame");
  const [opponentMove, setOpponentMove] = useState(null);
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
          let move = moves[moves.length-1];
          setOpponentMove(move);
        }
      }
    });
    return () => unsubscribe();
  }, [player, opponent]);


  function sendMoves(moves) {
    let _moves = JSON.stringify(moves);
    firebase.firestore().collection('games').doc(gameid).set({moves:_moves, playerToMove:opponent});
  }

  function runBot(board) {
    let player_piece = opponent;
    setOpponentMove(SkittleBot.move(board, player_piece));
  }

  function finishTurn(board, moves) {
    let useBot = false;
    if (useBot) {
      runBot(board);
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
    <Board finishTurn={finishTurn} opponentMove={opponentMove}
                player={player} opponent={opponent} />
    </>);
}

export default Play;
