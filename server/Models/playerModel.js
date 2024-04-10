import mongoose, { mongo } from "mongoose";

//players array will have playerId , playerName, playerCards , hasTurn ?,powerups

//playerId will be socketId
//playerName is the name choosen when joininig a lobby (not an account name this game will not support accounts for now)
//playerCards array will be an array of strings (the cards will be identified by the name AH : ace hearts):{ cardName:String }
//powerUps is array of powerUps
//hasTurn will be false if other player uses "block turn powerup" on this current user
//powerUps :
//  SHIELD to protect you from preorders (useful when about to win)
//  BLOCK A TURN for a player
//  SHOW A PLAYER CARD COUNT (just the back of the cards will pop up next to the player icon and the number aswell)
//  SHOW A CERTAIN PLAYER'S CARD (the back of the cards will pop up next to the player icon and and the player can
//  select a card , when selected ,that card will flip showing itself to taht player only for 5 seconds
//  and then turn back and the whole player cards will pop down)
//  THAT'S IT FOR NOW

const playerSchema = mongoose.Schema({
	socketId: String,
	playerName: {
		type: String,
		required: true,
		minlength: 3,
		maxlength: 30,
	},
	playerCards: Array,
	hasTurn: Boolean,
	powerUps: Array,
	//canPreorder: Boolean,
	canAccuse: Boolean,
	gender: String,
	avatar: String,
});

const playerModel = mongoose.model("Player", playerSchema);

export default playerModel;
