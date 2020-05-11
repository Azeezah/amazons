import React, {useEffect, useState} from 'react';
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import firebase from 'firebase';
import {Pieces} from './BoardUtils';
import Authentication from './Authentication';
import amazonIcon from './first.svg';

const useStyles = makeStyles({
  leftCol: {
    float: 'left',
    width: '37%',
  },
  centerCol: {
    float: 'left',
    width: '26%',
    display: 'flex',
    justifyContent: 'center',
  },
  rightCol: {
    float: 'left',
    width: '37%',
  },
  newGameButton: {
    top: 'calc(100vh / 3 - 50px)',
    height: '100px',
  },
  joinGameButton: {
    borderRadius: '0',
    width: '100%',
  },
  challenges: {
    position: 'relative',
    top: 'calc(100vh / 4)',
    paddingTop: '0',
    padding: '20%',
    fontFamily: 'sans-serif',
    textAlign: 'center',
  },
  amazonIcon: {
    filter: 'drop-shadow(10px 20px 1px grey)',
    maxWidth: '300px',
  },
  featured: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
    top: 'calc(100vh / 3 - 150px)',
  }
});

function Home() {
  const classes = useStyles();
  const [proposalId, setProposalId] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [user, setUser] = useState(null);
  const botProposal = {
    id: 'botproposal',
    proposerid: 'skittlebotid',
    proposerDisplayName: 'SkittleBot',
  }

  useEffect(() => {
    Authentication.getUser().then(user=>setUser(user));
  }, []);

  useEffect(listenForProposals, [proposalId]);

  function listenForProposals() {
    const unsubscribe = firebase.firestore().collection('proposals').onSnapshot(snapshot => {
      let _proposals = [botProposal];
      snapshot.forEach(doc => {
        // Check whether proposal was accepted.
        if (!doc.data().open && doc.data().id === proposalId) {
          window.location = '/play/' + doc.data().gameid;
        }
        // Gather open proposals.
        if (doc.data().open) {
          _proposals.push({
            id: doc.data().id,
            proposerid: doc.data().proposerid,
            proposerDisplayName: doc.data().proposerDisplayName,
          });
        }
      });
      setProposals(_proposals);
    });
    return () => unsubscribe();
  }

  // Todo: Reap abandoned game proposals.
  function newGame(e) {
    if (!user) { return; }
    e.target.disabled = true;
    const proposal = firebase.firestore().collection('proposals').doc();
    proposal.set({
      id: proposal.id,
      open: true,
      proposerid: user.id,
      proposerDisplayName: user.displayName,
    });
    setProposalId(proposal.id);
  }

  // Todo: Make this a transaction since it requires atomicity.
  async function joinGame(e) {
    if (!user) { return; }
    // With the material buttons, onClick may be called on button or a child within button.
    const proposalid = e.target.dataset.proposalid || e.target.parentNode.dataset.proposalid;
    const proposerid = e.target.dataset.proposerid || e.target.parentNode.dataset.proposerid;
    const userid = user.id;
    const players = [userid, proposerid];
    const [player1id, player2id] = Math.random() > 0.5 ? players : players.reverse();

    const game = firebase.firestore().collection('games').doc();
    if (proposalid !== 'botproposal') {
      await firebase.firestore().collection('proposals').doc(proposalid)
        .update({open:false, gameid:game.id});
    }
    await game.set({
      proposalid:proposalid,
      player1id:player1id,
      player2id:player2id,
      playerToMove:Pieces.player1,
      moves:JSON.stringify([]),
    });
    window.location = '/play/' + game.id;
  }

  return (<div>
    <div className={classes.leftCol}>
      <div className={classes.featured}>
        <img src={amazonIcon} alt="featured player icon" className={classes.amazonIcon} />
        Featured Player: SkittleBot
      </div>
    </div>
    <div className={classes.centerCol}>
      <Button variant="contained" color="primary" className={classes.newGameButton} onClick={newGame}>New Game</Button>
    </div>
    <div className={classes.rightCol}>
      <div className={classes.challenges}>
      Open Challenges
      {
        proposals && proposals.length
        ? proposals.map((p, i) =>
            <Button variant="contained" className={classes.joinGameButton}
              data-proposalid={p.id}
              data-proposerid={p.proposerid}
              onClick={joinGame}>{p.proposerDisplayName}</Button>)
        : ""
      }
      </div>
    </div>
  </div>);
}

export default Home;
