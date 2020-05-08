import React from 'react';
import { useState, useEffect } from 'react';
import { SkittleBot } from './Bots';
import { Pieces } from './BoardUtils';
import Board from './Board';

function Play(props) {
  let [opponentMove, setOpponentMove] = useState(null);
  const player = Pieces.player1;
  const opponent = Pieces.player2;

  function fetchOpponentMove(board) {
    let player_piece = opponent;
    setOpponentMove(SkittleBot.move(board, player_piece));
  }

  return <Board finishTurn={fetchOpponentMove} opponentMove={opponentMove}
                player={player} />;
}

export default Play;
