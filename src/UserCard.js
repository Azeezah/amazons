import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from "@material-ui/core/Paper";
import defaultProfileImage from './defaultProfileImage.svg';

const useStyles = makeStyles({
  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  text: {
    width: 'calc(50vw)',
    fontFamily: 'sans-serif',
    lineHeight: '50px',
    margin: 'auto',
    marginBottom: '10px',
    paddingTop: '15px',
    textAlign: 'center',
  },
  photo: {
    width: '100px',
    height: '100px',
    zIndex: '1',
    marginBottom: '-15px',
    borderRadius: '50%',
    boxShadow: '0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)',
  },
  link: {
    color: 'inherit',
    textDecoration: 'inherit',
  },
});

function UserCard(props) {
  const classes = useStyles();
  return (
    <a href={"/profile/"+props.profileUser.id} className={classes.link}>
    <div className={classes.card}>
      <img className={classes.photo} src={ props.profileUser.photoURL || defaultProfileImage } alt="user photo" />
      <Paper className={classes.text}>{props.profileUser.displayName}</Paper>
    </div>
    </a>
  );
}

export default UserCard;
