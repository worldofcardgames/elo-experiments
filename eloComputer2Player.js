"use strict";
/**
 * Computer for Elo ratings. Some copy-paste code from runExperiments.js
 */
var Computer = function() {
	/**
	 * Computes the Elo expectation, see
	 * https://en.wikipedia.org/wiki/Elo_rating_system#Mathematical_details
	 *
	 * @param {Number} oldRank the player's old Elo rating
	 * @param {Number} opponent's Elo rating
	 * @return {Number} the Elo expectation
	 */
	Computer.prototype.computeEloExpectation = function(oldRank, oppRank) {
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
	 * @param {Number} Elo K number (e.g. 30 or 50)
	 * @return {Number} player's new Elo rating
	 */
	Computer.prototype.computeNewEloRating = function(oldRating, actual, expected, K) {
		var newRank = oldRating + K*(actual - expected);
		return Math.round(newRank);
	};
};

exports.Computer = Computer;