function click_sq(event) {
  let sq = game.sq_from_html(event.toElement); // Why not e.target?
  let start = null, finish=null;
  switch(game.phase) {
    case 0:  // select queen
      if (sq.has_piece('amazonian', game.player)) {
        sq.select();
        game.curr_amazon = sq;
        game.phase++;
      }
      break;

    case 1:  // select sq to mv queen
      
      // Optionally change selection first.
      if (sq.has_piece('amazonian', game.player)) {
        game.curr_amazon.deselect();
        sq.select();
        game.curr_amazon = sq;
      }
      let [start, finish] = [game.curr_amazon.index, sq.index];
      if (!sq.has_piece() && is_in_line_of_sight(start, finish)) {
        game.curr_amazon.remove_piece(game.player);
        sq.add_piece('amazonian', game.player);
        game.curr_amazon = sq;
        game.phase++;
      }
      break;

    case 2:  // select sq to place arrow
      let [start, finish] = [game.curr_amazon.index, sq.index];
      if (!sq.has_piece('amazonian', game.player) 
	  && is_in_line_of_sight(start, finish)) {
        sq.add_piece('arrow');
        game.phase = 0;
        game.player ^= 1;
      }
      break;

    default:
      console.log('Error: phase should be in range [0, 2].');
      break;
  }
}
$('td').click(click_sq);

function setup() {
  let player1_pos = [[2, 1], [6, 2], [5, 6], [1, 5]];
  let player2_pos = [[1, 2], [5, 1], [6, 5], [2, 6]];
  let game = init_game();
  for (let [i, j] of player1_pos) {
    game.sq_at(i, j).add_piece('amazonian', game.player);
  }
  for (let [i, j] of player2_pos) {
    game.sq_at(i, j).add_piece('amazonian', game.player^1);
  }
  return game;
}
let game = setup();

function is_in_line_of_sight(start, finish) {
  let [x0, y0] = start;
  let [x, y] = finish;
  let [dx, dy] = [x-x0, y-y0]'
  // Check whether start and finish are colinear.
  if (![dx+dy, dx-dy, dx, dy].includes(0)) {
    return false;
  }
  // Map (-inf, inf) onto {-1, 0, 1}.
  let [ux, uy] = [dx?dx/Math.abs(dx):0, dy?dy/Math.abs(dy):0];
  
  // Iterate over intervening squares and return false if any are not empty.
  for (let i=0, j=0; i!=dx || j!=dy; i+=ux, j+=uy) {
    if (game.sq_at(x0+i, y0+j).has_piece()) {
      if (i||j) { return false; }  // Exclude start square.
    }
  }
  return true;
}

function init_game() {
  return {
	  sq_at_index: function(x, y) {
      let rows = document.getElementById('game_table').children[0];
      return init_sq(x, y, rows.children[y].children[x]);
    },
    sq_from_html: function(html) {
      let rows = document.getElementById('game_table').children[0];
      for (let j=0; j < rows.children.length; j++) {
        for (let i=0; i < rows.children[j].children.length; i++) {
          if (html === rows.children[j].children[i]) {
            return init_sq(i, j, html);
	  }
        }
      }
    },
  };
}

function init_sq(x, y, html) {
  return {
    html: html,
    index: [x, y],
    select: function() {
      this.html.classList.add('selected');
    },
    deselect: function() {
      this.html.classList.remove('selected');
    },
    has_piece: function(piece, player) {
      let players = ['player1', 'player2'];
      return (piece && player)
        ? this.html.classList.contains(piece) 
          && this.html.classList.contains(players[player])
        : (piece) ? this.classList.contains(piece)
                  : this.html.classList.contains('amazonian')
		    || this.html.contains('arrow');
    },
    add_piece: function(piece, player) {
      let players = ['player1', 'player2'];
      this.html.classList.add(piece);
      if (player) { this.html.classList.add(players[player]); }
    },
    remove_piece: function(player) {
      let players = ['player1', 'player2'];
      this.html.classList.remove('amazonian');
      this.html.classList.remove('arrow');
      this.html.classList.remove('selected');
      this.html.classList.remove(players[player]);
    },
  };
}
