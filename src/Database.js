import firebase from 'firebase';
import firebaseApp from './firebase.js';  // For initializeApp
import { Pieces } from './BoardUtils';

let DB = firebase.firestore();
let REF = {
  USERS: DB.collection('users'),
  PROPOSALS: DB.collection('proposals'),
  GAMES: DB.collection('games'),
}

export function setDB(db) {
  DB = db;
  REF.USERS = DB.collection('users');
  REF.PROPOSALS = DB.collection('proposals');
  REF.GAMES = DB.collection('games');
}

class Database {
  static Users = class {
    static async getById(){}
    static async getByIds(){}
    static async create(){}
  }

  static Games = class {
    static async getById(id) {
      return REF.GAMES.doc(id).get()
      .then(async doc => {
        if (!doc.exists) {
          throw Error("Game does not exist: " + id);
        }
        return doc.data() || {player1id : 'joker'};
      });
    }

    static async getByUserId(){}
    static async getRecent(){}

    static create(proposalid, player1id, player2id) {
      const game = REF.GAMES.doc();
      if (proposalid !== 'botproposal') {
        REF.PROPOSALS.doc(proposalid).update({open:false, gameid:game.id});
      }
      game.set({
        id: game.id,
        creation: (new Date()).getTime(),
        proposalid: proposalid,
        player1id: player1id,
        player2id: player2id,
        players: [player1id, player2id],
        playerToMove:Pieces.player1,
        moves:JSON.stringify([]),
      });
      return game;
    }

    static async saveMoves(){}

    static listenForMoves(gameid, callback){
      const unsubscribe = REF.GAMES.doc(gameid).onSnapshot(doc => {
        if (!doc.exists) {
          console.log("Cannot listen for moves from game:", gameid);
          return;
        }
        console.log('Player to move:', doc.data().playerToMove);
        let moves = JSON.parse(doc.data().moves);
        callback(moves);
      });
      return () => unsubscribe();
    }
  }

  static Proposals = class {
    static create(userid, displayName) {
      const proposal = REF.PROPOSALS.doc();
      proposal.set({
        id: proposal.id,
        proposerid: userid,
        proposerDisplayName: displayName,
        creation: (new Date()).getTime(),
        open: true,
      });
      return proposal;
    }

    static listen(callback) {
      const unsubscribe = REF.PROPOSALS.onSnapshot(snapshot => {
        const proposals = snapshot.docs.map(doc=>({
          id: doc.data().id,
          proposerid: doc.data().proposerid,
          proposerDisplayName: doc.data().proposerDisplayName,
          creation: doc.data().creation,
          open: doc.data().open,
          gameid: doc.data().gameid,
        }));
        callback(proposals);
      });
      return () => unsubscribe();
    }
  }
}

export default Database;
