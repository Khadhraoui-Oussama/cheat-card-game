import { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import FeedBack from "./pages/FeedBack";
import GameLobby from "./pages/GameLobby";
import GameRoom from "./pages/GameRoom";
import GameSettings from "./pages/GameSettings";
import GameWaitingArea from "./pages/GameWaitingArea";
import Tutorial from "./pages/Tutorial";
import { PlayerContext, PlayerContextProvider } from "./contexts/PlayerContext";

const App = () => {
	const { player } = useContext(PlayerContext);
	return (
		<Routes>
			<Route path="/" element={<GameLobby />} />
			<Route path="/wa" element={<GameWaitingArea />} />
			<Route path="/play" element={player ? <GameRoom /> : <Navigate to="/" />} />
			<Route path="/settings" element={<GameSettings />} />
			<Route path="/feedback" element={<FeedBack />} />
			<Route path="/tutorial" element={<Tutorial />} />
			<Route path="/*" element={<Navigate to="/" />} />
		</Routes>
	);
};

export default App;
