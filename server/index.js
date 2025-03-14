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
import {Console} from "node:console";

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
	connectionStateRecovery: {},
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
const chatHistory = new Map(); // Store chat history for each room

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

			const currentPlayer = onlineUsers[roomCode]?.find((p) => p.socketID === currentPlayerSocket);
			if (currentPlayer) {
				// Signal client to return cards
				io.to(currentPlayerSocket).emit("turnTimedOut");

				// Find and give turn to next player, indicating no cards were played
				const nextPlayer = findNextTurn(currentPlayerSocket, roomCode);
				handleTurnChange(roomCode, nextPlayer.socketID, currentPlayer, false);

				io.to(roomCode).emit("updateGameEventMessage", `${currentPlayer.name}'s turn timed out without playing any cards!`);
			}
		}
	}, 1000);

	roomTimers.set(roomCode, {
		intervalId,
		playerSocket: currentPlayerSocket,
	});
};

// Modify handleTurnChange function to include a hasPlayedCards parameter
const handleTurnChange = (roomCode, nextPlayerSocket, currentPlayer, hasPlayedCards = true) => {
	// Update turn
	io.to(roomCode).emit("updateTurn", {
		currentPlayer: nextPlayerSocket,
		lastPlayedPlayer: hasPlayedCards ? currentPlayer?.socketID : null, // Only set lastPlayedPlayer if cards were played
		newTurnStatus: nextPlayerSocket === currentPlayer?.socketID ? false : true,
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
			preorderEnabled: dataArray[2].preorderEnabled,
		};
		console.log("delete me later", dataArray[1]);
		if (!onlineUsers[dataArray[0]]) {
			onlineUsers[dataArray[0]] = []; // Initialize the room array if it doesn't exist
		}
		// Add the player to the room array
		onlineUsers[dataArray[0]].push(newPlayer);

		// // Check and assign leader if needed
		const roomHasLeader = onlineUsers[dataArray[0]].some((player) => player.isLeader);

		if (!roomHasLeader) {
			assignNewLeader(dataArray[0]);
		}
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

		// Reset game state for the room
		pileOfCardsInEachRoom[roomCode] = [];
		lastMovePlayedInRoom[roomCode] = null;

		// Clear any existing timers
		if (roomTimers.has(roomCode)) {
			clearInterval(roomTimers.get(roomCode).intervalId);
			roomTimers.delete(roomCode);
		}

		// Create and shuffle the deck
		const deck = shuffleDeck(createDeck());

		// Deal 13 cards to each player and reset their game state
		let localPlayer;
		players.forEach((player, index) => {
			const playerCards = deck.slice(index * 13, (index + 1) * 13);

			// Update player object with fresh game state
			Object.assign(player, {
				cards: playerCards,
				preOrderInfo: {isPreordered: false, playerWhoPreordered: null},
				issuedPreorderDetails: {hasIssuedPreorder: false, playerIssuedAgainstID: null},
				score: 0,
				powerups: {0: 0, 1: 0, 2: 0},
				hasTurn: player.isLeader,
				isShielded: false,
			});

			// Store reference to leader
			if (player.socketID === socketID) {
				localPlayer = player;
			}

			// Send updated player state to EACH player individually
			io.to(player.socketID).emit("receiveCards", player);
			io.to(player.socketID).emit("updateLocalPlayer", player);
		});

		// Update global state
		onlineUsers[roomCode] = players;

		// Initialize turn for leader
		handleTurnChange(roomCode, localPlayer.socketID, null);

		// Broadcast game start to all players
		io.to(roomCode).emit("startGameR", roomCode);
		io.to(roomCode).emit("updateGameEventMessage", "New game started! Good luck!");
		io.to(roomCode).emit("updateUserList", players);
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
			console.log("\n******cardvalueTold : ", cardValueTold);
			currentPlayer.cards = currentPlayer.cards.filter((card) => !cardsPlayedArray.includes(card));

			if (!isNewTurn) {
				cardValueTold = lastMovePlayedInRoom[roomCode].cardValueTold;
			}

			if (isFinalCard) {
				const finalCard = cardsPlayedArray[0];
				const actualCardValue = finalCard.slice(0, -1);
				// const isJoker = finalCard === "1J" || finalCard === "2J";
				onlineUsers[roomCode]?.forEach((player) => {
					if (player.socketID === socketID) {
						player.cards = player.cards.filter((card) => !cardsPlayedArray.includes(card));
					}
				});
				// Send last card info to all clients
				io.to(roomCode).emit("lastCardPresented", {
					playerName: currentPlayer.name,
					card: finalCard,
					cardValueClaimed: cardValueTold,
					isFinalCard: true,
				});
				console.log("actualCardValue : ", actualCardValue, " cardValueTold : ", cardValueTold);
				//cardValueTold !== "1" && cardValueTold!=="2" is because when playing jokers :"1J" and "2J" as for other cards , it is normal

				// actualcardvalue is the card coming with the signal
				if (cardValueTold !== actualCardValue && actualCardValue !== "1" && actualCardValue !== "2") {
					// Player lied about their final card - they must take all cards
					console.log("I AM HERERERERERER LIEED");
					currentPlayer.cards = [...currentPlayer.cards, ...pileOfCardsInEachRoom[roomCode]];
					pileOfCardsInEachRoom[roomCode] = [];

					handleTurnChange(roomCode, socketID, currentPlayer);
					io.to(roomCode).emit("updateGameEventMessage", `${currentPlayer.name} lied about their final card and must take all cards from the pile then play again!`);

					io.to(currentPlayer.socketID).emit("updateLocalPlayer", currentPlayer);
					return;
				} else {
					const {winnerPlayerObject} = checkWinner(roomCode);
					if (winnerPlayerObject) {
						if (roomTimers.has(roomCode)) {
							clearInterval(roomTimers.get(roomCode).intervalId);
							roomTimers.delete(roomCode);
						}
						if (roomCode in pileOfCardsInEachRoom) {
							delete pileOfCardsInEachRoom[roomCode];
						}
						if (roomCode in lastMovePlayedInRoom) {
							delete lastMovePlayedInRoom[roomCode];
						}
						const playersData = {
							winner: {
								socketID: winnerPlayerObject.socketID,
								name: winnerPlayerObject.name,
								avatar: winnerPlayerObject.avatar,
								cardsLeft: 0,
								isWinner: true,
							},
							players: onlineUsers[roomCode].map((player) => ({
								socketID: player.socketID,
								name: player.name,
								avatar: player.avatar,
								cardsLeft: player.cards.length,
								isWinner: player.socketID === winnerPlayerObject.socketID,
							})),
						};
						io.to(roomCode).emit("gameOver", playersData);
						io.to(roomCode).emit("updateTimer", 0);
						io.to(roomCode).emit("updateGameEventMessage", `${currentPlayer.name} has won the game by playing their final card truthfully!`);
					}
					return;
				}
			}

			// Normal turn logic
			//	currentPlayer.cards = currentPlayer.cards.filter((card) => !cardsPlayedArray.includes(card));

			// Check if player is trying to play all cards except one
			if (currentPlayer.cards.length === 0) {
				io.to(currentPlayer.socketID).emit("updateGameEventMessage", `${currentPlayer.name} must keep at least one card in hand!`);
				return;
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
				if (roomTimers.has(roomCode)) {
					clearInterval(roomTimers.get(roomCode).intervalId);
					roomTimers.delete(roomCode);
				}
				if (pileOfCardsInEachRoom.has(roomCode)) {
					pileOfCardsInEachRoom.delete(roomCode);
				}
				if (lastMovePlayedInRoom.has(roomCode)) {
					lastMovePlayedInRoom.delete(roomCode);
				}
				console.log("Game Over, Winner:", winner);
				io.to(roomCode).emit("updateTimer", 0);
				io.to(roomCode).emit("gameOver", {winnerID: winnerPlayerObject.socketID, allUsers: onlineUsers[roomCode]});
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

			// After a successful move, the next turn should be a new turn
			const nextPlayer = findNextTurn(socketID, roomCode);
			handleTurnChange(roomCode, nextPlayer.socketID, currentPlayer);

			// Reset new turn status after move is completed
			io.to(roomCode).emit("updateNewTurnStatus", false);
		} catch (error) {
			console.log("Error in makeMove:", error);
		}
	});

	// Modify accuse handler
	socket.on("accuse", ({roomCode, socketID, accusedPlayerID}) => {
		try {
			const accuser = onlineUsers[roomCode]?.find((player) => player.socketID === socketID);
			const accused = onlineUsers[roomCode]?.find((player) => player.socketID === accusedPlayerID);

			if (!accuser || !accused) {
				console.error("Could not find accuser or accused player");
				return;
			}

			// Emit accusation started event to all players in room
			io.to(roomCode).emit("accusationStarted", {
				accuserId: socketID,
				accusedId: accusedPlayerID,
				accuserName: accuser.name,
				accusedName: accused.name,
			});

			// Get the last move played
			const {cardsPlayedArray, cardValueTold} = lastMovePlayedInRoom[roomCode] || {};

			// Process the accusation
			const accuserIsRight = cardsPlayedArray.some((card) => {
				const cardValue = card.slice(0, -1); // Extract the value part of the card
				return cardValue !== cardValueTold && card !== "1J" && card !== "2J";
			});

			if (accuserIsRight) {
				// Accused takes all cards
				accused.cards = [...accused.cards, ...pileOfCardsInEachRoom[roomCode]];
				pileOfCardsInEachRoom[roomCode] = [];
				//grant a powerup to the accuser
				//ONLY 3 POWERUPS FOR NOW
				const NUMBER_OF_POWERUPS = 3;
				const powerUpID = Math.floor(Math.random() * NUMBER_OF_POWERUPS);
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

			// After accusation is resolved (success or failure), emit resolution
			io.to(roomCode).emit("accusationResolved");
		} catch (error) {
			console.log("error in accuse:", error);
			// Make sure to resolve the accusation state even on error
			io.to(roomCode).emit("accusationResolved");
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
			const roomHasPreorderEnabled = playerToBePreordered.preorderEnabled;

			//in case the the frontend check gets bypassed
			if (!roomHasPreorderEnabled) {
				return;
			}
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

		// Notify remaining players in affected rooms
		roomsToUpdate.forEach((roomCode) => {
			if (onlineUsers[roomCode]?.length < 4) {
				// Stop any ongoing game timers
				if (roomTimers.has(roomCode)) {
					clearInterval(roomTimers.get(roomCode).intervalId);
					roomTimers.delete(roomCode);
				}
			}
			io.to(roomCode).emit("updateUserList", onlineUsers[roomCode]);
		});
	});

	// Inside io.on("connection") block
	socket.on("disconnect", () => {
		// Find which rooms this socket was in
		const affectedRooms = Object.keys(onlineUsers).filter((roomCode) => onlineUsers[roomCode].some((user) => user.socketID === socket.id));

		affectedRooms.forEach((roomCode) => {
			// Find the disconnected player before removing them
			const disconnectedPlayer = onlineUsers[roomCode].find((user) => user.socketID === socket.id);

			// Remove the disconnected player
			onlineUsers[roomCode] = onlineUsers[roomCode].filter((user) => user.socketID !== socket.id);

			// Notify remaining players
			if (onlineUsers[roomCode].length > 0) {
				io.to(roomCode).emit("playerDisconnected", {
					remainingPlayers: onlineUsers[roomCode],
					disconnectedPlayer: disconnectedPlayer,
				});
			}

			// Clean up room if empty
			if (onlineUsers[roomCode].length === 0) {
				delete onlineUsers[roomCode];
				delete pileOfCardsInEachRoom[roomCode];
				if (roomTimers.has(roomCode)) {
					clearInterval(roomTimers.get(roomCode).intervalId);
					roomTimers.delete(roomCode);
				}
			}
		});
	});

	// Add handler for manual quit
	socket.on("leaveRoom", (roomCode) => {
		const leavingPlayer = onlineUsers[roomCode]?.find((user) => user.socketID === socket.id);

		if (leavingPlayer && onlineUsers[roomCode]) {
			// Remove the leaving player
			onlineUsers[roomCode] = onlineUsers[roomCode].filter((user) => user.socketID !== socket.id);

			// Notify remaining players
			socket.leave(roomCode);
			io.to(roomCode).emit("playerDisconnected", {
				remainingPlayers: onlineUsers[roomCode],
				disconnectedPlayer: leavingPlayer,
			});
		}
	});

	socket.on("usePowerup", ({type, powerupId, roomCode, userId, targetId}) => {
		const player = onlineUsers[roomCode]?.find((p) => p.socketID === userId);
		const targetPlayer = onlineUsers[roomCode]?.find((p) => p.socketID === targetId);

		if (!player || player.powerups[powerupId] <= 0) {
			return;
		}

		// Reduce powerup count
		player.powerups[powerupId]--;

		// Notify client about powerup consumption
		io.to(userId).emit("powerupUsed", {type, powerupId});

		switch (type) {
			case "trueVision":
				if (targetPlayer) {
					// Send cards only to the player who used the powerup
					//don't send all cards , rather send a precentage of the cards
					const PERCENTAGE_OF_CARDS_TO_SEE = 0.3;
					const cardsToSend = Math.max(Math.floor(targetPlayer.cards.length * PERCENTAGE_OF_CARDS_TO_SEE), 1);
					io.to(userId).emit("revealCards", {
						cards: targetPlayer.cards.slice(0, cardsToSend),
						playerName: targetPlayer.name,
					});
					console.log("True Vision used on:", targetPlayer.name);
					// Notify room about powerup use
					io.to(roomCode).emit("updateGameEventMessage", `${player.name} used True Vision on ${targetPlayer.name}!`);
				}
				break;

			case "skipPlayer":
				const currentTurnPlayer = onlineUsers[roomCode].find((p) => p.hasTurn)?.socketID;
				if (targetPlayer && targetPlayer.socketID === currentTurnPlayer) {
					const nextPlayer = findNextTurn(targetId, roomCode);
					handleTurnChange(roomCode, nextPlayer.socketID, targetPlayer, false);

					// Decrement powerup count since it was used successfully
					player.powerups[3]--;
					io.to(roomCode).emit("updateGameEventMessage", `${player.name} skipped ${targetPlayer.name}'s turn!`);

					// Notify about powerup usage
					io.to(userId).emit("powerupUsed", {type: "skipPlayer", powerupId: 3});
				} else {
					// Send error message only to the player who tried to use the powerup
					io.to(userId).emit("updateGameEventMessage", `Can't skip ${targetPlayer.name}'s turn as they don't have the current turn!`);
				}
				break;

			case "cleanse":
				player.preOrderInfo = {isPreordered: false, playerWhoPreordered: null};
				io.to(userId).emit("updateLocalPlayer", player);
				io.to(roomCode).emit("updateGameEventMessage", `${player.name} cleansed all preorders!`);
				break;
		}

		// Update powerup state for user
		io.to(userId).emit("updateLocalPlayer", player);
	});

	// Server-side code
	socket.on("globalAccusation", ({roomCode, accusedPlayerID}) => {
		// Broadcast to all clients in the room that this player has been accused
		io.to(roomCode).emit("playerAccused", {
			accusedId: accusedPlayerID,
			accused: true,
		});
	});

	socket.on("sendMessage", ({roomCode, message, playerName}) => {
		const messageData = {
			playerName,
			message,
			timestamp: Date.now(),
		};

		// Store message in history
		if (!chatHistory.has(roomCode)) {
			chatHistory.set(roomCode, []);
		}
		chatHistory.get(roomCode).push(messageData);

		// Keep only last 50 messages
		if (chatHistory.get(roomCode).length > 50) {
			chatHistory.get(roomCode).shift();
		}

		// Broadcast to room
		io.to(roomCode).emit("chatMessage", messageData);
	});

	socket.on("getChatHistory", (roomCode) => {
		const history = chatHistory.get(roomCode) || [];
		socket.emit("chatHistory", history);
	});

	// Add system messages for game events
	const sendSystemMessage = (roomCode, message) => {
		const messageData = {
			message,
			isSystemMessage: true,
			timestamp: Date.now(),
		};
		if (!chatHistory.has(roomCode)) {
			chatHistory.set(roomCode, []);
		}
		chatHistory.get(roomCode).push(messageData);
		io.to(roomCode).emit("chatMessage", messageData);
	};

	socket.on("startGame", ({roomCode}) => {
		sendSystemMessage(roomCode, "Game has started!");
	});

	socket.on("makeMove", ({roomCode, socketID}) => {
		const player = onlineUsers[roomCode].find((u) => u.socketID === socketID);
		sendSystemMessage(roomCode, `${player.name} played their cards.`);
	});

	// Inside your io.on("connection") block

	socket.on("leaveRoom", (roomCode) => {
		socket.leave(roomCode);
		// Remove player from room's user list
		if (onlineUsers[roomCode]) {
			onlineUsers[roomCode] = onlineUsers[roomCode].filter((user) => user.socketID !== socket.id);

			// If room is empty, clean up room data
			if (onlineUsers[roomCode].length === 0) {
				delete onlineUsers[roomCode];
				delete pileOfCardsInEachRoom[roomCode];
				delete lastMovePlayedInRoom[roomCode];
				if (roomTimers.has(roomCode)) {
					clearInterval(roomTimers.get(roomCode).intervalId);
					roomTimers.delete(roomCode);
				}
			} else {
				// Notify remaining players
				io.to(roomCode).emit("updateUserList", onlineUsers[roomCode]);
			}
		}
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

TODO IMPLEMENT THE TIMER LOGIC WHEN STARTING A TURN AND STUFF DONE
TODO IMPLEMENT THE CHATBOX  DONE 
TODO IMLEMENT THE POWERUPS LOGIC , SHIELD TO PROTECT AGAINST AN ACCUSE ,MAKE A PLAYER SKIP THEIR TURN ,TRUE VISION TO SELECT A PLAYERS HAND TO SEE IT , CLEANSE REMOVES YOUR PREORDER FOR THE TURN
WHEN A PLAYER ACCUSES SOMEONE AND IS RIGHT ,  A DICE ROLLS AND THE ACCUSER GETS A RANDOM POWERUP DONE
*/

/*
TOMORROW : TODO : IMPLEMENT THE RECONNECTION LOGIC FOR THE SOCKETS
TODO : ADD SOUND EFFECTS TO THE GAME
TODO : IMPLEMENT SETTINGS ON THE CLIENT SIDE TO ALLOW THE PLAYER TO CHANGE THEME , SOUNDS , ETC 
TODO : IMPLEMENT CONTACT US FORM WITH MY EMAIL ADDRESS FOR FEEDBACK
TODO : IMPLEMENT HOW TO PLAY TUTORIAL
TODO : FINALLY FIX THE UI AND IMPROVE IT
*/
