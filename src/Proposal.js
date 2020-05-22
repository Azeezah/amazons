import React, {useEffect, useState} from 'react';
import Redirect from './Redirect';
import Database from './Database';
import firebase from 'firebase';

function Proposal(props) {
  const [proposal, setProposal] = useState(null);
  useEffect(acceptProposal, [props.user, proposal]);
  useEffect(loadProposal, [props.proposalid]);

  function loadProposal() {
    if (!props.proposalid) { return; }
    firebase.firestore().collection('proposals').doc(props.proposalid).get()
      .then(doc=>{
        if (!doc.exists) {
          console.log('Proposal not found!');
          return;
        }
        setProposal(doc.data())
      });
  }

  function acceptProposal() {
    if (!props.user || !proposal) { return; }
    const players = [props.user.id, proposal.proposerid];
    const [player1id, player2id] = Math.random() > 0.5 ? players : players.reverse();
    Database.Games.create(proposal.id, player1id, player2id)
      .then(game => Redirect.play(game.id));
  }
  return (<></>);
}

export default Proposal;
