import dotenv from "dotenv";
import express from "express";
import { createServer } from "node:http";
import cors from "cors";
import mongoose from "mongoose";
import path from "node:path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";

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
//LETS TALK FOR A SECOND
/*
 I NEED TO STORE ONLINEUSERS IN A DICTIONNARY TYPE DATA DTRUCT WHERE THE KEY IS THE ROOMCODE AND THE VALUE IS AN ARRAY OF THE PLAYER OBJECTS THAT ARE IN THE ROOM
*/

io.on("connection", (socket) => {
	socket.on("joinRoom", (dataArray) => {
		/*	in data array 
			dataArray[0] = roomCode
			dataArray[1] = socket.id
			dataArray[2] = playerNewObj which only has { name: player.name, avatar: player.avatar } (ie no gender we dont need it anymore we only added it to make the avatarSelection easier)

		*/
		socket.join(dataArray[0]);
		console.log("Socket with ID :", dataArray[1], "has joined room :", dataArray[0]);
		const newPlayer = {
			socketID: dataArray[1],
			room: dataArray[0],
			name: dataArray[2].name,
			avatar: dataArray[2].avatar,
		};
		console.log("delete me later", dataArray[1]);
		if (!onlineUsers[dataArray[0]]) {
			onlineUsers[dataArray[0]] = []; // Initialize the room array if it doesn't exist
		}
		// Add the player to the room array
		onlineUsers[dataArray[0]].push(newPlayer);
		// Optionally, notify all users in the room of the updated user list
		io.to(dataArray[0]).emit("updateUserList", onlineUsers[dataArray[0]]);
		console.log("Players Connected rn :", onlineUsers);
	});

	socket.on("disconnect", (reason) => {
		console.log(`Socket with ID ${socket.id} has disconnected, reason: ${reason}`);

		// Track rooms that need an update
		const roomsToUpdate = [];

		// Iterate through each room in the onlineUsers object
		Object.keys(onlineUsers).forEach((roomCode) => {
			// Filter out the disconnected user from the room's player array
			const originalLength = onlineUsers[roomCode].length;
			onlineUsers[roomCode] = onlineUsers[roomCode].filter(
				(player) => player.socketID !== socket.id
			);

			// If the player was removed (length changed), mark this room for update
			if (onlineUsers[roomCode].length !== originalLength) {
				roomsToUpdate.push(roomCode);
			}

			// If the room is now empty, you can optionally remove it from the onlineUsers object
			if (onlineUsers[roomCode].length === 0) {
				delete onlineUsers[roomCode];
			}
		});

		// Emit the updated user list to the rooms that were affected
		roomsToUpdate.forEach((roomCode) => {
			io.to(roomCode).emit("updateUserList", onlineUsers[roomCode]);
		});

		console.log("Updated Online Users:", onlineUsers);
	});
});

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
/* ****	  DB CONNECTION	**** */
/* ************************** */
mongoose
	.connect(uri)
	.then(() => console.log("MongoDB connection established!"))
	.catch((error) => console.log("MongoDB connection failed,", error.message));
