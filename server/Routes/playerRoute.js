import express from "express";
import {
	registerPlayer,
	findPlayer,
	getAllPlayersInRoom,
	getUsers,
} from "../Controllers/playerController.js";

const router = new express.Router();

router.post("/register", registerPlayer);
router.get("/getAllInRoom/:roomId", getAllPlayersInRoom);
router.get("/findPlayer/:playerId", findPlayer);
router.get("/", getUsers);

export default router;
