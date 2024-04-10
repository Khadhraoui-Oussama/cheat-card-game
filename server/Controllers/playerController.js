import playerModel from "../Models/playerModel.js";

//createPlayer
//no need to check for unique usernames
const registerPlayer = async (req, res) => {
	try {
		const { socketId, playerName, playerCards, hasTurn, powerUps, canAccuse } = req.body;
		//check if user has filled all fields
		if (!playerName) {
			return res.status(400).json("Please choose a name to play ...");
		}
		if (!socketId) {
			return res.status(400).json("SocketId error when creating a player...");
		}

		const player = new playerModel({
			socketId,
			playerName,
			playerCards,
			hasTurn,
			powerUps,
			canAccuse,
			gender,
			avatar,
		});

		//save the player to the database
		await player.save();
		res.status(200).json({
			_id: player._id,
			socketId,
			playerName,
			playerCards,
			hasTurn,
			powerUps,
			canAccuse,
			gender,
			avatar,
		});
	} catch (error) {
		console.log(error);
		res.status(500).json(error);
	}
};

//findPlayer by id
const findPlayer = async (req, res) => {
	const playerId = req.params.playerId;
	try {
		const player = await playerModel.findById(playerId);
		res.status(200).json(player);
	} catch (error) {
		console.log(error);
		res.status(500).json(error);
	}
};

const getAllPlayersInRoom = async (req, res) => {
	const roomId = req.params.roomId;
	try {
		const playersArray = await playerModel.find({ roomId });
		res.status(200).json(playersArray);
	} catch (error) {
		console.log(error);
		res.status(500).json(error);
	}
};
const getUsers = async (req, res) => {
	const roomId = req.params.roomId;
	try {
		const allPlayersArray = await playerModel.find();
		res.status(200).json(allPlayersArray);
	} catch (error) {
		console.log(error);
		res.status(500).json(error);
	}
};

export { registerPlayer, findPlayer, getAllPlayersInRoom, getUsers };
