import firebase from 'firebase';

let DB = firebase.firestore();

export function setDB(db) {
  DB = db;
}

const collections = {
  games: 'games',
  users: 'users',
  proposals: 'proposals',
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
    static async listen(){}
  }
}

export default Database;
