import firebase from 'firebase';

function getPseudonym(uid) {
  const animals = ['Panda', 'Giraffe', 'Lion', 'Porcupine', 'Pikachu', 'Reindeer', 'Koala'];
  const i = uid.charCodeAt(0) % animals.length;
  return "Anonymous " + animals[i];
}

class Authentication {
  static async login() {
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      const _user = (await firebase.auth().signInWithPopup(provider)).user;
      const user = {
        id: _user.uid,
        displayName: _user.displayName,
        email: _user.email,
        photoURL: _user.photoURL,
        isAnonymous: false,
      }
      await firebase.firestore().collection('users').doc(user.id).set(user);
      return user;
    }
    catch(error) {
      console.log('Couldn\'t login:', error);
      return null;
    }
  }

  static async logout() {
      try { await firebase.auth().signOut(); }
      catch { return false; }
      return true;
  }


  static async getUser() {
    if (firebase.auth().currentUser === null) {
      const _user = await firebase.auth().signInAnonymously();
      if (_user) {
        const user = {
          id: _user.user.uid,
          displayName: getPseudonym(_user.user.uid),
          isAnonymous: true,
        }
        return user;
      }
    } else {
      const _user = firebase.auth().currentUser;
      const user = {
        id: _user.uid,
        displayName: _user.displayName || getPseudonym(_user.uid),
        email: _user.email,
        photoURL: _user.photoURL,
        isAnonymous: _user.isAnonymous,
      }
      return user;
    }
    return null;
  }

  static async getUserById(id) {
    try {
      const doc = await firebase.firestore().collection('users').doc(id).get();
      if (doc.exists) {
        return doc.data();
      }
    } catch(err) {
      console.log('Couldn\'t get user by id:', id, err);
    }
    const names = {
      'skittlebotid' : 'SkittleBot',
    }
    const user = {
      id: id,
      displayName: names[id] || getPseudonym(id),
    };
    return user;
  }
}

export default Authentication;
