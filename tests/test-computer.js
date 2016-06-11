"use strict";

var eloComputer2Player = require("../eloComputer2Player"),
	Computer = eloComputer2Player.Computer,
	vows = require("vows"),
	assert = require("assert");

var suite = vows.describe("Tests for functions in eloComputer2Player.js. To run these tests, uncomment the exports statement at the end of runExperiment.js, and npm install vows");

/**
 * A suite of tests for Computer.computeNewEloRating
 */
suite.addBatch({
	"Both players start with 1500 Elo rating, and the winner collects points from the loser. Players have same Elo K: 30" : {
		topic : function() {
			var computer = new Computer();
			var oldRatingA = 1500;
			var oldRatingB = 1500;
			var actualA = 1;
			var actualB = 0;
			var KA = 30;
			var KB = 30;
			var expectedA = computer.computeEloExpectation(oldRatingA, oldRatingB);
			var expectedB = computer.computeEloExpectation(oldRatingA, oldRatingB);
			var newEloA = computer.computeNewEloRating(oldRatingA, actualA, expectedA, KA);
			var newEloB = computer.computeNewEloRating(oldRatingB, actualB, expectedB, KB);
			var newEloRatings = [newEloA, newEloB];
			return newEloRatings;
		},
		"The winner collects 15 Elo points from each loser, and the loser subtracts 15 pts" : function(err, result) {
			assert.deepEqual(result, [1515, 1485]);
		}
	},
	"Both players start with 1500 Elo rating, and the winner collects points from the loser. Players have different Elo K: winner has 30, and loser has 50" : {
		topic : function() {
			var computer = new Computer();
			var oldRatingA = 1500;
			var oldRatingB = 1500;
			var actualA = 1;
			var actualB = 0;
			var KA = 30;
			var KB = 50;
			var expectedA = computer.computeEloExpectation(oldRatingA, oldRatingB);
			var expectedB = computer.computeEloExpectation(oldRatingA, oldRatingB);
			var newEloA = computer.computeNewEloRating(oldRatingA, actualA, expectedA, KA);
			var newEloB = computer.computeNewEloRating(oldRatingB, actualB, expectedB, KB);
			var newEloRatings = [newEloA, newEloB];
			return newEloRatings;
		},
		"The more experienced winner collects 15 Elo points from each loser, and the loser subtracts 25 pts" : function(err, result) {
			assert.deepEqual(result, [1515, 1475]);
		}
	},
	"Both players start with 1500 Elo rating, and the winner collects points from the loser. Players have different Elo K: winner has 50, and loser has 30" : {
		topic : function() {
			var computer = new Computer();
			var oldRatingA = 1500;
			var oldRatingB = 1500;
			var actualA = 1;
			var actualB = 0;
			var KA = 50;
			var KB = 30;
			var expectedA = computer.computeEloExpectation(oldRatingA, oldRatingB);
			var expectedB = computer.computeEloExpectation(oldRatingA, oldRatingB);
			var newEloA = computer.computeNewEloRating(oldRatingA, actualA, expectedA, KA);
			var newEloB = computer.computeNewEloRating(oldRatingB, actualB, expectedB, KB);
			var newEloRatings = [newEloA, newEloB];
			return newEloRatings;
		},
		"The less experienced winner collects 25 Elo points from each loser, and the loser subtracts 15 pts" : function(err, result) {
			assert.deepEqual(result, [1525, 1485]);
		}
	},
});


suite["export"](module);
