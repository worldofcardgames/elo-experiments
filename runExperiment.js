"use strict";
/**
 * all code copyright Marya @ worldofcardgames.com
 * Contact the developer if you are interested in using it.
 * Note this started out as node.js, but I decided it was more useful when
 * visualized, so I reworked it into an html+javascript page.
 */
//var Player = require("./Player").Player;
//var Game = require("./Game").Game;
var nGames = 1000;
/**
 * Defines a player in a game.
 * @param {Number} playerNumber uniquely identifies the player at the table;
 * a number between 0 and nPlayers-1
 * @param {Number} winRatio is a number between 0 and 1 inclusive [0,1] which
 * represents the probability that this player wins a game.
 * @param {Number} the player's Elo rating, defaults to 1500
 */
var Player = function(playerNumber, winRatio, eloRating) {
	this.playerNumber = playerNumber;
	this.winRatio = winRatio;
	this.eloRating = eloRating;
};

/**
 * The Game has players, and methods for deciding the winner etc.
 */
var Game = function() {
	this.players = [];
	this.totRatio = 0;
	this.creditWinnerOnly = false;
	this.team = false;
	/**
	 * Shuffling players only matters for team games.
	 */
	this.shufflePlayers = false;

	Game.prototype.shuffle = function(array) {
		// see https://bost.ocks.org/mike/shuffle/compare.html
		var m = array.length, t, i;
		while (m) {
			i = Math.floor(Math.random() * m--);
			t = array[m];
			array[m] = array[i];
			array[i] = t;
		}
	};

	/**
	 * If b is true, only one winner allowed in a game, which means that
	 * players coming in second are not counted as "winning" over a player
	 * who comes in 3rd or 4th. Rather, they are "tied" against the 3rd and
	 * 4th place players.
	 */
	Game.prototype.setCreditWinnerOnly = function(b) {
		this.creditWinnerOnly = b; // true of false.
	};

	/**
	 * If b is true, this is a team game. In team games, the Elo rating of
	 * each team member is computed as if each one was in a match against each
	 * member of the opposing team.
	 */
	Game.prototype.setTeamGame = function(b) {
		this.team = b; // true of false.
	};

	/**
	 * If b is true, players will be reassigned to teams randomly.
	 * This only affects the end result in team games.
	 */
	Game.prototype.setShufflePlayers = function(b) {
		this.shufflePlayers = b; // true of false.
	};

	/**
	 * Add a player to this Game.
	 * @param {Object} a Player object
	 */
	Game.prototype.addPlayer = function(player) {
		this.totRatio += player.winRatio;
		this.players.push(player); // push before test to compute error string
		var str = this.players.join();
		if (this.totRatio > 1) {
			throw new Error("Total of all winRatios > 1 " + this.players.join());
		} else if (this.totRatio < 0) {
			throw new Error("Total of all winRatios < 0 " + this.players.join());
		}
	};

	/**
	 * Input players with a certain probability of winning. Roll the dice and
	 * see who wins.
	 * @param {Array} of Player objects
	 * @return {Number} index of the player who won
	 */
	Game.prototype.getWinner = function(players) {
		var r = Math.random(); // r is in [0, 1)
		var current = 0;
		var playerIndex = -1;
		// brute force normalization
		var c = 0;
		var winRatios = players.map(function(el) { c += el.winRatio; return el.winRatio; });
		if (c !== 1) {
			winRatios.forEach(function(el, i) {
				winRatios[i] = el/c;
			});
		}
		// At this point, the sum of winRatios should be 1; 100% probability
		players.some(function(el, i) {
			current += winRatios[i]; // e.g. 0.25
			if (r < current) {
				playerIndex = i;
				return true;
			}
			return false;
		});
		if (playerIndex === -1) playerIndex = Math.round(Math.random() * (players.length - 1));
		return playerIndex;
	};

	/**
	 * Returns an array of indexes into this.players array.
	 * For example, if [1,0,2,3] is returned, then the 1st place is taken by
	 * player with number 1, 2nd place is taken by player with number 0, etc.
	 * @return {Array} of integers giving the "place" of each player in this
	 * game
	 */
	Game.prototype.getPlacings = function() {
		var p;
		var placings = [];
		var winner;
		if (this.team &&
			this.players.some(function(el, i) {
				if (el.winRatio < 0.000001) {
					// assume only 1 player has 0 probability of winning
					p = i;
					return true;
				}
				return false;
			})) {
			// If this is a team game, and one team member has 0 chance of
			// winning the other team wins by fiat.
			winner = this.getOpponentPlayerNumber(p);
			var winner2 = this.getTeammatePlayerNumber(winner);
			placings = [winner, winner2, p, this.getTeammatePlayerNumber(p)];
			return placings;
		}
		var nPlayers = this.players.length;
		var arr = this.players.slice();
		for (var i = 0; i < nPlayers; i++) {
			winner = this.getWinner(arr);
			placings.push(arr[winner].playerNumber);
			// remove the winner from the array and recompute
			arr.splice(winner, 1);
		}
		// e.g. placings = [1, 2, 0, 3] means player number 1 took 1st place
		// (index 0), player number 2 took 2nd place, player 0 took 3rd..
		return placings;
	};

	/**
	 * Computes the Elo expectation, see
	 * https://en.wikipedia.org/wiki/Elo_rating_system#Mathematical_details
	 *
	 * @param {Number} oldRank the player's old Elo rating
	 * @param {Number} opponent's Elo rating
	 * @return {Number} the Elo expectation
	 */
	Game.prototype.computeEloExpectation = function(oldRank, oppRank) {
		var exponent = ((+oppRank) - (+oldRank))/400;
		var wE = 1.0/(1.0 + Math.pow(10, exponent));
		return wE;
	};

	/**
	 * Computes the Elo rating, see
	 * https://en.wikipedia.org/wiki/Elo_rating_system#Mathematical_details
	 *
	 * @param {Number} oldRating the player's old Elo rating
	 * @param {Number} the player's actual expectation value
	 * @param {Number} the player's expected number of wins
	 * @param {Number} Elo K number (30)
	 * @return {Number} player's new Elo rating
	 */
	Game.prototype.computeNewEloRating = function(oldRating, actual, expected, K) {
		var newRank = oldRating + K*(actual - expected);
		return Math.round(newRank);
	};

	/**
	 * Returns the player number of the input player's teammate.
	 * Assumes a team game, and 4 total players.
	 * @param {Integer} playerNumber, 0..3
	 * @return {Integer} teammate's player number, e.g. 0 if input was 2
	 */
	Game.prototype.getTeammatePlayerNumber = function(playerNumber) {
		if (playerNumber > 3 || playerNumber < 0) throw new Error("Player out of bounds " + playerNumber);
		if (playerNumber < 2) {
			return playerNumber + 2;
		} else {
			return playerNumber - 2;
		}
	};

	/**
	 * Returns the player number of the opponent player's teammate.
	 * Assumes a team game, and 4 total players.
	 * @param {Integer} playerNumber, 0..3
	 * @return {Integer} teammate's player number, e.g. 0 if input was 2
	 */
	Game.prototype.getOpponentPlayerNumber = function(playerNumber, nPlayers) {
		if (playerNumber > 3 || playerNumber < 0) throw new Error("Player out of bounds " + playerNumber);
		if (playerNumber < 2) {
			return playerNumber + 1;
		} else {
			return playerNumber - 1;
		}
	};
	/**
	 * Returns the Elo rating for a single player against other players given
	 * the input placings array, which determines who came in 1st, 2nd, etc
	 * @param {Object} the Player whose Elo rating is being computed
	 * @param {Array} Players against whom the input player competed
	 * @param {Array} placings see getPlacings
	 * @return {Number} new Elo rating for the player
	 */
	Game.prototype.computeElo = function(player, players, placings) {
		//console.log(myplace + " " + myEloRating + " " + JSON.stringify(theirEloRatings) + " " + JSON.stringify(placings));
		var game = this;
		var EloK = 30;
		var myActualScore = 0;
		var myExpectedScore = 0;
		var myEloRating = player.eloRating;
		var myPlayerNumber = player.playerNumber;
		var teammatePlayerNumber = game.getTeammatePlayerNumber(player.playerNumber);
		// For example if myPlayerNumber is 3, and I came in 1st, myplace is 0
		var myplace = placings.indexOf(myPlayerNumber);
		if (game.team) {
			players.forEach(function(p, i) {
				var theirPlayerNumber = p.playerNumber;
				if (myPlayerNumber !== theirPlayerNumber &&
					teammatePlayerNumber !== theirPlayerNumber) {
					// Player is not me, not teammate. Assume a 4-player game.
					var theirEloRating = p.eloRating;
					var theirPlace = placings.indexOf(p.playerNumber);
					myExpectedScore += game.computeEloExpectation(myEloRating, theirEloRating);
					myActualScore += game.getActualScoreCreditWinnerOnly(myplace, theirPlace);
				}
			});
		} else {
		players.forEach(function(p, i) {
			var theirPlayerNumber = p.playerNumber;
			if (myPlayerNumber !== theirPlayerNumber) {
				var theirEloRating = p.eloRating;
				var theirPlace = placings.indexOf(p.playerNumber);
				myExpectedScore += game.computeEloExpectation(myEloRating, theirEloRating);
				if (game.creditWinnerOnly) {
					myActualScore += game.getActualScoreCreditWinnerOnly(myplace, theirPlace);
				} else {
					myActualScore += game.getActualScoreCreditSecondThirdPlace(myplace, theirPlace);
				}
			}
		});

		}
		var myNewElo = game.computeNewEloRating(myEloRating, myActualScore, myExpectedScore, 30);
		return myNewElo;
	};

	/**
	 * In this algorithm, I am given credit for winning a game if I came in
	 * first. If I came in 2nd place, and I am matched against the first-place
	 * player, I get no credit. If I came in 2nd, 3rd, or 4th, and I am matched
	 * against a 2nd, 3rd, or 4th place player, it counts as a tie (i.e., we
	 * have all tied for last place).
	 */
	Game.prototype.getActualScoreCreditWinnerOnly = function(myplace, theirPlace) {
		var score = 0;
		if (this.team) {
			// Note: if myplace is 0 or 1, then I've won.
			if (myplace === 0 || myplace === 1) {
				score = 1;
			} else if (theirPlace > 1) {
				// I did not win. My team lost.
				score = 0;
			}
			return score;
		}
		// Note: if myplace is 0, then I've won.
		if (myplace === 0) {
			score = 1;
		} else if (theirPlace > 0) {
			// I did not win. If the other player came in 2nd, 3rd, or
			// 4th, then we have tied for last place. In those cases,
			// it counts as a tie. Add 0.5.
			score = 0.5;
		}
		// If myplace is not 0 (I am not first) AND
		// their place is 0, I lost to them. This counts for 0,
		// so add nothing.
		return score;
	};

	/**
	 * In this algorithm, I am given credit for winning a game if I came in
	 * ahead of another player. For example, if I came in 2nd place, and I am
	 * matched against the first-place player, I get no credit. But if I came
	 * in 2nd place and I am matched against the 3rd or 4th place player, then
	 * it counts as a "win" for me.
	 */
	Game.prototype.getActualScoreCreditSecondThirdPlace = function(myplace, theirPlace) {
		var score = 0;
		// Note: if myplace is 0, then I've won.
		// So if placings[i] > myplace, I've won
		if (myplace < theirPlace) {
			score = 1;
		} else if (theirPlace === myplace) {
			score = 0.5;
		}
		return score;
	};

};

/**
 * Returns various options for running a simulation. Number of players can be
 * 2 or 4.
 * @return {Array} of Objects containing player names, winRatios, and nPlayers
 */
var getOptions = function() {
	var options = [];
	var nPlayers = 4;
	var winRatios = [0, 0, 0, 1];
	var names = ["Frank", "Mary", "Jim", "Susan"];
	// In this example, player 0 starts at 1600 Elo, while the rest start at 1400.
	// However, Frank never wins, and only Susan does.
	var eloInitial = [1600, 1400, 1400, 1400];
	// Option #0
	options.push({nPlayers : nPlayers, names : names, winRatios : winRatios, eloInitial : eloInitial});
	winRatios = [0.0, 0.333, 0.333, 0.334];
	// Option #1
	options.push({nPlayers : nPlayers, names : names, winRatios : winRatios});
	// This example is the same as the above, but Elo ratings will be computed
	// as if for a team game. The teams are fixed. It is assumed that Frank
	// and Jim never win due to Frank's incompetence.
	// Option #2
	winRatios = [0.0, 1/3, 1/3, 1/3];
	options.push({nPlayers : nPlayers, names : names, winRatios : winRatios, team : true, eloInitial : [1200, 1600, 1600, 1600]});

	// Same as above, only players are randomly reassigned teams over time.
	// Assume that the 1600 players are equally likely to win, and the 1200
	// player will never win.
	// Option #3
	winRatios = [0.0, 1/3, 1/3, 1/3];
	options.push({nPlayers : nPlayers, names : names, winRatios : winRatios,
		team : true, shufflePlayers : true, eloInitial : [1200, 1600, 1600, 1600]});

	winRatios = [0.05, 0.70, 0.15, 0.1];
	options.push({nPlayers : nPlayers, names : names, winRatios : winRatios});
	winRatios = [0.25, 0.25, 0.25, 0.25];
	options.push({nPlayers : nPlayers, names : names, winRatios : winRatios});
	winRatios = [0.2, 0.3, 0.4, 0.1];
	options.push({nPlayers : nPlayers, names : names, winRatios : winRatios});
	winRatios = [0.23, 0.24, 0.26, 0.27];
	options.push({nPlayers : nPlayers, names : names, winRatios : winRatios});
	winRatios = [0.0, 0.1, 0.2, 0.7];
	options.push({nPlayers : nPlayers, names : names, winRatios : winRatios});
	winRatios = [0.05, 0.15, 0.7, 0.1];
	options.push({nPlayers : nPlayers, names : names, winRatios : winRatios});
	winRatios = [1, 0.0, 0.0, 0.0];
	options.push({nPlayers : nPlayers, names : names, winRatios : winRatios});
	nPlayers = 2;
	winRatios = [0.01, 0.99];
	options.push({nPlayers : nPlayers, names : names, winRatios : winRatios});
	winRatios = [0.5, 0.5];
	options.push({nPlayers : nPlayers, names : names, winRatios : winRatios});
	winRatios = [0.45, 0.55];
	options.push({nPlayers : nPlayers, names : names, winRatios : winRatios});
	return options;
};

/**
 * Sets the number of times this player won, placed 2nd, 3rd, and 4th.
 * @param {Array} placings see getPlacings
 * @param {Object} the Game
 */
var assignNTimes = function(placings, game) {
	placings.forEach(function(playerNumber, place) {
		game.players[playerNumber].nTimes[place]++;
	});
	assignNTimesByElo(game);
};

/**
 * Sets the number of times this player's Elo rating was 1st, 2nd, 3rd, and
 * 4th.
 * @param {Object} the Game
 */
var assignNTimesByElo = function(game) {
	// Players are sorted with index 0 being highest Elo rating
	var playersSortedByElo = game.players.slice().sort(function(a, b) {
		return b.eloRating - a.eloRating;
	});
	playersSortedByElo.forEach(function(player, place) {
		player.nEloTimes[place]++;
	});
};

/**
 * Runs a simulation of nGames with the input options set to specify the number
 * of players in our game, and their probability of winning.
 * @param {Object} e.g. { nPlayers : 2, winRatios : [...], names : [...]}
 * @return {Object} e.g. { rows : [..], players : [..] } the rows are suitable
 * for use by google.visualization.MotionChart
 */
var runExperiment = function(option, creditOneWinner) {
	var DEBUG = false;
	var rows = [];
	var game = new Game();
	game.setCreditWinnerOnly(creditOneWinner);
	game.setTeamGame(option.team);
	game.setShufflePlayers(option.shufflePlayers);
	var nPlayers = option.nPlayers;
	var winRatios = option.winRatios;
	var names = option.names;
	var eloInitial = [1500, 1500, 1500, 1500];
	if (option.eloInitial) {
		eloInitial = option.eloInitial;
	}
	for (var i = 0; i < nPlayers; i++) {
		game.addPlayer(new Player(i, winRatios[i], eloInitial[i]));
		game.players[i].name = names[i];
	}
	if (DEBUG) console.log("Initial players for experiment:");
	game.players.forEach(function(p, i) {
		p.nTimes = [0,0,0,0];
		p.nEloTimes = [0,0,0,0];
		if (DEBUG) console.log(i + ") " + JSON.stringify(p));
	});
	// Just an array of zeroes
	var counts = winRatios.map(function() { return 0; });
	var assignEloRatingsAfterGame = function(newEloRatings) {
		game.players.forEach(function(p, i) {
			p.eloRating = newEloRatings[p.playerNumber];
		});
	};

	var storeElo = function() {
		var result = [];
		for (j = 0; j < len; j++) {
			var player = game.players[j];
			rows.push([player.name, new Date(year, month, day), player.eloRating]);
		}
		day++;
		if (day >= maxDay) {
			day = 0;
			month++;
		}
		if (month >= maxMonth) {
			month = 0;
			year++;
		}		
	};

	var newEloRatings = game.players.map(function(el) { return 0; } );

	var maxMonth = 11;
	var maxDay = 28;
	var day = 0;
	var month = 0;
	var year = 1900;
	var len = game.players.length;
	storeElo();
	var reassignPlayerNumber = function() {
		game.players.forEach(function(p, i) {
			p.playerNumber = i;
		});
	};
	for (i = 0; i < nGames; i++) {
		var str = "	BEFORE:	";
		var j;
		for (j = 0; j < len; j++) {
			str += j + ") " + game.players[j].playerNumber + " " + game.players[j].name + " " + game.players[j].eloRating + ", ";
		}
		if (DEBUG) console.log(str);
		var placings = game.getPlacings();
		str = "	AFTER: placings " + JSON.stringify(placings) + " ";
		for (j = 0; j < len; j++) {
			var index = placings[j];
			var playerNum = game.players[index].playerNumber;
			var newElo = game.computeElo(game.players[index], game.players, placings);
			newEloRatings[playerNum] = Math.round(newElo);
			str += placings[j] + ") placed " + j + " "  + playerNum + " " + game.players[index].name + " " + newEloRatings[playerNum] + ", ";
		}
		if (DEBUG) console.log(str);
		assignEloRatingsAfterGame(newEloRatings);
		assignNTimes(placings, game);
		storeElo();
		/*
		var x = game.players.slice();
		game.players[0] = x[3];
		game.players[3] = x[0];
		*/
		if (game.shufflePlayers) {
			game.shuffle(game.players);
			reassignPlayerNumber();
		}
		if (DEBUG) console.log("New player set: " + JSON.stringify(game.players));
	}
	return { rows : rows, players : game.players };
};

/**
 * A little test to run outside the browser.
 */
 /*
var test = function() {
	var options = getOptions();
	var option = options[3];
	var result = runExperiment(option);
	//console.log(result.players);
};
test();
*/
/*
exports.Player = Player;

exports.Game = Game;

exports.runExperiment = runExperiment;
*/
