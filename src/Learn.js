import React, { useState, useEffect } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  instructionText: {
    fontSize: 'xxx-large',
    fontFamily: 'monospace',
    textAlign: 'center',
    width: '100%',
    marginTop: '5%',
  },
}));

function TabPanel(props) {
  return (<div hidden={props.value !== props.index}>{props.children}</div>)
}

function Learn(props) {
  const classes = useStyles();
  const [tabindex, setTabIndex] = React.useState(0);
  const changeTab = (event, index) => {
    setTabIndex(index);
  };

  const [user, setUser] = useState(props.user);
  useEffect(()=>{setUser(props.user)}, props.user);

  return (<>
  <AppBar position="static" className={classes.filterBar}>
    <Tabs
        value={tabindex}
        onChange={changeTab}
        indicatorColor="primary"
        centered
      >
        <Tab label="Do" />
        <Tab label="Don't" />
        <Tab label="Win" />
      </Tabs>
    </AppBar>
    <TabPanel value={tabindex} index={0}>
    <div className={classes.instructionText}>Move in straight lines.</div>
    <div className={classes.instructionText}>Shoot arrows in straight lines.</div>
    </TabPanel>
    <TabPanel value={tabindex} index={1}>
    <div className={classes.instructionText}>Don't cross blocked squares.</div>
    <div className={classes.instructionText}>Don't shoot over blocked squares.</div>
    </TabPanel>
    <TabPanel value={tabindex} index={2}>
    <div className={classes.instructionText}>Trap your opponent to win!</div>
    </TabPanel>
  </>);
}

export default Learn;
