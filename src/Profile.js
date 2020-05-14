import React, {useState, useEffect} from 'react';
import firebase from 'firebase';
import GameCard from './GameCard';
import Authentication from './Authentication';
import { makeStyles } from '@material-ui/core/styles';
import BotIcon from './BotIcon.svg';
import defaultProfileImage from './defaultProfileImage.svg';

const useStyles = makeStyles({
  profile: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  photo: {
    borderRadius: '50%',
    width: '100px',
    filter: 'drop-shadow(1px 2px 1.05px rgba(0, 0, 0, 0.6))',
  },
  name: {
    fontFamily: 'sans-serif',
    color: '#555',
    fontWeight: 'inherit',
  },
});

function Profile(props) {
  const classes = useStyles();
  const [user, setUser] = useState(null);
  // Todo: Set bot's photo in auth and use a more generic default here.
  const defaultProfileUser = {
    id: 'skittlebotid',
    displayName: 'SkittleBot',
    photoURL: BotIcon,
  }
  const [profileUser, setProfileUser] = useState(defaultProfileUser);
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
  useEffect(()=>{setUser(props.user)}, [props.user]);
  useEffect(updateProfileUser, [user]);
  useEffect(()=>{loadGames()}, [profileUser]);
  useEffect(loadProfileUser, [props.profileid]);

  function updateProfileUser() {
    if (profileUser.id === props.profileid) { return; }
    setProfileUser(user || defaultProfileUser);
  }

  function loadProfileUser() {
    if (!props.profileid) { return; }
    Authentication.getUserById(props.profileid)
      .then(_user=>{setProfileUser(_user)});
  }

  async function loadGames() {
    if (!profileUser) { return; }
    // Todo: Filter to get only completed games.
    try {
      // Fetch games for user id.
      const games_snapshot = await firebase.firestore().collection('games')
        .where('players', 'array-contains', profileUser.id).get();
      const player_ids = [];
      if (games_snapshot.docs.length === 0) {
        console.log('This user hasn\'t played any games yet.');
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
  return (<div className={classes.profile}>
    <img src={ profileUser.photoURL || defaultProfileImage } className={classes.photo} />
    <h1 className={classes.name}>{ profileUser ? profileUser.displayName : '' }</h1>
    { games && games.length
      ? games.map(g=>
          <GameCard gameid={g.id}
            player1={g.player1DisplayName}
            player2={g.player2DisplayName} />)
      : "This user hasn't played any games yet."
    }
  </div>);
}

export default Profile;

