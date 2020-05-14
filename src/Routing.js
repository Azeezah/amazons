import React, {useState, useEffect} from 'react';
import Authentication from './Authentication.js';
import Nav from './Nav';
import Home from './Home';
import Play from './Play';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    useParams,
  } from "react-router-dom";

function Routing() {
  const [user, setUser] = useState(null);
  useEffect(()=>{
    setTimeout(()=>{Authentication.getUser().then(user=>setUser(user))}, 1000);
  }, []);

  function PlayById() {
    const { gameid } = useParams();
    return <Play gameid={gameid} user={user} />
  }

  return (<>
    <Nav user={user} setUser={setUser} />
    <Router>
      <Switch>
        <Route path="/play/:gameid">
          <PlayById />
        </Route>
        <Route path="/play">
          <Play user={user} />
        </Route>
        <Route path="/">
          <Home user={user} />
        </Route>
      </Switch>
    </Router>
  </>);
}

export default Routing;
