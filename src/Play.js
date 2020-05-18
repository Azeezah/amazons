import React from 'react';
import { useState, useEffect } from 'react';
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import { SkittleBot } from './Bots';
import { Pieces, movesToBoard, isEndOfGame } from './BoardUtils';
import Board from './Board';
import GameEndModal from './GameEnd';
import firebase from 'firebase';
import Authentication from './Authentication';
import player1PieceImage from './first.svg';
import player2PieceImage from './second.svg';
import Database from './Database';

const useStyles = makeStyles({
  row: {
    display: 'flex',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  buttonRow: {
    padding: '30px',
    display: 'flex',
    justifyContent: 'center',
  },
  playerCard: {
    flexShrink: '1',
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'center',
    alignItems: 'center',
    '& span': {
      width: 'calc(100vw / 8)',
    },
  },
  playerImage: {
    width: '130px',
  },
  board: {
    flexShrink: '0',
  },
});

function Play(props) {
  const classes = useStyles();
  const [gameid, setGameid] = useState(props.gameid);
  const [moves, setMoves] = useState([]);
  const [player, setPlayer] = useState(Pieces.player1);
  const [opponent, setOpponent] = useState(Pieces.player2);
  const [user, setUser] = useState(null);
  const [useBot, setUseBot] = useState(true);
  const [endOfGame, setEndOfGame] = useState(false);

  const defaultGame = {
    player1: {displayName: "You"},
    player2: {displayName: "SkittleBot"},
  }

  const [game, setGame] = useState(defaultGame);

  useEffect(()=>{setUser(props.user)}, [props.user])
  useEffect(()=>{setGameid(props.gameid);}, [props.gameid]);
  useEffect(listenForMoves, [gameid]);
  useEffect(loadGame, [gameid]);
  useEffect(updateLocalPlayer, [game, user]);

  function updateLocalPlayer() {
    // Todo: Implement spectators.
    // Todo: Abstract other player.
    if (!game || !user) { return; }
    if (![game.player1id, game.player2id].includes(user.id)) { return; }
    setPlayer(user.id === game.player1id ? Pieces.player1 : Pieces.player2);
    setOpponent(user.id === game.player1id ? Pieces.player2 : Pieces.player1);
  }

  function loadGame() {
    if (!gameid) { return; }
    Database.Games.getById(gameid).then(async _game => {
      _game.player1 = await Authentication.getUserById(_game.player1id);
      _game.player2 = await Authentication.getUserById(_game.player2id);
      if (!_game.players.includes('skittlebotid')) {
        setUseBot(false);
      }
      setGame(_game);
    }).catch(err => console.log("Couldn't load game:", gameid, err));
  }

  function listenForMoves() {
    if (!gameid) { return; }
    const unsubscribe = Database.Games.listenForMoves(gameid, (moves) => {
      if (moves && moves.length) {
        setMoves(moves);
        if (isEndOfGame(moves)) {
          setEndOfGame(true);
        }
      }
    });
    return () => unsubscribe();
  }

  function sendMoves(moves) {
    let _moves = JSON.stringify(moves);
    firebase.firestore().collection('games').doc(gameid).update({moves:_moves, playerToMove:opponent});
  }

  function finishTurn(moves) {
    if (isEndOfGame(moves)) {
      setEndOfGame(true);
    }
    setMoves(moves);
    sendMoves(moves);
  }

  function runBot() {
    if (useBot &&
        ((moves.length % 2 === 0 && opponent === Pieces.player1)
      || (moves.length % 2 === 1 && opponent === Pieces.player2))) {
      let player_piece = opponent;
      const board = movesToBoard(moves);
      let move = SkittleBot.move(board, player_piece);

      if (!move) {
        setEndOfGame(true);
        return;
      }
      setMoves([...moves, move]);

      // Local bot should send moves to the database for the spectators.
      let _moves = JSON.stringify([...moves, move]);
      firebase.firestore().collection('games').doc(gameid).update({moves:_moves, playerToMove:player});
    }
  }

  useEffect(runBot, [useBot, moves, player, opponent]);

  function swapSides() {
    if (player === Pieces.player1) {
      setPlayer(Pieces.player2);
      setOpponent(Pieces.player1);
    } else {
      setPlayer(Pieces.player1);
      setOpponent(Pieces.player2);
    }
  }

  function toggleBot() {
    setUseBot(!useBot);
  }

  const player1ToMove = moves.length % 2 === 0;

  return (<>
    <div className={classes.row}>
      <div className={classes.playerCard}>
        <img className={classes.playerImage} src={player1PieceImage} alt="player1" />
        <span>{game.player1.displayName}</span>
        <span>
          {
            player === Pieces.player1 && player1ToMove
          ? "Your Turn"
          :  player === Pieces.player2 && player1ToMove
          ? "Waiting for Opponent"
          : <>&nbsp;</>
          }
        </span>
      </div>
      <div className={classes.board}>
        <Board finishTurn={finishTurn} moves={moves} player={player} />
      </div>
      <div className={classes.playerCard}>
        <img className={classes.playerImage} src={player2PieceImage} alt="player2" />
        <span>{game.player2.displayName}</span>
        <span>
          {
            player === Pieces.player2 && !player1ToMove
          ? "Your Turn"
          :  player === Pieces.player1 && !player1ToMove
          ? "Waiting for Opponent"
          : <>&nbsp;</>
          }
        </span>
      </div>
    </div>
    <div className={classes.buttonRow}>
      <Button variant="outlined" onClick={swapSides}>Swap Sides</Button>
      &nbsp;
      <Button variant="outlined" onClick={toggleBot}>{useBot ? "Disable Bot" : "Enable Bot"}</Button>
    </div>
    { endOfGame ? <GameEndModal gameid={gameid} /> : "" }
    </>);
}

export default Play;
