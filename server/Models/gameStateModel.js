import mongoose from "mongoose";

//players array will hold the socket id's of the players in the room
//ready will be true when all players are connected ,by default it's false
const gameStateSchema = mongoose.Schema(
	{
		socketRoomId: String,
		cardsAtCenter: Array,
		players: Array,
		currentlyPlaying: Boolean,
	},
	{ timeStamps: true }
);
const gameStateModel = mongoose.model("gameState", gameStateSchema);

export default gameStateModel;
