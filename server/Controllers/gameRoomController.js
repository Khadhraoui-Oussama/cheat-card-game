import gameRoomModel from "../Models/gameRoomModel.js";

//createGameRoom
const createGameRoom = async (req, res) => {
	const { socketRoomId, players, gameSettings, status } = req.body;
	try {
		const gameRoom = new gameRoomModel({
			socketRoomId,
			players,
			gameSettings,
			status,
		});

		gameRoom.save();
		res.status(200).json({
			socketRoomId,
			players,
			gameSettings,
			status,
		});
	} catch (error) {
		console.log(error);
		res.status(500).json(error);
	}
};

//getGameRoom by socketId
const getGameRoom = async (req, res) => {
	try {
		const socketRoomId = req.params.socketRoomId;
		const gameRoom = await gameRoomModel.find({ socketRoomId });

		res.status(200).json(gameRoom);
	} catch (error) {
		console.log(error);
		res.status(500).json(error);
	}
};

//getAllGameRooms
const getAllGameRooms = async (req, res) => {
	try {
		const gameRooms = await gameRoomModel.find();

		res.status(200).json(gameRooms);
	} catch (error) {
		console.log(error);
		res.status(500).json(error);
	}
};

export { createGameRoom, getGameRoom, getAllGameRooms };
