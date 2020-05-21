class Redirect {
  static play(gameid='') {
    window.location.href = '/play/' + gameid;
  }
}

export default Redirect;
