import { createContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

export const SocketContext = createContext();

export const SocketContextProvider = ({ children }) => {
	const [socket, setSocket] = useState(null);
	const [onlineUsers, setOnlineUsers] = useState([]);
	const [roomCode, setRoomCode] = useState();

	// //INTIALIZE SOCKET ONLY AND DISCONNECT IT WHEN THE GameWaitingArea COMPONENET UNMOUNTS
	// useEffect(() => {
	// 	// url of render backend : https://card-game-zcy5.onrender.com
	// 	// io(url) connects to the socket io server at the url
	// 	const newSocket = io("http://localhost:5000"); // same port the socket.io server will listen to ,change if needed
	// 	setSocket(newSocket);
	// 	//setPlayer({ ...player, playerSocket: newSocket });
	// 	newSocket.on("connect", () => {
	// 		console.log("Socket connected", newSocket.id); //
	// 	});
	// 	return () => {
	// 		if (newSocket) {
	// 			console.log("Socket disconnected : ", newSocket.id);
	// 			newSocket.disconnect();
	// 		}
	// 	};
	// }, []);

	// // Emit joinRoom event when roomCode is set
	// useEffect(() => {
	// 	if (!roomCode) {
	// 		const a = socket?.id?.substring(0, 7);
	// 		setRoomCode(a);
	// 		console.log("ROOMCODE", a);
	// 	}
	// 	if (socket) {
	// 		socket.emit("joinRoom", { roomCode });
	// 	} else console.log("dummy");
	// }, [socket, roomCode]);

	//TODO IF THE USER INPUTS A ROOM CODE THEN WE USE THAT (THE ROOM ALREADY EXISTS BUT CHECK FOR IT AND THEN CONNECT HIM),ELSE (THE USER IS CREATING A ROOM) THEN HAVE THE SERVER GENERATE A ROOM CODE AND JOIN THAT INSTEAD
	return (
		<SocketContext.Provider value={{ socket, setSocket, roomCode, setRoomCode }}>
			{children}
		</SocketContext.Provider>
	);
};
