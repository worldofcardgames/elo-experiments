# elo-experiments

When [Elo ratings](https://en.wikipedia.org/wiki/Elo_rating_system#Mathematical_details) are generated for 2-player games, the behavior is predictable... or at least familiar, since chess organizations have been using Elo ratings for years.

However, the behavior of Elo ratings for n-player games (n > 2) has not been explored well, not to my knowledge anyway.

I've set up some experiments for 2- and 4-player games. This initial check-in gives us the opportunity to see how Elo ratings evolve when a set of identical players face off against each other for 1000 games in a row. Each player has a fixed probability of winning. A roll of the dice determines who wins and who loses, but a player is more likely to win of their "win ratio" is higher.

The demo is run at this github page: http://worldofcardgames.github.io/elo-experiments/

A [Google MotionChart](https://developers.google.com/chart/interactive/docs/gallery/motionchart) is used to visualize the evolution of each player's Elo rating over the course of the 1000 games.
