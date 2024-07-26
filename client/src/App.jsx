import { useContext, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import FeedBack from "./pages/FeedBack";
import LandingPage from "./pages/LandingPage";
import GameRoom from "./pages/GameRoom";
import GameSettings from "./pages/GameSettings";
import GameWaitingArea from "./pages/GameWaitingArea";
import Tutorial from "./pages/Tutorial";
import { PlayerContext, PlayerContextProvider } from "./contexts/PlayerContext";
import { SocketContext, SocketContextProvider } from "./contexts/SocketContext.jsx";
import { io } from "socket.io-client";
const App = () => {
	const { player } = useContext(PlayerContext);
	const { socket, setSocket, roomCode } = useContext(SocketContext);

	useEffect(() => {
		const newSocket = io("https://card-game-zcy5.onrender.com", { autoConnect: false }); // http://localhost:5000
		setSocket(newSocket);
		return () => newSocket.close(); // Clean up the socket connection on component unmount
	}, [setSocket]);
	//TODO SOME OF THESE ROUTES NEED TO BE CHECKED FIRST FOR PLAYER , SOCKET OR ROOMCODE EXISTENCE TO AVOID UNAUTHORIZED ACCESS
	// Conditionally render routes based on socket initialization
	if (!socket) {
		return <div>Loading...</div>;
	}
	return (
		<Routes>
			<Route path="/" element={<LandingPage />} />
			<Route path="/wa/" element={<GameWaitingArea />} />
			<Route path="/play/*" element={roomCode ? <GameRoom /> : <Navigate to="/" />} />
			<Route path="/settings" element={<GameSettings />} />
			<Route path="/feedback" element={<FeedBack />} />
			<Route path="/tutorial" element={<Tutorial />} />
			<Route path="/*" element={<Navigate to="/" />} />
		</Routes>
	);
};

export default App;
