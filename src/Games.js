import React, {useState, useEffect} from 'react';
import firebase from 'firebase';
import GameCard from './GameCard';
import Authentication from './Authentication';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  games: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  header: {
    fontFamily: 'sans-serif',
    color: '#555',
    fontWeight: 'inherit',
  },
});

function Games(props) {
  const classes = useStyles();
  const defaultGames = [
    {
      id: 'defaultgameid1',
      player1DisplayName: 'Janaki',
      player2DisplayName: 'Malomo',
    },
    {
      id: 'defaultgameid2',
      player1DisplayName: 'Pierre',
      player2DisplayName: 'Atsuya',
    },
  ];
  const [games, setGames] = useState(defaultGames);
  useEffect(()=>{loadGames()}, []);

  async function loadGames() {
    const seven_days_ago = (new Date()).getTime() - (7 * 24 * 60 * 60 * 1000);
    try {
      // Fetch games.
      const games_snapshot = await firebase.firestore().collection('games')
        .where('creation', '>', seven_days_ago).get();
      const player_ids = [];
      if (games_snapshot.docs.length === 0) {
        console.log('No one has started any games recently.');
        setGames([]);
        return;
      }
      for (let doc of games_snapshot.docs) {
        player_ids.push(doc.data().player1id);
        player_ids.push(doc.data().player2id);
      }
      // Fetch display names.
      const players_snapshot = await firebase.firestore().collection('users')
        .where('id', 'in', player_ids).get();
      const names = {};
      for (let doc of players_snapshot.docs) {
        names[doc.data().id] = doc.data().displayName;
      }
      // Todo: Implement fetchPlayersByIds in DAO so this getPseudonym
      // helper doesn't need to be exposed.
      const games = games_snapshot.docs.map(doc=>({
        player1DisplayName: names[doc.data().player1id] || Authentication.getPseudonym(doc.data().player1id),
        player2DisplayName: names[doc.data().player2id] || Authentication.getPseudonym(doc.data().player2id),
        id: doc.id,
      }));
      setGames(games);
    }
    catch (err) {
      console.log('Couldn\'t load games: ', err);
      return;
    }
  }
  return (<div className={classes.games}>
    <h1 className={classes.header}>Spectate Games</h1>
    { games && games.length
      ? games.map(g=>
          <GameCard gameid={g.id}
            player1={g.player1DisplayName}
            player2={g.player2DisplayName} />)
      : "No one has started any games recently."
    }
  </div>);
}

export default Games;

