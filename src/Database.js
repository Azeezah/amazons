import firebase from 'firebase';
import firebaseApp from './firebase.js';  // For initializeApp

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
    static async getById(){}
    static async getByUserId(){}
    static async getRecent(){}
    static async create(){}
    static async saveMoves(){}
    static async listenForMoves(){}
  }

  static Proposals = class {
    static async create(){}
    static listen(callback){
      const unsubscribe = REF.PROPOSALS.onSnapshot(snapshot => {
        const proposals = snapshot.docs.map(doc=>({
          id: doc.data().id,
          proposerid: doc.data().proposerid,
          proposerDisplayName: doc.data().proposerDisplayName,
          creation: doc.data().creation,
          open: doc.data().open,
        }));
        callback(proposals);
      });
      return () => unsubscribe();
    }
  }
}

export default Database;
