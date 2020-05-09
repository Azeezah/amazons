import React from 'react';
import Nav from './Nav';
import Home from './Home';
import Play from './Play';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    useParams,
  } from "react-router-dom";

function PlayById() {
  const { gameid } = useParams();
  return <Play gameid={gameid} />
}


function Routing() {
  return (<>
    <Nav />
    <Router>
      <Switch>
        <Route path="/play/:gameid">
          <PlayById />
        </Route>
        <Route path="/play">
          <Play />
        </Route>
        <Route path="/">
          <Home />
        </Route>
      </Switch>
    </Router>
  </>);
}

export default Routing;
