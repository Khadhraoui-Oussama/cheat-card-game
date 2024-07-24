import { useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { PlayerContext } from "../contexts/PlayerContext";
import LeftRightGame from "../components/LeftRightGame";
import "../index.css";
import { SocketContext } from "../contexts/SocketContext";
const GameRoom = () => {
	// const { socket, setSocket, onlineUsers, setOnlineUsers } = useContext(SocketContext);
	// const { player, setPlayer, selectedAvatarPath, setSelectedAvatarPath } =
	// 	useContext(PlayerContext);
	// const [playerForState, setPlayerForState] = useState(player);
	// //INTIALIZE SOCKET ONLY AND DISCONNECT IT WHEN THE GameRoom COMPONENET UNMOUNTS
	// useEffect(() => {
	// 	// url of render backend : https://card-game-zcy5.onrender.com
	// 	// io(url) connects to the socket io server at the url
	// 	const newSocket = io("http://localhost:5000"); // same port the socket.io server will listen to ,change if needed
	// 	setSocket(newSocket);

	// 	//TODO : the socket sould be in a ContextApi file

	// 	newSocket.on("connect", () => {
	// 		console.log("on connect", newSocket.id); // ojIckSD2jqNzOqIrAGzL
	// 		newSocket.emit("playerJoined");
	// 	});
	// 	return () => {
	// 		if (newSocket) {
	// 			console.log("socket disconnect : ", newSocket.id);
	// 			newSocket.disconnect();
	// 		}
	// 	};
	// }, []);

	// // Listen for socket events
	// useEffect(() => {
	// 	if (!socket) return;

	// 	const handleUserJoined = (user) => {
	// 		setOnlineUsers((prevUsers) => [...prevUsers, user]);
	// 	};

	// 	const handleUserLeft = (user) => {
	// 		setOnlineUsers((prevUsers) => prevUsers.filter((u) => u.id !== user.id));
	// 	};

	// 	socket.on("userJoined", handleUserJoined);
	// 	socket.on("userLeft", handleUserLeft);

	// 	return () => {
	// 		socket.off("userJoined", handleUserJoined);
	// 		socket.off("userLeft", handleUserLeft);
	// 	};
	// }, [socket]);
	// ///// ROOMS ADD THEM
	return (
		<>
			<h5>Welcome to the Game Room</h5>
		</>
	);
};

export default GameRoom;
