import {useContext, useEffect, useState} from "react";
import {SocketContext} from "../contexts/SocketContext";
import "../index.css";
import GameBoardGrid from "../components/gameRoomComponents/GameBoardGrid/GameBoardGrid";

const GameRoom = () => {
	const {socket, roomCode} = useContext(SocketContext);
	const [style, setStyle] = useState({
		maxWidth: "100px",
		minHeight: "100px",
		backgroundColor: "red",
		//display: "inline-block",
		cursor: "pointer",
	});

	// useEffect(() => {
	// 	if (!socket.connected) {
	// 		socket.connect();
	// 	}

	// 	// socket.emit("getUsersInRoom", roomCode);
	// 	// socket.on("getUsersInRoomR", (usersArray) => {
	// 	// 	setUsersInRoom(usersArray);
	// 	// 	console.log("users in the room array: ", usersArray);
	// 	// });

	// 	// socket.on("updateUserList", (usersArray) => {
	// 	// 	setUsersInRoom(usersArray);
	// 	// });

	// 	// return () => {
	// 	// 	socket.off("getUsersInRoomR");
	// 	// 	socket.off("updateUserList");
	// 	// };
	// }, [socket]);

	return (
		<>
			<GameBoardGrid />
		</>
	);
};

export default GameRoom;
//TODO I NEED TO TALK ENGINEERING : HOW THE GAME LOGIC WILL BE IMPLEMEBTED IE CARDS DISTRUBITED AND STUFF , SERVER SIDE IS BETTER AND SEND EACH PLAYER THEIR CARDS , BUT HOW WILL WE ENSURE CONFIDENTIALITY , ENCRYPT IS IT NECESSARY --> PEN AND PAPER FTW
