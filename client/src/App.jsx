import {useContext, useEffect} from "react";
import {Routes, Route, Navigate} from "react-router-dom";
import FeedBack from "./pages/FeedBack";
import LandingPage from "./pages/LandingPage";
import GameRoom from "./pages/GameRoom";
import GameSettings from "./pages/GameSettings";
import GameWaitingArea from "./pages/GameWaitingArea";
import Tutorial from "./pages/Tutorial";
import {PlayerContext, PlayerContextProvider} from "./contexts/PlayerContext";
import {SocketContext, SocketContextProvider} from "./contexts/SocketContext.jsx";
import {io} from "socket.io-client";
import GameBoardGrid from "./components/gameRoomComponents/GameBoardGrid/GameBoardGrid.jsx";




//remove accuse option after a player was preordered and didn't play their turn, meaning we can't accuse that player
//remove accuse button if a  player was skipped , meaning we can't accuse that player
//after a preorded was done we should wait for the player to play their turn before we check if the accuser who preordered was right or wrong.
const App = () => {
	const {player} = useContext(PlayerContext);
	const {socket, setSocket, roomCode, setRoomCode} = useContext(SocketContext);

	useEffect(() => {
		//problem in local backend logic works on prod backe,d nicely
		const backendUrl = import.meta.env.VITE_PROD_BACKEND_URL;
		//const backendUrl = import.meta.env.VITE_DEV_BACKEND_URL;
		// console.log(backendUrl);
		const newSocket = io(backendUrl, {autoConnect: false});
		setSocket(newSocket);
		return () => newSocket.close(); // Clean up the socket connection on component unmount
	}, [setSocket]);

	//TODO SOME OF THESE ROUTES NEED TO BE CHECKED FIRST FOR PLAYER , SOCKET OR ROOMCODE EXISTENCE TO AVOID UNAUTHORIZED ACCESS
	// Conditionally render routes based on socket initialization
	if (!socket) {
		return (
			<div className="lobby-shell">
				<div className="brand-mark" aria-hidden="true">
					<span className="brand-suit red">♥</span>
					<span className="brand-suit">♠</span>
					<span className="brand-suit red">♦</span>
				</div>
				<p className="muted">Shuffling the deck…</p>
			</div>
		);
	}
	return (
		<Routes>
			{/* return to this */}
			<Route path="/" element={<LandingPage />} />
			{/* <Route path="/" element={<GameBoardGrid />} /> */}
			<Route path="/wa/" element={player.name.length > 2 && player.avatar.length > 1 ? <GameWaitingArea /> : <Navigate to="/" />} />
			<Route path="/play/*" element={roomCode ? <GameRoom /> : <Navigate to="/" />} />
			<Route path="/settings" element={<GameSettings />} />
			<Route path="/feedback" element={<FeedBack />} />
			<Route path="/tutorial" element={<Tutorial />} />
			<Route path="/*" element={<Navigate to="/" />} />
		</Routes>
	);
};

export default App;
