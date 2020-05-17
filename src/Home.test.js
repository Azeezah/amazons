import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import fs from 'fs';
import * as firebaseTesting from '@firebase/testing';
import firebaseApp from './firebase.js';  // For initializeApp
import Database, { setDB } from './Database';
import Home from './Home';
import Redirect from './Redirect';

const projectId = 'forest-games';
const rules = fs.readFileSync('./firestore.rules', 'utf8');

// Freeze time.
Date = class {
  getTime = () => 1
  static now = () => 1
}

function getDB(){
  const app = firebaseTesting.initializeTestApp({
    projectId: projectId,
    auth: {uid:"username", email:"username@app.app"},
  });
  const db = app.firestore();
  setDB(db);
  return db;
}

beforeEach(async ()=>{
  await firebaseTesting.clearFirestoreData({ projectId });
  await firebaseTesting.loadFirestoreRules({ projectId, rules });
});


describe('home page dashboard', () => {
  test('shows recent proposals', async () => {
    const db = getDB();
    const { findByText, queryByText } = render(<Home />);
    const proposal = db.collection('proposals').doc();
    await act(async ()=>{
      await proposal.set({
        id: 'proposalid',
        open: true,
        proposerid: 'proposerid',
        proposerDisplayName: 'displayname',
        creation: (new Date()).getTime(),
      });
    });
    await findByText('displayname');
  });

  test('excludes closed proposals', async () => {
    const db = getDB();
    const { queryByText } = render(<Home />);
    const proposal = db.collection('proposals').doc();
    await act(async ()=>{
      await proposal.set({
        id: 'proposalid',
        open: false,
        proposerid: 'proposerid',
        proposerDisplayName: 'displayname',
        creation: (new Date()).getTime(),
      });
    });
    expect(queryByText('displayname')).toBeNull();
  });

  test('excludes old proposals', async () => {
    const db = getDB();
    const { queryByText } = render(<Home />);
    const ten_minutes = 10 * 60 * 1000;
    const proposal = db.collection('proposals').doc();
    await act(async ()=>{
      await proposal.set({
        id: 'proposalid',
        open: true,
        proposerid: 'proposerid',
        proposerDisplayName: 'displayname',
        creation: (new Date()).getTime() - ten_minutes,
      });
    });
    expect(queryByText('displayname')).toBeNull();
  });

  test('creates new proposals', async () => {
    const db = getDB();
    const user = {id: 'userid', displayName: 'displayname'};
    const { getByText, findByText, queryByText } = render(<Home user={user} />);
    expect(queryByText('displayname')).toBeNull();
    act(() => {
      fireEvent.click(getByText('New Game'));
    });
    await findByText('displayname');
  });

  // From the proposal accepter's perspective.
  test('creates game and closes proposal', async () => {
    Redirect.play = jest.fn();
    const db = getDB();
    const user = {id: 'userid', displayName: 'displayname'};
    const { getByText, findByText, queryByText } = render(<Home user={user} />);
    const proposal = db.collection('proposals').doc('proposalid');
    await act(async () => {
      await proposal.set({
        id: 'proposalid',
        open: true,
        proposerid: 'proposerid',
        proposerDisplayName: 'displayname',
        creation: (new Date()).getTime(),
      });
    });
    // User accepts the existing proposal.
    act(() => {
      fireEvent.click(getByText('displayname'));
    });
    // Expect that the game is created, and the proposal is closed.
    await act(async () => {
      await db.collection('games').where('proposalid', '==', 'proposalid').get()
        .then(games => expect(games.docs.length).toBe(1));
      await db.collection('proposals').doc('proposalid').get()
        .then(doc => expect(doc.data().open).toBe(false));
    });
    // Expect that the page redirects to the new game.
    expect(Redirect.play).toBeCalled();
  });

  // From the proposer's perspective.
  test('redirects to new game once proposal is accepted', async () => {
    Redirect.play = jest.fn();
    const db = getDB();
    const user = {id: 'userid', displayName: 'displayname'};
    const { getByText, findByText, queryByText } = render(<Home user={user} />);
    // Propose a new game.
    fireEvent.click(getByText('New Game'));
    // Wait until the proposal is written to the database and picked up by the listener.
    await findByText('displayname');
    // Simulate an opponent match by closing the proposal.
    await act(async () => {
      const proposals = await db.collection('proposals').where('proposerid', '==', user.id).get();
      const proposalid = proposals.docs[0].data().id;
      await db.collection('proposals').doc(proposalid).update({open: false, gameid: 'gameid'});
    });
    // Expect that the page redirects to the new game.
    expect(Redirect.play).toBeCalledWith('gameid');
  });
});
