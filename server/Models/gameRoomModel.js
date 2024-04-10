import mongoose from "mongoose";

const gameRoomSchema = mongoose.Schema(
	{
		socketRoomId: String,
		players: Array,
		gameSettings: Array,
		status: String,
	},
	{ timeStamps: true }
);

const gameRoomModel = mongoose.model("gameRoom", gameRoomSchema);

export default gameRoomModel;
