import { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import FeedBack from "./pages/FeedBack";
import LandingPage from "./pages/LandingPage";
import GameRoom from "./pages/GameRoom";
import GameSettings from "./pages/GameSettings";
import GameWaitingArea from "./pages/GameWaitingArea";
import Tutorial from "./pages/Tutorial";
import { PlayerContext, PlayerContextProvider } from "./contexts/PlayerContext";
import { SocketContextProvider } from "./contexts/SocketContext.jsx";
const App = () => {
	const { player } = useContext(PlayerContext);
	return (
		<SocketContextProvider>
			<Routes>
				<Route path="/" element={<LandingPage />} />
				<Route path="/wa/*" element={<GameWaitingArea />} />
				<Route path="/play" element={player ? <GameRoom /> : <Navigate to="/" />} />
				<Route path="/settings" element={<GameSettings />} />
				<Route path="/feedback" element={<FeedBack />} />
				<Route path="/tutorial" element={<Tutorial />} />
				<Route path="/*" element={<Navigate to="/" />} />
			</Routes>
		</SocketContextProvider>
	);
};

export default App;
