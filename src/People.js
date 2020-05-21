import React, {useState, useEffect} from 'react';
import firebase from 'firebase';
import UserCard from './UserCard';
import Authentication from './Authentication';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  people: {
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

function People(props) {
  const classes = useStyles();
  const [user, setUser] = useState(null);
  const defaultProfiles = [
    {
      id: 'skittlebotid',
      displayName: 'SkittleBot',
    },
    {
      id: 'crBAraKQLxQ5T6XlhRpAnFAxQwI2',
      displayName: 'Azeezah',
    },
  ];
  const [profiles, setProfiles] = useState(defaultProfiles);
  useEffect(()=>{setUser(props.user)}, [props.user]);
  useEffect(()=>{loadProfiles()}, []);

  async function loadProfiles() {
    firebase.firestore().collection('users').get()
      .then(_profiles => {
        if (!_profiles.docs.length) { return; }
        setProfiles(_profiles.docs.map(doc=>({
          id: doc.id,
          displayName: doc.data().displayName,
          photoURL: doc.data().photoURL,
        })));
    });
  }
  return (<div className={classes.people}>
    <h1 className={classes.header}>People</h1>
    { profiles && profiles.length
      ? profiles.map(profileUser=>
          <UserCard profileUser={profileUser} />)
      : "There are no players."
    }
  </div>);
}

export default People;

