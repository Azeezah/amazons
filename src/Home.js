import React, {useEffect, useState} from 'react';
import firebase from 'firebase';
import {Pieces} from './BoardUtils';
import Authentication from './Authentication';

function Home() {
  const [proposalId, setProposalId] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    Authentication.getUser().then(user=>setUser(user));
  }, []);

  useEffect(listenForProposals, [proposalId]);

  function listenForProposals() {
    const unsubscribe = firebase.firestore().collection('proposals').onSnapshot(snapshot => {
      let _proposals = []
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
    const proposalid = e.target.dataset.proposalid;
    const proposerid = e.target.dataset.proposerid;
    const userid = user.id;
    const players = [userid, proposerid];
    const [player1id, player2id] = Math.random() > 0.5 ? players : players.reverse();

    const game = firebase.firestore().collection('games').doc();
    await firebase.firestore().collection('proposals').doc(proposalid)
      .update({open:false, gameid:game.id});
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
    Welcome {user ? user.displayName : ""}! <br />
    <button onClick={newGame}>New Game</button>
    <ul>
    {
      proposals && proposals.length
      ? proposals.map((p, i) =>
          <li key={i}><button
            data-proposalid={p.id}
            data-proposerid={p.proposerid}
            onClick={joinGame}>Join Game with {p.proposerDisplayName}</button></li>)
      : ""
    }
    </ul>
  </div>);
}

export default Home;
