import firebase from 'firebase';

function getPseudonym(uid) {
  const animals = ['Panda', 'Giraffe', 'Lion', 'Porcupine', 'Pikachu', 'Reindeer', 'Koala'];
  const i = uid.charCodeAt(0) % animals.length;
  return "Anonymous " + animals[i];
}

class Authentication {
  static async getUser() {
    const response = await firebase.auth().signInAnonymously();
    if (response) {
      const user = {};
      user.id = response.user.uid;
      user.displayName = getPseudonym(response.user.uid);
      return user;
    }
    return null;
  }

  static async getUserById(id) {
    const names = {
      'skittlebotid' : 'SkittleBot',
    }
    const user = {};
    user.id = id;
    user.displayName = names[id] || getPseudonym(id);
    return user;
  }
}

export default Authentication;
