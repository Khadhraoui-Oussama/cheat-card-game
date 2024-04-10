import mongoose from "mongoose";

//when a player preorders the preOrderActive will turn true and the preOrderDetails array will be filled
//preOrderDetails array will have the player who issued the preorder action and the player who will be playing next
//only the player who issued the preorder action will have canAccuse boolean as true , all the others will have it as false
const gameConfigurationSchema = mongoose.Schema({
	socketRoomId: String,
	powerUpsEnabled: Boolean,
	suitType: String,
	preOrderActive: Boolean,
	preOrderDetails: Array,
});

const gameConfigurationModel = mongoose.model("GameConfiguration", gameConfigurationSchema);

export default gameConfigurationModel;
