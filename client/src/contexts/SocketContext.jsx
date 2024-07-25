import { createContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

export const SocketContext = createContext();

export const SocketContextProvider = ({ children }) => {
	const [socket, setSocket] = useState(null);
	const [roomCode, setRoomCode] = useState();

	return (
		<SocketContext.Provider value={{ socket, setSocket, roomCode, setRoomCode }}>
			{children}
		</SocketContext.Provider>
	);
};
