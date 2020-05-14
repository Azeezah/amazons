import React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@material-ui/core';
import { makeStyles } from "@material-ui/core/styles";
import logo from './bowandarrow.jpg';
import Authentication from './Authentication.js';

const useStyles = makeStyles({
  nav: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    overflow: 'hidden',
    paddingTop: '30px',
  },
  logo: {
    position: 'relative', // Otherwise overflow hidden won't work.
    left: 'calc(100vw / 2 - 50px)',
    filter: 'hue-rotate(193deg) contrast(1)',
    transform: 'rotateZ(-35deg)',
    width: '70px',
  },
  authButton: {
    marginRight: 'calc(100vw / 14)',
  },
});

function Nav(props) {
  const classes = useStyles();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(()=>{setLoggedIn(props.user && !props.user.isAnonymous ? true : false)}, [props.user]);

  async function login() {
    const user = await Authentication.login();
    setLoggedIn(user ? true : false);
    if (props.setUser) {
      props.setUser(user);
    }
  }

  async function logout() {
    await Authentication.logout();
    setLoggedIn(false);
    if (props.setUser) {
      props.setUser(null);
    }
  }

  return (<div className={classes.nav}>
    <a href="/"><img className={classes.logo} src={logo} alt="logo" /></a>
    {
      loggedIn
      ? <Button onClick={logout} className={classes.authButton}>Logout</Button>
      : <Button onClick={login} className={classes.authButton}>Login</Button>
    }
  </div>);
}

export default Nav;
