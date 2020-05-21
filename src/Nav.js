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
    paddingTop: '30px',
    paddingBottom: '30px',
    '& div': {
      float: 'left',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    }
  },
  logo: {
    filter: 'hue-rotate(193deg) contrast(1)',
    transform: 'rotateZ(-35deg)',
    width: '70px',
  },
  left: {
    width: '40%',
  },
  right: {
    width: '40%',
  },
  middle: {
    width: '20%',
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
    <div className={classes.left}>
      <Button href='/'>Play</Button>
      <Button href='/games'>Watch</Button>
      <Button href='/people'>People</Button>
    {/*
      <Button>Learn</Button>
    */}
    </div>
    <div className={classes.middle}>
      <a href="/"><img className={classes.logo} src={logo} alt="logo" /></a>
    </div>
    <div className={classes.right}>
    {
      loggedIn
      ? <Button onClick={logout}>Logout</Button>
      : <Button onClick={login}>Login</Button>
    }
    </div>
  </div>);
}

export default Nav;
