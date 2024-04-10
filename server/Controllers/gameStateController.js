import gameStateModel from "../Models/gameStateModel.js";

//createGameState
const createGameState = async (req, res) => {
	try {
		const { socketRoomId, players, cardsAtCenter, currentlyPlaying } = req.body;

		const gameState = new gameStateModel({
			socketRoomId,
			cardsAtCenter,
			players,
			currentlyPlaying,
		});

		gameState.save();

		res.status(200).json({
			_id: gameState._id,
			socketRoomId,
			cardsAtCenter,
			players,
			currentlyPlaying,
		});
	} catch (error) {
		console.log(error);
		res.status(500).json(error);
	}
};

//getGameState
const getGameState = async (req, res) => {
	try {
		const socketRoomId = req.params.socketRoomId;
		const gameState = await playerModel.find({ socketRoomId });

		res.status(200).json(gameState);
	} catch (error) {
		console.log(error);
		res.status(500).json(error);
	}
};

//getAllGameStates
const getAllGameStates = async (req, res) => {
	try {
		const gameStates = await playerModel.find();

		res.status(200).json(gameStates);
	} catch (error) {
		console.log(error);
		res.status(500).json(error);
	}
};
export { createGameState, getGameState, getAllGameStates };
