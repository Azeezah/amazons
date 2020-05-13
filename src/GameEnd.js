import React from 'react';
import { useState, useEffect } from 'react';
import { makeStyles } from "@material-ui/core/styles";
import { Dialog, DialogTitle, DialogActions, Button } from '@material-ui/core';

const useStyles = makeStyles({
  actions: {
    justifyContent: 'center',
  }
});

function GameEnd(props) {
  const classes = useStyles();
  const [open, setOpen] = useState(true);
  return (<>
     <Dialog
        open={open}
        onBackdropClick={()=>{setOpen(false)}}
        aria-labelledby="alert-dialog-title">

       <DialogTitle id="alert-dialog-title">
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
       </DialogActions>
     </Dialog>
     </>);
}

export default GameEnd;
