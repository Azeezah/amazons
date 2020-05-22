import React, {useState, useEffect} from 'react';
import Authentication from './Authentication.js';
import Nav from './Nav';
import Home from './Home';
import Play from './Play';
import Replay from './Replay';
import Profile from './Profile';
import Games from './Games';
import People from './People';
import Learn from './Learn';
import Proposal from './Proposal';
import {
    BrowserRouter as Router,
    Switch,
    Route,
  } from "react-router-dom";

function Routing() {
  const [user, setUser] = useState(null);
  useEffect(()=>{
    setTimeout(()=>{Authentication.getUser().then(user=>setUser(user))}, 1000);
  }, []);

  function PlayById(props) {
    const { gameid } = props.match.params;
    return <Play gameid={gameid} user={user} />
  }

  function ReplayById(props) {
    const { gameid } = props.match.params;
    return <Replay gameid={gameid} user={user} />
  }

  function ProfileById(props) {
    const { profileid } = props.match.params;
    return <Profile profileid={profileid} user={user} />
  }

  function ProposalById(props) {
    const { proposalid } = props.match.params;
    return <Proposal proposalid={proposalid} user={user} />
  }

  return (<>
    <Nav user={user} setUser={setUser} />
    <Router>
      <Switch>
        <Route path="/play/:gameid" render={PlayById} />
        <Route path="/play">
          <Play user={user} />
        </Route>
        <Route path="/replay/:gameid" render={ReplayById} />
        <Route path="/profile/:profileid" render={ProfileById} />
        <Route path="/profile">
          <Profile user={user} />
        </Route>
        <Route path="/games">
          <Games user={user} />
        </Route>
        <Route path="/people">
          <People user={user} />
        </Route>
        <Route path="/learn">
          <Learn user={user} />
        </Route>
        <Route path="/proposal/:proposalid" render={ProposalById} />
        <Route path="/">
          <Home user={user} />
        </Route>
      </Switch>
    </Router>
  </>);
}

export default Routing;
