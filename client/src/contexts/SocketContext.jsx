import {createContext, useState} from "react";
import {getPlayerId, loadSession} from "../utils/session";

export const SocketContext = createContext();

export const SocketContextProvider = ({children}) => {
	const [socket, setSocket] = useState(null);
	// Restored from sessionStorage so a refresh inside /play/<code> can still
	// find its way back to the table instead of bouncing to the landing page.
	const [roomCode, setRoomCode] = useState(() => loadSession()?.roomCode);
	const playerId = getPlayerId();

	return <SocketContext.Provider value={{socket, setSocket, roomCode, setRoomCode, playerId}}>{children}</SocketContext.Provider>;
};
