import "../index.css";
import {useContext, useEffect, useRef, useState} from "react";
import {PlayerContext} from "../contexts/PlayerContext";
import {Alert, Button} from "react-bootstrap";
import {useNavigate} from "react-router-dom";
import GameOptionsSelect from "../components/GameOptionsSelect";
import PlayerInfoSelect from "../components/PlayerInfoSelect";
import JoinGameRoomSection from "../components/JoinGameRoomSection";
import LobbyFooter from "../components/LobbyFooter";
import {Popup} from "reactjs-popup";
import {SocketContext} from "../contexts/SocketContext";
import {clearSession} from "../utils/session";
import {socketRequest} from "../utils/socketRequest";

const LandingPage = () => {
	const {setPlayer, openPopup, validatePlayerInfo, setIsOpen, isOpen, inputError} = useContext(PlayerContext);

	const {socket, setRoomCode} = useContext(SocketContext);
	const [joinAlert, setJoinAlert] = useState(false);
	const [isCreating, setIsCreating] = useState(false);
	const [isMatching, setIsMatching] = useState(false);
	const [noRoomsAlert, setNoRoomsAlert] = useState(false);
	const [serverError, setServerError] = useState("");
	// Cancel functions for whatever is in flight, so leaving the page - or
	// clicking twice - never leaves a listener or a timer behind.
	const createCleanupRef = useRef(null);
	const matchCleanupRef = useRef(null);
	const navigate = useNavigate();

	useEffect(() => {
		setPlayer({playerSocket: socket, name: "", gender: "male", avatar: "", isLeader: false});
		setRoomCode();
		// Back at the lobby means the previous table is behind us; drop the
		// stored seat so a stale room code cannot hijack the next game.
		clearSession();
	}, []); //ON MOUNT SET THE PLAYER OBJECT TO THE ABOVE , WHAT HAPPENS WHEN THE PLAYER DISCONNECTS AND COMES BACK PROBABLY NEED TO ACCESS INTERNAL SOTRAGE

	useEffect(
		() => () => {
			createCleanupRef.current?.();
			matchCleanupRef.current?.();
		},
		[]
	);

	const handleCreateNewRoom = () => {
		if (!validatePlayerInfo()) return;

		createCleanupRef.current?.();

		setIsCreating(true);
		setNoRoomsAlert(false);
		setServerError("");
		setRoomCode("");

		createCleanupRef.current = socketRequest(socket, {
			emit: "getRoomSize",
			payload: "",
			response: "getRoomSizeR",
			onReply: ({size}) => {
				createCleanupRef.current = null;
				setIsCreating(false);

				if (size) {
					setJoinAlert(true);
				} else {
					setJoinAlert(false);
					openPopup();
				}
			},
			onTimeout: () => {
				createCleanupRef.current = null;
				setIsCreating(false);
				setServerError("The server is not responding right now. Give it a moment and try again.");
			},
		});
	};

	// Quick match: the server picks whichever open lobby is closest to full.
	const handleJoinRandomRoom = () => {
		if (!validatePlayerInfo()) return;

		matchCleanupRef.current?.();

		setIsMatching(true);
		setJoinAlert(false);
		setNoRoomsAlert(false);
		setServerError("");

		matchCleanupRef.current = socketRequest(socket, {
			emit: "joinRandomRoom",
			response: "joinRandomRoomR",
			onReply: ({found, roomCode}) => {
				matchCleanupRef.current = null;
				setIsMatching(false);

				if (!found) {
					setNoRoomsAlert(true);
					return;
				}

				setRoomCode(roomCode);
				navigate("/wa/");
			},
			onTimeout: () => {
				matchCleanupRef.current = null;
				setIsMatching(false);
				// A server that never answers is a failure the player can retry,
				// not a spinner that runs forever.
				setServerError("Match-making is not responding right now. Try again, or create a game and share the code.");
			},
		});
	};

	return (
		<div className="lobby-shell">
			<header className="brand fade-up">
				<div className="brand-mark" aria-hidden="true">
					<span className="brand-suit red">♥</span>
					<span className="brand-suit">♠</span>
					<span className="brand-suit red">♦</span>
				</div>
				<h1 className="brand-title">Cheat</h1>
				<p className="brand-sub">Bluff, accuse, and empty your hand first.</p>
			</header>

			<main className="panel lobby-card fade-up">
				<PlayerInfoSelect />

				<hr className="m-0" style={{borderColor: "var(--border)", opacity: 1}} />

				<div className="d-flex flex-column gap-2">
					<Button variant="success" size="lg" onClick={handleCreateNewRoom} disabled={isCreating || isMatching} className="w-100">
						{isCreating ? "Creating game…" : "Create a new game"}
					</Button>
					<Button variant="info" onClick={handleJoinRandomRoom} disabled={isCreating || isMatching} className="w-100">
						{isMatching ? "Looking for a table…" : "Join a random game"}
					</Button>
					{joinAlert && (
						<Alert key="danger" variant="danger">
							Looks like there is already a room with that code, Please try another code.
						</Alert>
					)}
					{noRoomsAlert && (
						<Alert variant="danger">
							No open tables right now — create a new game and share the code, and we&apos;ll seat the next players with you.
						</Alert>
					)}
					{serverError && <Alert variant="danger">{serverError}</Alert>}
					{inputError && (
						<Alert key="danger" variant="danger">
							Some input fields are missing, please Make sure to select an avatar and choose a name between 3 and 20 characters
						</Alert>
					)}
				</div>

				<div className="or-split">OR</div>

				<JoinGameRoomSection />

				<Popup open={isOpen} modal nested position="center" onClose={() => setIsOpen(false)}>
					<GameOptionsSelect />
				</Popup>
			</main>

			<LobbyFooter />
		</div>
	);
};

export default LandingPage;
