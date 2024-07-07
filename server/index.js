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

const app = express();
const server = createServer(app);
const io = new Server(server, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"],
	},
});
app.use(express.json());

// const allowedOrigins = ["https://superb-kulfi-fa8c06.netlify.app/", "*"];

// const corsOptions = {
// 	origin: function (origin, callback) {
// 		if (allowedOrigins.includes(origin)) {
// 			callback(null, true);
// 		} else {
// 			callback(new Error("Not allowed by CORS"));
// 		}
// 	},
// };

// app.use(cors(corsOptions));

// Equivalent of __dirname in ES module scope

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "public")));

const port = process.env.PORT || 5000;
const uri = process.env.ATLAS_URI;

app.get("/", (req, res) => {
	res.send("You have reached the card game API...");
});
let onlineUsers = [];
io.on("connection", (socket) => {
	console.log("a user connected", socket.id);

	socket.on("addNewUser", (player) => {
		if (
			player.name &&
			player.avatar &&
			!onlineUsers.some((user) => user.name === player.name)
		) {
			onlineUsers.push(player);
		}
		console.log("User joined : onlineUsers", onlineUsers);
		io.emit("getOnlineUsers", onlineUsers);
	});

	socket.on("removeUser", (player) => {
		const index = onlineUsers.findIndex((user) => user.name === player.name);
		if (index !== -1) {
			onlineUsers.splice(index, 1);
		}
		io.emit("getOnlineUsers", onlineUsers);
		console.log("User left : onlineUsers", onlineUsers);
	});
	let players = [];
	let turn = 0;
	socket.on("joinGame", (player) => {
		players.push({ ...player, isTurn: players.length === 0 }); // First player starts
		socket.emit("startGame", { firstTurn: turn });
		io.emit("playerJoined", players);
	});

	socket.on("boxClicked", ({ box, player }) => {
		io.emit("boxClicked", { box, player });
		const winner = determineWinner(player, box);
		if (winner) {
			io.emit("gameWinner", winner);
			players = []; // Reset players for new game
		} else {
			nextTurn();
			io.emit("nextTurn", { turn: players[turn].id });
		}
	});

	socket.on("changeColor", () => {
		io.emit("changeColor");
	});

	socket.on("disconnect", () => {
		console.log(`User disconnected: ${socket.id}`);
		onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
		io.emit("getOnlineUsers", onlineUsers);
		console.log("User left: onlineUsers", onlineUsers);
	});

	function nextTurn() {
		turn = (turn + 1) % players.length;
	}

	function determineWinner(player, box) {
		// Find the opponent's index
		const opponentIndex = players.findIndex((p) => p.id !== player.id);

		// Check if the opponent guessed correctly
		if (opponentIndex !== -1 && players[opponentIndex].guess === box) {
			return players[opponentIndex]; // Opponent wins
		} else {
			return null; // No winner yet
		}
	}
});

io.listen(port, () => {
	console.log(`Server running on port ${port}`);
});

app.use("/api/players", playerRouter);
app.use("/api/gameState", gameStateRouter);
app.use("/api/gameRoom", gameRoomRouter);
app.use("/api/gameConfig", gameConfigurationRouter);

mongoose
	.connect(uri)
	.then(() => console.log("MongoDB connection established!"))
	.catch((error) => console.log("MongoDB connection failed,", error.message));
