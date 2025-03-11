import dotenv from "dotenv";
import express from "express";
import {createServer} from "node:http";
import cors from "cors";
import mongoose from "mongoose";
import path from "node:path";
import {fileURLToPath} from "url";
import {Server} from "socket.io";

import playerRouter from "./Routes/playerRoute.js";
import gameStateRouter from "./Routes/gameStateRoute.js";
import gameRoomRouter from "./Routes/gameRoomRoute.js";
import gameConfigurationRouter from "./Routes/gameConfigurationRoute.js";

// Configure env variables
dotenv.config();

const app = express(); // make an express app

const expressServer = createServer(app);
/* This line creates an HTTP server using the createServer method from the http module, with app (an Express application instance) as the request handler.
It essentially sets up an HTTP server that uses the Express application to handle incoming requests. */

const port = process.env.PORT || 5000; //this is for just for deployment (the backend hosting platform will assign us a random port number)
expressServer.listen(port, () => {
	console.log(`HTTP Server running on port ${port}`);
});

const io = new Server(expressServer, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"],
	},
}); /* This line creates a new instance of a Socket.IO Server (io) that is attached to the previously created HTTP server (expressServer).
The configuration object passed to the Server constructor sets up Cross-Origin Resource Sharing (CORS) to allow requests from any origin (origin: "*") and to permit only GET and POST methods.*/

const uri = process.env.ATLAS_URI;

app.get("/", (req, res) => {
	res.send("You have reached the card game API...");
});

let onlineUsers = {};
let lastMovePlayedInRoom = {};
//LETS TALK FOR A SECOND
/*
 I NEED TO STORE ONLINEUSERS IN A DICTIONNARY TYPE DATA DTRUCT WHERE THE KEY IS THE ROOMCODE AND THE VALUE IS AN ARRAY OF THE PLAYER OBJECTS THAT ARE IN THE ROOM
*/

// Add these helper functions above your socket.io connection handler
const createDeck = () => {
	const suits = ["C", "D", "H", "S"];
	const values = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
	const deck = [];

	//1 deck is used here
	//if at a later point more decks area added , should make sure every card is unique
	//to avoid dnd-kit issues , also make sure that deck.slice is updated from 13 to 13 * number_of_decks_used
	const number_of_decks_used = 1;
	for (let index = 0; index < number_of_decks_used; index++) {
		for (let suit of suits) {
			for (let value of values) {
				deck.push(`${value}${suit}`);
			}
		}
	}
	deck.push("1J", "2J", "3J", "4J");
	return deck;
};

const shuffleDeck = (deck) => {
	for (let i = deck.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[deck[i], deck[j]] = [deck[j], deck[i]];
	}
	return deck;
};

const assignNewLeader = (roomCode) => {
	if (!onlineUsers[roomCode] || onlineUsers[roomCode].length === 0) return;

	const hasLeader = onlineUsers[roomCode].some((player) => player.isLeader);

	if (!hasLeader && onlineUsers[roomCode].length > 0) {
		onlineUsers[roomCode][0].isLeader = true;
		// Notify the new leader
		io.to(onlineUsers[roomCode][0].socketID).emit("updateLocalPlayer", onlineUsers[roomCode][0]);
		// Notify all players in the room about the updated user list
		io.to(roomCode).emit("updateUserList", onlineUsers[roomCode]);
	}
};

io.on("connection", (socket) => {
	socket.on("joinRoom", (dataArray) => {
		/*	in data array 
			dataArray[0] = roomCode
			dataArray[1] = socket.id
			dataArray[2] = playerNewObj which only has { name: player.name, avatar: player.avatar } (ie no gender we dont need it anymore we only added it to make the avatarSelection easier)
		*/
		//check if the socket exists in a room , if yes then delete the object that the socket is a part of , if not add normally
		const users = io.sockets.adapter.rooms.get(dataArray[0]);

		console.log("users in room : ", dataArray[0], ", ", users); //this test show that the room can only contain a socket once ,it's a Set with the roomName as the key, so the logic of the same user being in the room more than one time has to do with the onlineUsers array
		socket.join(dataArray[0]);
		console.log("Socket with ID :", dataArray[1], "has joined room :", dataArray[0]);
		//const usersInRoomArray = onlineUsers[dataArray[0]].filter((user) => user.socketID !== dataArray[1])
		onlineUsers[dataArray[0]] = onlineUsers[dataArray[0]]?.filter((player) => player.socketID !== socket.id); //this line is crucial : it may cause performance issues , but for now it's necessary to avoid pushing a newPlayer object to the onlineUsers object having the same socketID
		const newPlayer = {
			socketID: dataArray[1],
			room: dataArray[0],
			name: dataArray[2].name,
			avatar: dataArray[2].avatar,
			isLeader: dataArray[2].isLeader,
		};
		console.log("delete me later", dataArray[1]);
		if (!onlineUsers[dataArray[0]]) {
			onlineUsers[dataArray[0]] = []; // Initialize the room array if it doesn't exist
		}
		// Add the player to the room array
		onlineUsers[dataArray[0]].push(newPlayer);

		// Check and assign leader if needed
		assignNewLeader(dataArray[0]);

		// Notify all users in the room of the updated user list
		io.to(dataArray[0]).emit("updateUserList", onlineUsers[dataArray[0]]);
		console.log("Players Connected rn :", onlineUsers);
	});

	socket.on("getUsersInRoom", (roomCode) => {
		console.log("received getUsersInRoom signal from client with roomCode : ", roomCode);
		io.to(roomCode).emit("getUsersInRoomR", onlineUsers[roomCode]);
	});

	socket.on("navigateToGameRoom", (roomCode) => {
		io.to(roomCode).emit("navigateToGameRoomR", roomCode);
	});
	socket.on("getRoomSize", (roomCode) => {
		console.log("Room/Size : ", roomCode, onlineUsers[roomCode]?.length);
		io.emit("getRoomSizeR", onlineUsers[roomCode]?.length);
	});

	/* START GAME LOGIC */
	socket.on("startGame", ({roomCode, socketID}) => {
		console.log("startGame signal received from client with roomCode:", roomCode);

		// Get all players in the room
		const players = onlineUsers[roomCode];
		if (!players || players.length !== 4) {
			console.log("Need exactly 4 players to start the game");
			return;
		}

		// Create and shuffle the deck
		const deck = shuffleDeck(createDeck());

		// Deal 13 cards to each player and update their player object
		let localPlayer;
		players.forEach((player, index) => {
			const playerCards = deck.slice(index * 13, (index + 1) * 13);
			player.cards = playerCards; // Add the cards to the player object
			if (player.isLeader) {
				player.hasTurn = true;
			} else {
				player.hasTurn = false; // Set the player's turn to false
			}

			// Send cards privately to each player
			io.to(player.socketID).emit("receiveCards", {playerCards, localPlayer});
		});
		players.forEach((player) => {
			if (player.socketID === socketID) {
				localPlayer = player;
			}
			io.to(player.socketID).emit("updateLocalPlayer", localPlayer);
		});

		//GIVE TURN TO THE GAME ROOM LEADER
		io.to(roomCode).emit("updateTurn", {currentPlayer: localPlayer.socketID});
		// Update the onlineUsers object with the modified players
		onlineUsers[roomCode] = players;

		// Notify all players that the game has started
		io.to(roomCode).emit("startGameR", roomCode);
	});

	//implement server response to the player making a move
	//THE SERVER SHOULD AT ALL TIMES HAVE THE STATE OF THE GAME STORED INSIDE IT
	//WHEN A PLAYERS SENDS A makeMove signal THE SERVER WILL MAKE THE NECESSAY ADJUSTMENTS TO THE GAME STATE
	//THEN UPDATE THE STATE INTERNALLY ,CHECK FOR WINNERS,THEN PASS THE TURN TO THE NEXT PLAYER
	const checkWinner = (roomCode) => {
		const winnerPlayerObject = onlineUsers[roomCode]?.find((player) => player.cards.length === 0);
		const winnerBOOL = winnerPlayerObject !== undefined;
		console.log("winner : ", winnerPlayerObject, " winnerBool :", winnerBOOL);
		return {winnerBOOL, winnerPlayerObject: winnerBOOL ? winnerPlayerObject : null};
	};
	socket.on("makeMove", ({roomCode, socketID, cardsPlayedArray, cardValueTold}) => {
		//if player is first to start ie the leader or any player that accused and won or got accused and won ,then the player can play any nymber of cards
		//and has to include the card value with no suit,
		//we have to store the last move ie the cardValueTold and the cardsPlayedArray
		//so that when a player gets accused we can check if the cards played match the cardValueTold
		//if the player is not the leader then the player has to play the same cardValueTold as the last player
		console.log("makeMove signal received from client with roomCode:", roomCode, " with cardsPlayedArray : ", cardsPlayedArray);
		onlineUsers[roomCode]?.forEach((player) => {
			//remove the cards played from the player's hand
			//todo check for preorder action before removing the cards entirely

			if (player.socketID === socketID) {
				player.cards = player.cards.filter((card) => !cardsPlayedArray.includes(card));
			}
		});
		lastMovePlayedInRoom[roomCode] = {cardsPlayedArray, cardValueTold};
		const findNextTurn = () => {
			//could be interrupted by accuse action in that case : 2 cases arise :
			//if accuser is right the turn goes to the accuser
			//if accuser is wrong the turn goes to the accused
			//need a way to store the accused and the accuser
			//also need to find a way to get the actiontype so it can be displayed in events section
			//circular motion of turns thanks to moudlo operator
			const currentPlayerIndex = onlineUsers[roomCode]?.findIndex((player) => player.socketID === socketID);
			const nextPlayerIndex = (currentPlayerIndex + 1) % onlineUsers[roomCode]?.length;
			return onlineUsers[roomCode][nextPlayerIndex];
		};
		// Check for winners
		const {winnerBOOL, winnerPlayerObject} = checkWinner(roomCode);
		// If there is a winner, send the winner to the client
		if (winnerBOOL) {
			io.to(roomCode).emit("gameOver", winnerPlayerObject);
		} else {
			io.to(roomCode).emit("updateTurn", {currentPlayer: findNextTurn().socketID});
		}
	});
	socket.on("accuse", ({roomCode, socketID, accusedPlayerID}) => {
		//check if last move played is the same as the cardValueTold
	});
	socket.on("preorder", ({roomCode, socketID, accusedPlayerID, cardValueTold}) => {
		//prevent all other players from acccusing this player
		//only the player that issued the preorder signal can accuse after the accusedPlayer has played their turn
	});
	/* END GAME LOGIC */

	socket.on("disconnect", (reason) => {
		console.log(`Socket with ID ${socket.id} has disconnected, reason: ${reason}`);
		// Track rooms that need an update
		const roomsToUpdate = []; //used to keep track of the room the disconnected socket is in ,for now its always one room, but could be more if we add a messaging room or an all players room(global rooom)

		// Iterate through each room in the onlineUsers object
		Object.keys(onlineUsers).forEach((roomCode) => {
			// Filter out the disconnected user from the room's player array
			const originalLength = onlineUsers[roomCode]?.length;
			const disconnectedPlayer = onlineUsers[roomCode]?.find((player) => player.socketID === socket.id);
			const wasLeader = disconnectedPlayer?.isLeader;

			onlineUsers[roomCode] = onlineUsers[roomCode]?.filter((player) => player.socketID !== socket.id);

			// If the player was removed (length changed), mark this room for update
			if (onlineUsers[roomCode]?.length !== originalLength) {
				roomsToUpdate.push(roomCode);
				// Reassign leader if the disconnected player was the leader
				if (wasLeader) {
					assignNewLeader(roomCode);
				}
			}

			// If the room is now empty, you can optionally remove it from the onlineUsers object
			if (onlineUsers[roomCode]?.length === 0) {
				delete onlineUsers[roomCode];
				delete lastMovePlayedInRoom[roomCode];
			}
			//** */
		});

		// Emit the updated user list to the rooms that were affected
		roomsToUpdate.forEach((roomCode) => {
			io.to(roomCode).emit("updateUserList", onlineUsers[roomCode]);
		});

		console.log("Updated Online Users:", onlineUsers);
	});
});

//I NEED TO SEND A SIGNAL TO THE SERVER WHEN THE BUTTON TURNS GREEN LETTING THE SERVER KNOW TO SEND AN EVENT TO ALL IN THE ROOM TO TELL THEM TO NAVIGATE TO THE GAMEROOM

// io.listen(port, () => {
// 	console.log(`Server running on port ${port}`);
// });

/* ************************** */
/* *****	MIDDLEWARE	***** */
/* ************************** */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public"))); // Serve static files from the public directory

app.use(express.json());
app.use("/api/players", playerRouter);
app.use("/api/gameState", gameStateRouter);
app.use("/api/gameRoom", gameRoomRouter);
app.use("/api/gameConfig", gameConfigurationRouter);
/* ******* END MIDDLEWARE ******* */

/* ************************** */
/* ****	  DB CONNECTION	 **** */
/* ************************** */
mongoose
	.connect(uri)
	.then(() => console.log("MongoDB connection established!"))
	.catch((error) => console.log("MongoDB connection failed,", error.message));
//TODO THE ROOMCODE SHOWS UP WHEN I PRESS CTRL+S ON THE SERVER WTF
//MAKE SURE THE SOCKET HANDLING IS GLOBAL ON CLIENT SIDE
//LOOK IN TO CHAT APP CHATCONTEXT FILE FOR GUIDANCE
// you can use express-session to automatically create a persistent session for each new user and you can even store data in that session object that will be available on each page the user requests.

//TODO IF THE LEADER DISCONNECTS ASSIGN A NEW ONE TO THE ROOM STILL NOT DONE
//IF GAME ROOM RELOADS A PLAYER GETS DISCONNECTED

//TODO REFACTOR THE ONLINEUSERS ARRAY INTO A MAP FOR BETTER PERFORMANCE IF THE GAME GROWS PORT
//MIGHT NEED TO REWRITE THE WHOLE INDEX.JS SERVER CODE
