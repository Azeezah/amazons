import React from 'react';
import { useState, useEffect } from 'react';
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import { SkittleBot } from './Bots';
import { Pieces, movesToBoard } from './BoardUtils';
import Board from './Board';
import firebase from 'firebase';
import Authentication from './Authentication';
import player1PieceImage from './first.svg';
import player2PieceImage from './second.svg';

const useStyles = makeStyles({
  row: {
    paddingTop: '30px',
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
    flexShrink: '10',
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
});

function Play(props) {
  const classes = useStyles();
  const [gameid, setGameid] = useState(props.gameid);
  const [moves, setMoves] = useState([]);
  const [player, setPlayer] = useState(Pieces.player1);
  const [opponent, setOpponent] = useState(Pieces.player2);
  const [user, setUser] = useState(null);
  const [useBot, setUseBot] = useState(true);

  const defaultGame = {
    player1: {displayName: "You"},
    player2: {displayName: "SkittleBot"},
  }

  const [game, setGame] = useState(defaultGame);

  useEffect(()=>{setGameid(props.gameid);}, [props.gameid]);
  useEffect(listenForMoves, [gameid]);
  useEffect(()=>{loadGame();}, [gameid]);
  useEffect(updateLocalPlayer, [game, user]);
  useEffect(() => {
    Authentication.getUser().then(user=>setUser(user));
  }, []);

  function updateLocalPlayer() {
    // Todo: Implement spectators.
    // Todo: Abstract other player.
    if (!game || !user) { return; }
    if (![game.player1id, game.player2id].includes(user.id)) { return; }
    setPlayer(user.id === game.player1id ? Pieces.player1 : Pieces.player2);
    setOpponent(user.id === game.player1id ? Pieces.player2 : Pieces.player1);
  }

  async function loadGame() {
    if (!gameid) { return; }
    const response = await firebase.firestore().collection('games').doc(gameid).get();
    if (!response) { console.log("Couldn't load game."); return; }
    if (!response.exists) { console.log("Game does not exist: ", gameid); return; }
    const _game = response.data();
    _game.player1 = await Authentication.getUserById(_game.player1id);
    _game.player2 = await Authentication.getUserById(_game.player2id);
    if (![_game.player1id, _game.player2id].includes('skittlebotid')) {
      setUseBot(false);
    }
    setGame(_game);
  }

  function listenForMoves() {
    if (!gameid) { return; }
    const unsubscribe = firebase.firestore().collection('games')
      .doc(gameid).onSnapshot(doc => {
      if (!doc.exists) {
        console.log("Cannot listen for moves from game:", gameid);
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

  function finishTurn(moves) {
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
        console.log("bot resigns");
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
        <span style={{width:'200%'}}>
          {
            player === Pieces.player1 && player1ToMove
          ? "Your Turn"
          :  player === Pieces.player2 && player1ToMove
          ? "Waiting for Opponent"
          : <>&nbsp;</>
          }
        </span>
      </div>
      <Board finishTurn={finishTurn} moves={moves} player={player} />
      <div className={classes.playerCard}>
        <img className={classes.playerImage} src={player2PieceImage} alt="player2" />
        <span>{game.player2.displayName}</span>
        <span style={{width:'200%'}}>
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
    </>);
}

export default Play;
