import React from 'react';
import { useState, useEffect } from 'react';
import { makeStyles } from "@material-ui/core/styles";
import { Dialog, DialogTitle, DialogActions, Button } from '@material-ui/core';

const useStyles = makeStyles({
  actions: {
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
  },
});

function GameEnd(props) {
  const classes = useStyles();
  return (<>
     <Dialog
        open={true}
        aria-labelledby="alert-dialog-title">

       <DialogTitle id="alert-dialog-title"
          className={classes.title}>
       {
         props.won ? "You won!"
         : props.lost ? "You lost."
         : "Game Over!"
       }
       </DialogTitle>
       <DialogActions className={classes.actions}>
         <Button href="/" color="primary" autoFocus>
           New Game
         </Button>
        { props.gameid ?
         <Button href={"/replay/"+props.gameid} color="primary">
           Analyze
         </Button>
          : ""
        }
       </DialogActions>
     </Dialog>
     </>);
}

export default GameEnd;
