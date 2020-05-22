import React, {useEffect, useState} from 'react';
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Database from './Database';
import amazonIcon from './first.svg';
import Redirect from './Redirect';
import Tooltip from '@material-ui/core/Tooltip';
import Snackbar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';

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
    filter: 'invert(.75) hue-rotate(180deg)',
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

function Home(props) {
  const classes = useStyles();
  const [proposalId, setProposalId] = useState(null);
  const [user, setUser] = useState(null);
  const botProposal = {
    id: 'botproposal',
    proposerid: 'skittlebotid',
    proposerDisplayName: 'SkittleBot',
  }
  const [proposals, setProposals] = useState([botProposal]);
  const [showCopiedAlert, setShowCopiedAlert] = useState(false);
  const [showCopyTooltip, setShowCopyTooltip] = useState(false);

  useEffect(()=>{setUser(props.user)}, [props.user])
  useEffect(listenForProposals, [proposalId]);


  function copyProposalLink() {
    navigator.clipboard.writeText(window.location.href+'proposal/'+proposalId);
    setShowCopiedAlert(true);
  }

  function closeCopiedAlert() {
    setShowCopiedAlert(false);
  }

  function openCopyTooltip() {
    setShowCopyTooltip(true);
    setTimeout(()=>setShowCopyTooltip(false), 6000);
  }

  function listenForProposals() {
    const five_minutes_ago = (new Date()).getTime() - (5 * 60 * 1000);
    const unsubscribe = Database.Proposals.listen((proposals)=>{
      const newProposal = proposals.find(p=>p.id === proposalId);
      if (newProposal && !newProposal.open) {
        Redirect.play(newProposal.gameid);
      }
      setProposals([botProposal, ...proposals.filter(
        p=>p.open && p.creation > five_minutes_ago)]);
    });
    return () => unsubscribe();
  }

  // Todo: Reap abandoned game proposals.
  function newGame(e) {
    if (!user) { return; }
    e.target.disabled = true;
    const proposal = Database.Proposals.create(user.id, user.displayName);
    setProposalId(proposal.id);
    openCopyTooltip();
  }

  // Todo: Make this a transaction since it requires atomicity.
  function joinGame(e) {
    if (!user) { return; }
    // With the material buttons, onClick may be called on button or a child within button.
    const proposalid = e.target.dataset.proposalid || e.target.parentNode.dataset.proposalid;
    const proposerid = e.target.dataset.proposerid || e.target.parentNode.dataset.proposerid;
    const userid = user.id;
    const players = [userid, proposerid];
    const [player1id, player2id] = Math.random() > 0.5 ? players : players.reverse();
    Database.Games.create(proposalid, player1id, player2id)
      .then(game => Redirect.play(game.id));
    // If the game cannot be created after however many asynchronous retries in
    // 1500ms, redirect to a default game.
    setTimeout(Redirect.play, 1500);
  }

  return (<div>
    <div className={classes.leftCol}>
      <div className={classes.featured}>
        <img src={amazonIcon} alt="featured player icon" className={classes.amazonIcon} />
        Featured Player:
        <Button href="/profile/skittlebotid">SkittleBot</Button>
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
          (p.id === proposalId
            ?
            <Tooltip open={showCopyTooltip} title="Click to copy challenge link!" placement="left" arrow>
            <Button variant="contained" key={i} className={classes.joinGameButton}
              data-proposalid={p.id}
              data-proposerid={p.proposerid}
              onClick={copyProposalLink}>{p.proposerDisplayName}</Button>
            </Tooltip>
            :
            <Button variant="contained" key={i} className={classes.joinGameButton}
              data-proposalid={p.id}
              data-proposerid={p.proposerid}
              onClick={joinGame}>{p.proposerDisplayName}</Button>
          ))
        : ""
      }
      </div>
    </div>
    <Snackbar open={showCopiedAlert} onClose={closeCopiedAlert} autoHideDuration={6000}>
      <Alert elevation={6} variant="filled" severity="success">Copied challenge URL!</Alert>
    </Snackbar>
  </div>);
}

export default Home;
