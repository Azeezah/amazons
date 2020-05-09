import React from 'react';
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles({
  nav: {
    width: '100%',
  },
});

function Nav() {
  const classes = useStyles();

  return (<div className={classes.nav}>
    <a href="/"><button>Home</button></a>
    <a href="/play"><button>Play</button></a>
  </div>);
}

export default Nav;
