"use strict";

var runExperiment = require("../runExperiment"),
	Game = runExperiment.Game,
	Player = runExperiment.Player,
	vows = require("vows"),
	assert = require("assert");

var suite = vows.describe("Tests for functions in runExperiment.js. To run these tests, uncomment the exports statement at the end of runExperiment.js, and npm install vows");

/**
 * A suite of tests for Game.computeElo.
 */
suite.addBatch({
	"All players start with 1500 Elo rating, and the winner collects points from each loser" : {
		topic : function() {
			var game = new Game();
			game.setCreditWinnerOnly(true);
			var nPlayers = 4; // as for Hearts card game
			for (var i = 0; i < nPlayers; i++) {
				// All start with Elo rating of 1500
				// The 0th player must win, all others lose.
				game.addPlayer(new Player(i, i === 0 ? 1 : 0, 1500));
				game.players[i].name = "Player " + i;
			}
			// Not used
			game.players.forEach(function(p, i) {
				p.nTimes = [0,0,0,0];
				p.nEloTimes = [0,0,0,0];
			});
			var getOtherPlayersEloRatings = function(playerNumber) {
				var theirEloRatings = game.players.map(
					function(p, k) {
						return p.eloRating;
					}).filter(function(p, k) {
						return playerNumber !== k;
					}
				);
				return theirEloRatings;
			};
			var placings = game.getPlacings();
			var newEloRatings = new Array(nPlayers);
			for (var j = 0; j < nPlayers; j++) {
				var playerNum = game.players[j].playerNumber;
				var theirEloRatings = getOtherPlayersEloRatings(playerNum);
				var ps = placings.slice();
				ps.splice(j, 1);
				var newElo = game.computeElo(game.players[j], game.players, placings);
				newEloRatings[playerNum] = Math.round(newElo);
			}
			return newEloRatings;
		},
		"The winner collects 15 Elo points from each loser, and the losers subtract 15 pts each" : function(err, result) {
			assert.deepEqual(result, [1545, 1485, 1485, 1485]);
		}
	},
	"Players start a wide range of Elo ratings, and the winner is the one with a middle Elo" : {
		topic : function() {
			var game = new Game();
			game.setCreditWinnerOnly(true);
			var nPlayers = 4; // as for Hearts card game
			var Elo = [1634, 1459, 1280, 1524];
			for (var i = 0; i < nPlayers; i++) {
				// The player with 1459 Elo wins, other players lose
				game.addPlayer(new Player(i, i === 1 ? 1 : 0, Elo[i]));
				game.players[i].name = "Player " + i;
			}
			// Not used
			game.players.forEach(function(p, i) {
				p.nTimes = [0,0,0,0];
				p.nEloTimes = [0,0,0,0];
			});
			var getOtherPlayersEloRatings = function(playerNumber) {
				var theirEloRatings = game.players.map(
					function(p, k) {
						return p.eloRating;
					}).filter(function(p, k) {
						return playerNumber !== k;
					}
				);
				return theirEloRatings;
			};
			var placings = game.getPlacings();
			var newEloRatings = new Array(nPlayers);
			for (var j = 0; j < nPlayers; j++) {
				var playerNum = game.players[j].playerNumber;
				var theirEloRatings = getOtherPlayersEloRatings(playerNum);
				var ps = placings.slice();
				ps.splice(j, 1);
				var newElo = game.computeElo(game.players[j], game.players, placings);
				newEloRatings[playerNum] = Math.round(newElo);
			}
			return newEloRatings;
		},
		"The winner collects Elo points from each loser, player with 1280 Elo gets a few pts due to ties with higher ranked players" : function(err, result) {
			assert.deepEqual(result, [1596, 1507, 1293, 1502]);
		}
	},
	"3 players have a high Elo, one has a lower one" : {
		topic : function() {
			var game = new Game();
			game.setCreditWinnerOnly(true);
			var nPlayers = 4; // as for Hearts card game
			var Elo = [1634, 1589, 1427, 1670];
			for (var i = 0; i < nPlayers; i++) {
				// The player with 1670 Elo wins, other players lose
				game.addPlayer(new Player(i, i === 3 ? 1 : 0, Elo[i]));
				game.players[i].name = "Player " + i;
			}
			// Not used
			game.players.forEach(function(p, i) {
				p.nTimes = [0,0,0,0];
				p.nEloTimes = [0,0,0,0];
			});
			var getOtherPlayersEloRatings = function(playerNumber) {
				var theirEloRatings = game.players.map(
					function(p, k) {
						return p.eloRating;
					}).filter(function(p, k) {
						return playerNumber !== k;
					}
				);
				return theirEloRatings;
			};
			var placings = game.getPlacings();
			var newEloRatings = new Array(nPlayers);
			for (var j = 0; j < nPlayers; j++) {
				var playerNum = game.players[j].playerNumber;
				var theirEloRatings = getOtherPlayersEloRatings(playerNum);
				var ps = placings.slice();
				ps.splice(j, 1);
				var newElo = game.computeElo(game.players[j], game.players, placings);
				newEloRatings[playerNum] = Math.round(newElo);
			}
			return newEloRatings;
		},
		"The winner collects Elo points from each loser, player with 1427 Elo gets a few pts due to ties with higher ranked players" : function(err, result) {
			assert.deepEqual(result, [1611, 1573, 1436, 1701]);
		}
	},
});

/**
 * A suite of tests for Game.computeElo, when game.team is true, e.g. Spades
 */
suite.addBatch({
	"All players start with 1500 Elo rating, and the winning team collects points from each member of the losing team, only" : {
		topic : function() {
			var game = new Game();
			game.setCreditWinnerOnly(false);
			game.setTeamGame(true); // as for Spades card game
			var nPlayers = 4; // as for Spades card game
			for (var i = 0; i < nPlayers; i++) {
				// All start with Elo rating of 1500
				// The 1st and 3rd player win, other team loses.
				game.addPlayer(new Player(i, i === 0 || i === 2 ? 0.5 : 0, 1500));
				game.players[i].name = "Player " + i;
			}
			// Not used
			game.players.forEach(function(p, i) {
				p.nTimes = [0,0,0,0];
				p.nEloTimes = [0,0,0,0];
			});
			var getOtherPlayersEloRatings = function(playerNumber) {
				var theirEloRatings = game.players.map(
					function(p, k) {
						return p.eloRating;
					}).filter(function(p, k) {
						return playerNumber !== k;
					}
				);
				return theirEloRatings;
			};
			var placings = game.getPlacings();
			var newEloRatings = new Array(nPlayers);
			for (var j = 0; j < nPlayers; j++) {
				var playerNum = game.players[j].playerNumber;
				var theirEloRatings = getOtherPlayersEloRatings(playerNum);
				var ps = placings.slice();
				ps.splice(j, 1);
				var newElo = game.computeElo(game.players[j], game.players, placings);
				newEloRatings[playerNum] = Math.round(newElo);
			}
			return newEloRatings;
		},
		"The winners collect 30 Elo points from each loser, and the losers subtract 30 pts each" : function(err, result) {
			// assert.deepEqual(result, [1545, 1485, 1545, 1485]);
			assert.deepEqual(result, [1530, 1470, 1530, 1470]);
		}
	},
	"Players start a wide range of Elo ratings, and the winner is the one with a middle Elo" : {
		topic : function() {
			var game = new Game();
			game.setCreditWinnerOnly(false);
			game.setTeamGame(true); // as for Spades card game
			var nPlayers = 4;
			var Elo = [1634, 1459, 1280, 1524];
			for (var i = 0; i < nPlayers; i++) {
				// The team w players 1459 + 1524 Elo wins, other players lose
				game.addPlayer(new Player(i, i === 1 || i === 3 ? 0.5 : 0, Elo[i]));
				game.players[i].name = "Player " + i;
			}
			// Not used
			game.players.forEach(function(p, i) {
				p.nTimes = [0,0,0,0];
				p.nEloTimes = [0,0,0,0];
			});
			var getOtherPlayersEloRatings = function(playerNumber) {
				var theirEloRatings = game.players.map(
					function(p, k) {
						return p.eloRating;
					}).filter(function(p, k) {
						return playerNumber !== k;
					}
				);
				return theirEloRatings;
			};
			var placings = game.getPlacings();
			var newEloRatings = new Array(nPlayers);
			for (var j = 0; j < nPlayers; j++) {
				var playerNum = game.players[j].playerNumber;
				var theirEloRatings = getOtherPlayersEloRatings(playerNum);
				var ps = placings.slice();
				ps.splice(j, 1);
				var newElo = game.computeElo(game.players[j], game.players, placings);
				newEloRatings[playerNum] = Math.round(newElo);
			}
			return newEloRatings;
		},
		"The winner collects Elo points from each loser" : function(err, result) {
			assert.deepEqual(result, [1592, 1489, 1266, 1550]);
		}
	},
	"3 players have a high Elo, one has a lower one" : {
		topic : function() {
			var game = new Game();
			game.setCreditWinnerOnly(false);
			game.setTeamGame(true); // as for Spades card game
			var nPlayers = 4;
			var Elo = [1600, 1600, 1600, 1200];
			for (var i = 0; i < nPlayers; i++) {
				// The team with 1600 Elo wins, other players lose
				game.addPlayer(new Player(i, i === 0 || i === 2 ? 0.5 : 0, Elo[i]));
				game.players[i].name = "Player " + i;
			}
			// Not used
			game.players.forEach(function(p, i) {
				p.nTimes = [0,0,0,0];
				p.nEloTimes = [0,0,0,0];
			});
			var getOtherPlayersEloRatings = function(playerNumber) {
				var theirEloRatings = game.players.map(
					function(p, k) {
						return p.eloRating;
					}).filter(function(p, k) {
						return playerNumber !== k;
					}
				);
				return theirEloRatings;
			};
			var placings = game.getPlacings();
			var newEloRatings = new Array(nPlayers);
			for (var j = 0; j < nPlayers; j++) {
				var playerNum = game.players[j].playerNumber;
				var theirEloRatings = getOtherPlayersEloRatings(playerNum);
				var ps = placings.slice();
				ps.splice(j, 1);
				var newElo = game.computeElo(game.players[j], game.players, placings);
				newEloRatings[playerNum] = Math.round(newElo);
			}
			return newEloRatings;
		},
		"The winning team collects Elo points from each loser" : function(err, result) {
			assert.deepEqual(result, [1618, 1570, 1618, 1195]);
		}
	},
});

/**
 * A suite of tests for Game.runExperiment, when game.team is true, e.g. Spades
 */
suite.addBatch({
	"3 players have a high Elo, one has a lower one" : {
		topic : function() {
			var game = new Game();
			game.setCreditWinnerOnly(false);
			game.setTeamGame(true); // as for Spades card game
			var nPlayers = 4;
			var Elo = [1600, 1600, 1600, 1200];
			for (var i = 0; i < nPlayers; i++) {
				// The team with 1600 Elo wins, other players lose
				game.addPlayer(new Player(i, i === 0 || i === 2 ? 0.5 : 0, Elo[i]));
				game.players[i].name = "Player " + i;
			}
			// Not used
			game.players.forEach(function(p, i) {
				p.nTimes = [0,0,0,0];
				p.nEloTimes = [0,0,0,0];
			});
			var getOtherPlayersEloRatings = function(playerNumber) {
				var theirEloRatings = game.players.map(
					function(p, k) {
						return p.eloRating;
					}).filter(function(p, k) {
						return playerNumber !== k;
					}
				);
				return theirEloRatings;
			};
			var placings = game.getPlacings();
			var newEloRatings = new Array(nPlayers);
			for (var j = 0; j < nPlayers; j++) {
				var playerNum = game.players[j].playerNumber;
				var theirEloRatings = getOtherPlayersEloRatings(playerNum);
				var ps = placings.slice();
				ps.splice(j, 1);
				var newElo = game.computeElo(game.players[j], game.players, placings);
				newEloRatings[playerNum] = Math.round(newElo);
			}
			return newEloRatings;
		},
		"The winning team collects Elo points from each loser" : function(err, result) {
			assert.deepEqual(result, [1618, 1570, 1618, 1195]);
		}
	},
});
suite["export"](module);
