import gameConfigurationModel from "../Models/gameConfigurationModel.js";

/* 
socketRoomId: String,
powerUpsEnabled: Boolean,
suitType: String,
preOrderActive: Boolean,
preOrderDetails: Array,    
*/
//createGameConfig
const createGameConfig = async (req, res) => {
	const { socketRoomId, players, gameSettings, status } = req.body;
	try {
		const gameRoom = new gameConfigurationModel({
			socketRoomId,
			powerUpsEnabled,
			suitType,
			preOrderActive,
			preOrderDetails,
		});

		gameRoom.save();
		res.status(200).json({
			socketRoomId,
			powerUpsEnabled,
			suitType,
			preOrderActive,
			preOrderDetails,
		});
	} catch (error) {
		console.log(error);
		res.status(500).json(error);
	}
};

//getGameConfig by socketRoomId
const getGameConfig = async (req, res) => {
	try {
		const socketRoomId = req.params.socketRoomId;
		const gameConfig = await gameConfigurationModel.find({ socketRoomId });

		res.status(200).json(gameConfig);
	} catch (error) {
		console.log(error);
		res.status(500).json(error);
	}
};

//getAllGameConfigs
const getAllGameConfigs = async (req, res) => {
	try {
		const gameConfigs = await gameConfigurationModel.find();

		res.status(200).json(gameConfigs);
	} catch (error) {
		console.log(error);
		res.status(500).json(error);
	}
};

export { createGameConfig, getGameConfig, getAllGameConfigs };
