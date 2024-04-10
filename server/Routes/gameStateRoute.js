import express from "express";
import {
	createGameState,
	getGameState,
	getAllGameStates,
} from "../Controllers/gameStateController.js";

const router = express.Router();

router.post("/create", createGameState);
router.get("/find/:socketRoomId", getGameState);
router.get("/getAll", getAllGameStates);

export default router;
