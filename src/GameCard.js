import React, { useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Player1Sprite from './first.svg';
import Player2Sprite from './second.svg';
import Paper from "@material-ui/core/Paper";

const useStyles = makeStyles({
  card: {
    width: 'calc(50vw)',
    display: 'flex',
    justifyContent: 'space-around',
    fontFamily: 'sans-serif',
    lineHeight: '50px',
    margin: 'auto',
    marginBottom: '10px',
  },
  playerIcon: {
    width: '50px',
    height: '50px',
  },
  link: {
    color: 'inherit',
    textDecoration: 'inherit',
  },
});

function GameCard(props) {
  const classes = useStyles();
  return (
    <a href={"/replay/"+props.gameid} className={classes.link}>
    <Paper className={classes.card}>
      <img className={classes.playerIcon} src={Player1Sprite} alt="player1" />
      <div>{props.player1}</div> vs
      <img className={classes.playerIcon} src={Player2Sprite} alt="player2" />
      <div>{props.player2}</div>
    </Paper>
    </a>
  );
}

export default GameCard;
