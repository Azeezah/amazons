import React from 'react';
import { makeStyles } from "@material-ui/core/styles";
import logo from './bowandarrow.jpg';

const useStyles = makeStyles({
  nav: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
  },
  logo: {
    filter: 'hue-rotate(193deg) contrast(1)',
    transform: 'rotateZ(-35deg)',
    width: '70px',
    margin: 'auto',
  },
});

function Nav() {
  const classes = useStyles();

  return (<div className={classes.nav}>
    <a href="/"><img className={classes.logo} src={logo} alt="logo" /></a>
  </div>);
}

export default Nav;
