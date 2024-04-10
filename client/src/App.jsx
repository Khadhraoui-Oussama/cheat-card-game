import { Routes, Route, Navigate } from "react-router-dom";
import FeedBack from "./pages/FeedBack";
import GameLobby from "./pages/GameLobby";
import GameRoom from "./pages/GameRoom";
import GameSettings from "./pages/GameSettings";
import GameWaitingArea from "./pages/GameWaitingArea";
import Tutorial from "./pages/Tutorial";
import { PlayerContextProvider } from "./contexts/PlayerContext";
import { GameContextProvider } from "./contexts/GameContext";

function App() {
	return (
		<PlayerContextProvider>
			<GameContextProvider>
				<Routes>
					<Route path="/" element={<GameLobby />} />
					<Route path="/wa" element={<GameWaitingArea />} />
					<Route path="/play" element={<GameRoom />} />
					<Route path="/settings" element={<GameSettings />} />
					<Route path="/feedback" element={<FeedBack />} />
					<Route path="/tutorial" element={<Tutorial />} />
					<Route path="/*" element={<Navigate to="/" />} />
				</Routes>
			</GameContextProvider>
		</PlayerContextProvider>
	);
}

export default App;
