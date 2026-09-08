/*
	One catalogue for the three powerups.

	The game room labels its buttons from it, the roll animation spins through
	it and the tutorial explains it. They each used to carry their own copy and
	had already drifted apart - the same powerup was "Skip a player" on the
	button and "Skip Another's Turn" in the roll, and True Vision claimed to
	show the last played cards when it actually shows part of a hand.
*/
export const POWERUPS = [
	{
		id: 0,
		icon: "👁",
		name: "True Vision",
		blurb: "Peek at part of another player's hand",
		description: "Pick any player and about a third of their hand is revealed — to you and nobody else. Worth spending on whoever is about to declare a value you doubt.",
	},
	{
		id: 1,
		icon: "✨",
		name: "Cleanse",
		blurb: "Clear the preorder somebody placed on you",
		description: "Drops the preorder sitting on you, even after your turn was skipped, so its pending accusation never fires. The player who placed it gets their claim back and can aim it somewhere else.",
	},
	{
		id: 2,
		icon: "⏭",
		name: "Skip a player",
		blurb: "Take the turn away from whoever holds it",
		description: "Skips the player whose turn it is right now and passes it on. It only works on the current turn holder, so timing is the whole trick.",
	},
];

export const powerupById = (id) => POWERUPS.find((powerup) => powerup.id === id);
