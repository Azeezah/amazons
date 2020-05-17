import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import fs from 'fs';
import * as firebaseTesting from '@firebase/testing';
import firebaseApp from './firebase.js';  // For initializeApp
import Database, { setDB } from './Database';
import Home from './Home';

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

  test('creates game and closes proposal', async () => {
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
    act(() => {
      fireEvent.click(getByText('displayname'));
    });
    await act(async () => {
      await db.collection('games').where('proposalid', '==', 'proposalid').get()
        .then(games => expect(games.docs.length).toBe(1));
      await db.collection('proposals').doc('proposalid').get()
        .then(doc => expect(doc.data().open).toBe(false));
    });
  });
});
