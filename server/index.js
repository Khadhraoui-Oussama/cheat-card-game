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
let pileOfCardsInEachRoom = {};
let disconnectedPlayers = {};
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
	deck.push("1J", "2J"); // Add the jokers
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

/**
 *
 *
 */
const findNextTurn = (socketID, roomCode) => {
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

// Add at the top with other global variables
const TURN_DURATION = 30; // Duration of each turn in seconds
const roomTimers = new Map(); // Store timer intervals for each room

// Add this function near other helper functions
const startRoomTimer = (roomCode, currentPlayerSocket) => {
	// Clear any existing timer for this room
	if (roomTimers.has(roomCode)) {
		clearInterval(roomTimers.get(roomCode).intervalId);
	}

	let timeLeft = TURN_DURATION;

	// Initialize timer for all clients
	io.to(roomCode).emit("updateTimer", timeLeft);

	const intervalId = setInterval(() => {
		timeLeft--;

		// Send updated time to all clients in room
		io.to(roomCode).emit("updateTimer", timeLeft);

		// When timer reaches 0
		if (timeLeft === 0) {
			clearInterval(intervalId);
			roomTimers.delete(roomCode);

			// Force turn end
			const currentPlayer = onlineUsers[roomCode]?.find((p) => p.socketID === currentPlayerSocket);
			if (currentPlayer) {
				// Signal client to return cards
				io.to(currentPlayerSocket).emit("turnTimedOut");

				// Find and give turn to next player
				const nextPlayer = findNextTurn(currentPlayerSocket, roomCode);
				handleTurnChange(roomCode, nextPlayer.socketID, currentPlayer);
			}
		}
	}, 1000);

	roomTimers.set(roomCode, {
		intervalId,
		playerSocket: currentPlayerSocket,
	});
};

// Modify handleTurnChange function
const handleTurnChange = (roomCode, nextPlayerSocket, currentPlayer) => {
	// Update turn
	io.to(roomCode).emit("updateTurn", {
		currentPlayer: nextPlayerSocket,
		lastPlayedPlayer: currentPlayer?.socketID,
		newTurnStatus: true,
	});

	// Start new timer for next player
	startRoomTimer(roomCode, nextPlayerSocket);
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

		// Initialize the pile for this room
		pileOfCardsInEachRoom[roomCode] = [];

		// Deal 13 cards to each player and update their player object
		let localPlayer;
		players.forEach((player, index) => {
			const playerCards = deck.slice(index * 13, (index + 1) * 13);
			player.cards = playerCards; // Add the cards to the player object
			player.preOrderInfo = {isPreordered: false, playerWhoPreordered: null}; // Set the player's preordered status to false
			player.issuedPreorderDetails = {hasIssuedPreorder: false, playerIssuedAgainstID: null}; // Set the player's issuedPreorder status to false
			player.score = 0; // Set the player's score to 0
			//powerups ids : shield : 0, trueVision : 1, cleanse : 2, skipAnothersTurn : 3
			player.powerups = {0: 0, 1: 0, 2: 0, 3: 0}; // Set the player's powerups to 0
			if (player.isLeader) {
				player.hasTurn = true;
			} else {
				player.hasTurn = false; // Set the player's turn to false
			}

			// Send cards privately to each player
			io.to(player.socketID).emit("receiveCards", player);
		});

		//SEARCH FOR THE LEADER IE THE PERSON WHO INITIATED THE STARTGAME SIGNAL
		//IN ORDER TO GIVE HIM TURN
		players.forEach((player) => {
			if (player.socketID === socketID) {
				localPlayer = player;
			}
			//io.to(player.socketID).emit("updateLocalPlayer", localPlayer);
		});
		//GIVE TURN TO THE GAME ROOM LEADER
		handleTurnChange(roomCode, localPlayer.socketID, null);
		io.to(roomCode).emit("startGameR", roomCode);

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

	// Modify makeMove handler where turn changes occur
	socket.on("makeMove", ({roomCode, socketID, cardsPlayedArray, cardValueTold, isNewTurn, isFinalCard}) => {
		try {
			// Find the current player
			const currentPlayer = onlineUsers[roomCode]?.find((player) => player.socketID === socketID);

			if (isFinalCard) {
				// Check if the final card matches the claimed value
				const finalCard = cardsPlayedArray[0];
				const actualCardValue = finalCard.slice(0, -1); // Remove suit
				const isJoker = finalCard === "1J" || finalCard === "2J";

				if (actualCardValue !== cardValueTold && !isJoker) {
					// Player lied about their final card - they must take all cards
					currentPlayer.cards = [...currentPlayer.cards, ...pileOfCardsInEachRoom[roomCode]];
					pileOfCardsInEachRoom[roomCode] = [];

					handleTurnChange(roomCode, socketID, currentPlayer);
					io.to(roomCode).emit("updateGameEventMessage", `${currentPlayer.name} lied about their final card and must take all cards from the pile, then play again!`);

					io.to(currentPlayer.socketID).emit("updateLocalPlayer", currentPlayer);
				} else {
					// Player won!
					io.to(roomCode).emit("gameOver", currentPlayer);
					io.to(roomCode).emit("updateGameEventMessage", `${currentPlayer.name} has won the game by playing their final card truthfully!`);
				}
				return;
			}

			// Normal turn logic
			currentPlayer.cards = currentPlayer.cards.filter((card) => !cardsPlayedArray.includes(card));

			// Check if player is trying to play all cards except one
			if (currentPlayer.cards.length === 0) {
				io.to(currentPlayer.socketID).emit("updateGameEventMessage", `${currentPlayer.name} must keep at least one card in hand!`);
				return;
			}

			// ... rest of your existing makeMove logic ...
			if (!isNewTurn) {
				cardValueTold = lastMovePlayedInRoom[roomCode].cardValueTold;
			}
			console.log("makeMove signal received from client with roomCode:", roomCode, " with cardsPlayedArray : ", cardsPlayedArray, " cardValueTold : ", cardValueTold);
			onlineUsers[roomCode]?.forEach((player) => {
				//remove the cards played from the player's hand
				//todo check for preorder action before removing the cards entirely NO PLAY TURN THEN PREORDER ACTION WILL GET EXECUTED

				//remove the cards in cardsPlayedArray from the player cards value
				if (player.socketID === socketID) {
					player.cards = player.cards.filter((card) => !cardsPlayedArray.includes(card));
					console.log("player cards after removing the played cards : ", player.cards);
				}
			});
			//update last move played in room
			lastMovePlayedInRoom[roomCode] = {cardsPlayedArray, cardValueTold};

			// Initialize the pile if it doesn't exist
			if (!pileOfCardsInEachRoom[roomCode]) {
				pileOfCardsInEachRoom[roomCode] = [];
			}

			pileOfCardsInEachRoom[roomCode] = [...pileOfCardsInEachRoom[roomCode], ...cardsPlayedArray];
			// Check for winners
			const {winnerBOOL, winnerPlayerObject} = checkWinner(roomCode);
			// If there is a winner, send the winner to the client
			if (winnerBOOL) {
				io.to(roomCode).emit("gameOver", winnerPlayerObject);
				io.to(roomCode).emit("updateGameEventMessage", `GAME OVER , ${winnerPlayerObject.name} WON THE GAME`);
			} else {
				//NEED TO CHECK IF ANY PLAYER HAS PREORDERED THE PLAYER WHO IS PLAYING THEIR TURN
				//IF YES THEN THE PLAYER WHO PREORDERED CAN ACCUSE THE PLAYER WHO IS PLAYING THEIR TURN
				//you are about to makeMove , after you make your move, if you are preodered,
				//the player who preordered you will see the cards you last played : cardsPlayedArray , if they are wrong , you get turn and can choose newTurnCard & they take cardPlayedArray, if they are right , they get turn and can choose newTurnCard & you take cardPlayedArray
				onlineUsers[roomCode]?.forEach((player) => {
					if (player.socketID === socketID) {
						if (player.preOrderInfo.isPreordered) {
							const accuserFromPreorderSocketID = player.preOrderInfo.playerWhoPreordered;
							io.to(accuserFromPreorderSocketID).emit("accusePlayer", {roomCode: roomCode, socketID: accuserFromPreorderSocketID, accusedPlayerID: player.socketID});
						}
					}
				});

				// Before updating turn, store the last player who made a move
				const lastPlayedPlayer = socketID;
				const nextPlayer = findNextTurn(socketID, roomCode);

				handleTurnChange(roomCode, nextPlayer.socketID, currentPlayer);

				io.to(roomCode).emit("updateGameEventMessage", `${onlineUsers[roomCode]?.find((player) => player.socketID === socketID).name} has played their turn : ${cardsPlayedArray.length} ${cardsPlayedArray.length == 1 ? "card" : "cards"} of value : ${cardValueTold}`);
			}
		} catch (error) {
			console.log("Error in makeMove:", error, " \n");
		}
	});

	// Modify accuse handler
	socket.on("accuse", ({roomCode, socketID, accusedPlayerID}) => {
		try {
			if (!roomCode || !socketID || !accusedPlayerID) {
				console.error("Missing required parameters for accusation:", {roomCode, socketID, accusedPlayerID});
				return;
			}

			console.log("Received accuse signal:", {roomCode, accuser: socketID, accused: accusedPlayerID});

			const accuser = onlineUsers[roomCode]?.find((player) => player.socketID === socketID);
			const accused = onlineUsers[roomCode]?.find((player) => player.socketID === accusedPlayerID);

			if (!accuser || !accused) {
				console.error("Could not find accuser or accused player");
				return;
			}

			const {cardsPlayedArray, cardValueTold} = lastMovePlayedInRoom[roomCode] || {};
			if (!cardsPlayedArray) {
				console.error("No cards were played in this TURN");
				io.to(socketID).emit("updateGameEventMessage", "No cards were played in this TURN");
				return;
			}

			const accuserIsRight = cardsPlayedArray.some((card) => {
				const cardValue = card.slice(0, -1); // Extract the value part of the card
				return cardValue !== cardValueTold && card !== "1J" && card !== "2J";
			});

			if (accuserIsRight) {
				// Accused takes all cards
				accused.cards = [...accused.cards, ...pileOfCardsInEachRoom[roomCode]];
				pileOfCardsInEachRoom[roomCode] = [];
				//grant a powerup to the accuser
				const powerUpID = Math.floor(Math.random() * 4);
				accuser.powerups[powerUpID] += 1;
				onlineUsers[roomCode]?.forEach((player) => {
					if (player.socketID === accuser.socketID) player = accuser;
				});
				io.to(roomCode).emit("playPowerupDice", {accuserID: socketID, accuserName: accuser.name, powerUpID: powerUpID});
				handleTurnChange(roomCode, socketID, accused);
				io.to(roomCode).emit("updateGameEventMessage", `Accuser ${accuser.name} was right, ${accused.name} takes all cards , and ${accuser.name} has TURN`);
			} else {
				// Accuser takes all cards
				accuser.cards = [...accuser.cards, ...pileOfCardsInEachRoom[roomCode]];
				pileOfCardsInEachRoom[roomCode] = [];
				// Give turn to accused
				handleTurnChange(roomCode, accusedPlayerID, accuser);
				onlineUsers[roomCode]?.forEach((player) => {
					if (player.socketID === accused.socketID) player = accused;
				});
				io.to(accuser.socketID).emit("updateLocalPlayer", accuser);
				io.to(roomCode).emit("updateGameEventMessage", `Accuser ${accuser.name} was wrong, ${accuser.name} takes all cards , and ${accused.name} has TURN`);
			}

			io.to(roomCode).emit("updateNewTurnStatus", true);
			//empty all preorders in the room , all preOrderInfo and issuedPreorderDetails
			//might need to refacotr the meptying of other preorders on top
			onlineUsers[roomCode].forEach((player) => {
				player.preOrderInfo = {isPreordered: false, playerWhoPreordered: null};
				player.issuedPreorderDetails = {hasIssuedPreorder: false, playerIssuedAgainstID: null};
				io.to(player.socketID).emit("updateLocalPlayer", player);
			});
		} catch (error) {
			console.log("error in accuse : ", error, " \n");
		}
	});
	socket.on("preorder", async ({roomCode, socketID, accusedPlayerID}) => {
		// roomCode,
		// 		socketID: localPlayerID,
		// 		accusedPlayerID: actualPlayerID,
		try {
			if (!roomCode || !socketID || !accusedPlayerID) {
				console.error("Missing required parameters for accusation:", {roomCode, socketID, accusedPlayerID});
				return;
			}
			const playerToBePreordered = onlineUsers[roomCode]?.find((player) => player.socketID === accusedPlayerID);
			const playerWhoPreordered = onlineUsers[roomCode]?.find((player) => player.socketID === socketID);
			if (playerToBePreordered.preOrderInfo.isPreordered) {
				const aux = onlineUsers[roomCode]?.find((p) => p.socketID === playerToBePreordered.preOrderInfo.playerWhoPreordered);
				console.log(`player ${playerToBePreordered.socketID} is already preordered by ${aux.name} in room : ${roomCode}`);
				io.to(playerWhoPreordered.socketID).emit("updateGameEventMessage", `Player ${playerToBePreordered.name} is already preordered by ${aux.name} `);
				return;
			} else {
				if (playerWhoPreordered.issuedPreorderDetails.hasIssuedPreorder) {
					const playerIssuedAgainst = onlineUsers[roomCode]?.find((p) => p.socketID === playerWhoPreordered.issuedPreorderDetails.playerIssuedAgainstID);
					console.log(`player ${playerWhoPreordered.socketID}  has already preordered ${playerIssuedAgainst.socketID} in room : ${roomCode}`);
					io.to(playerWhoPreordered.socketID).emit("updateGameEventMessage", `Player  ${playerIssuedAgainst.name} has already issued a preorder on : ${playerToBePreordered.name}`);
					return;
				}
				playerToBePreordered.preOrderInfo = {isPreordered: true, playerWhoPreordered: playerWhoPreordered.socketID};
				playerWhoPreordered.issuedPreorderDetails = {hasIssuedPreorder: true, playerIssuedAgainstID: accusedPlayerID};
				io.to(playerWhoPreordered.socketID).emit("updateLocalPlayer", playerWhoPreordered);
				io.to(playerToBePreordered.socketID).emit("updateLocalPlayer", playerToBePreordered);
				io.to(roomCode).emit("updateGameEventMessage", `${playerToBePreordered.name} has been preordered by ${playerWhoPreordered.name}`);
				console.log(`${playerToBePreordered.name} has been preordered by ${playerWhoPreordered.name} in room ${roomCode}`);
			}
		} catch (error) {
			console.log("error in preorder : ", error, " \n");
		}
	});
	/* END GAME LOGIC */

	// Add reconnection handler
	socket.on("attemptReconnect", ({roomCode, previousSocketId}) => {
		try {
			console.log("Attempting reconnection for:", previousSocketId, "to room:", roomCode);

			// Check if the room exists
			if (!onlineUsers[roomCode]) {
				socket.emit("reconnectionFailed", "Room no longer exists");
				return;
			}

			// Find the disconnected player data
			const disconnectedPlayer = disconnectedPlayers[previousSocketId];
			if (!disconnectedPlayer) {
				socket.emit("reconnectionFailed", "Session expired");
				return;
			}

			// Update the player's socket ID
			const playerIndex = onlineUsers[roomCode].findIndex((player) => player.socketID === previousSocketId);

			if (playerIndex !== -1) {
				// Update the socket ID
				onlineUsers[roomCode][playerIndex].socketID = socket.id;
				const updatedPlayer = onlineUsers[roomCode][playerIndex];

				// Join the room
				socket.join(roomCode);

				// Send the reconnected player their data
				socket.emit("reconnectionSuccessful", updatedPlayer);

				// Update all clients in the room
				io.to(roomCode).emit("updateUserList", onlineUsers[roomCode]);

				// Clean up
				delete disconnectedPlayers[previousSocketId];
			}
		} catch (error) {
			console.error("Reconnection error:", error);
			socket.emit("reconnectionFailed", "Internal server error");
		}
	});

	// Modify the disconnect handler
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
				delete pileOfCardsInEachRoom[roomCode];
			}

			if (disconnectedPlayer) {
				// Store the disconnected player's data temporarily
				disconnectedPlayers[socket.id] = {
					...disconnectedPlayer,
					timestamp: Date.now(),
				};

				// Clean up old disconnected players after 30 minutes
				setTimeout(() => {
					delete disconnectedPlayers[socket.id];
				}, 30 * 60 * 1000);
			}
		});

		// Emit the updated user list to the rooms that were affected
		roomsToUpdate.forEach((roomCode) => {
			io.to(roomCode).emit("updateUserList", onlineUsers[roomCode]);
		});

		console.log("Updated Online Users:", onlineUsers);

		// Add cleanup when game ends or room is destroyed
		Object.keys(onlineUsers).forEach((roomCode) => {
			if (roomTimers.has(roomCode)) {
				clearInterval(roomTimers.get(roomCode).intervalId);
				roomTimers.delete(roomCode);
			}
		});
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

/*

TOMORROW
MAKE SURE THAT A PLAYER CANNOT PLAY ALL HIS HAND IN ONE GO AND WIN AUTO
A PLAYER CAN PLAY ALL HIS CARDS EXCEPT HE HAS TO KEEP ONE IN HAND TO NOT WIN AUTO
AND ONLY WHEN HE HAS ONLY ONE CARD LEFT THEN HE CAN PLAY IT FACE UP AND WIN ,
IF HE PLAYS THE LAST CARD FACE UP AND IT IS NOT THE SAME AS THE CARD VALUE TOLD THEN HE HAS TO TAKE THE WHOLE PILE OF CARDS TO HIS HAND ELSE HE WINS
DONE EXCEPT FOR THE LAST CARD BEING FACE UP

TODO IMPLEMENT THE TIMER LOGIC WHEN STARTING A TURN AND STUFF
TODO IMPLEMENT THE CHATBOX 
TODO IMLEMENT THE POWERUPS LOGIC , SHIELD TO PROTECT AGAINST AN ACCUSE ,MAKE A PLAYER SKIP THEIR TURN ,TRUE VISION TO SELECT A PLAYERS HAND TO SEE IT , CLEANSE REMOVES YOUR PREORDER FOR THE TURN
WHEN A PLAYER ACCUSES SOMEONE AND IS RIGHT ,  A DICE ROLLS AND THE ACCUSER GETS A RANDOM POWERUP
*/
