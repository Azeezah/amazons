import React from 'react';
import { useState, useEffect } from 'react';
import { SkittleBot } from './Bots';
import { Pieces } from './BoardUtils';
import Board from './Board';
import firebase from 'firebase';

function Play(props) {
  const [gameid, setGameid] = useState(props.gameid);
  const [moves, setMoves] = useState([]);
  const [player, setPlayer] = useState(Pieces.player1);
  const [opponent, setOpponent] = useState(Pieces.player2);
  const [user, setUser] = useState("Azeezah");

  const defaultGame = {
    player1id: "Azeezah",
    player2id: "SkittleBot",
    moves: [],
  }

  const [game, setGame] = useState(defaultGame);

  useEffect(()=>{setGameid(props.gameid);}, [props.gameid]);
  useEffect(listenForMoves, [gameid]);
  useEffect(()=>{loadGame();}, [gameid]);
  useEffect(updateLocalPlayer, [game, user]);

  function updateLocalPlayer() {
    // Todo: Implement spectators.
    // Todo: Abstract other player.
    setPlayer(user === game.player1id ? Pieces.player1 : Pieces.player2);
    setOpponent(user === game.player1id ? Pieces.player2 : Pieces.player1);
  }

  async function loadGame() {
    if (!gameid) { return; }
    const _game = await firebase.firestore().collection('games').doc(gameid).get();
    if (!_game) { console.log("Couldn't load game."); }
    console.log(_game.data());
    setGame(_game ? _game.data() : defaultGame);
  }

  function listenForMoves() {
    if (!gameid) { return; }
    const unsubscribe = firebase.firestore().collection('games')
      .doc(gameid).onSnapshot(doc => {
      if (!doc.exists) {
        console.log("Game not found:", gameid);
        return;
      }
      console.log('Player to move:', doc.data().playerToMove);
      let moves = JSON.parse(doc.data().moves);
      if (moves && moves.length) {
        setMoves(moves);
      }
    });
    return () => unsubscribe();
  }

  function sendMoves(moves) {
    let _moves = JSON.stringify(moves);
    firebase.firestore().collection('games').doc(gameid).update({moves:_moves, playerToMove:opponent});
  }

  function runBot(board, moves) {
    let player_piece = opponent;
    let move = SkittleBot.move(board, player_piece);
    setMoves([...moves, move]);
    // Local bot should send moves to the database for the spectators.
    let _moves = JSON.stringify([...moves, move]);
    firebase.firestore().collection('games').doc(gameid).update({moves:_moves, playerToMove:player});
  }

  function finishTurn(board, moves) {
    if (useBot) {
      runBot(board, moves);
    } else {
      sendMoves(moves);
    }
  }

  function swapSides() {
    if (player === Pieces.player1) {
      setPlayer(Pieces.player2);
      setOpponent(Pieces.player1);
    } else {
      setPlayer(Pieces.player1);
      setOpponent(Pieces.player2);
    }
  }

  const [useBot, setUseBot] = useState(false);
  function toggleBot() {
    setUseBot(!useBot);
  }

  return (<>
    Game: {game.player1id} vs {game.player2id}<br />
    You are {player}<br />
    <button onClick={swapSides}>Swap Sides</button>
    <button onClick={toggleBot}>{useBot ? "Disable Bot" : "Enable Bot"}</button>
    <Board finishTurn={finishTurn} moves={moves} player={player} />
    </>);
}

export default Play;
