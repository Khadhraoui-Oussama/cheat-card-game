import {useContext, useEffect, useRef, useState} from "react";
import {Alert, Button} from "react-bootstrap";
import {Link, useNavigate} from "react-router-dom";
import {SocketContext} from "../contexts/SocketContext";
import {PlayerContext} from "../contexts/PlayerContext";
import PlayerCardHolder from "../components/PlayerCardHolder";
import PlayerCard from "../components/PlayerCard";
import {GameContext} from "../contexts/GameContext";
import {clearSession, saveSession} from "../utils/session";
import QuitGameModal from "../components/QuitGameModal/QuitGameModal";
const GameWaitingArea = () => {
	const {socket, roomCode, setRoomCode, playerId} = useContext(SocketContext);
	const {player, setPlayer} = useContext(PlayerContext);
	const {gameOptions} = useContext(GameContext);
	const [userList, setUserList] = useState([]);
	const [copied, setCopied] = useState(false);
	const [joinError, setJoinError] = useState(null);
	const [showLeaveModal, setShowLeaveModal] = useState(false);
	/*
		How this screen was left. "left" and "game" are the two deliberate exits
		and both are already accounted for; anything still null on unmount means
		the player got out some other way - the browser back button, a stray
		link - and their seat has to be freed for them.
	*/
	const departureRef = useRef(null);
	// Read on unmount, where the render-time roomCode would be a stale capture.
	const roomCodeRef = useRef(roomCode);
	const navigate = useNavigate();

	roomCodeRef.current = roomCode;

	useEffect(
		() => () => {
			if (departureRef.current) return;
			if (!roomCodeRef.current) return;
			socket.emit("leaveRoom", roomCodeRef.current);
			clearSession();
		},
		[socket]
	);

	useEffect(() => {
		if (!socket.connected) {
			socket.connect();
		}
		// why are we creting a new roomcode and a new playerobject ??
		//might need to revisit how we pass state and data
		socket.on("connect", () => {
			//console.log("Socket connected:", socket.id);
			if (!roomCode) {
				const newRoomCode = socket.id.substring(0, 7);
				setRoomCode(newRoomCode);
				//console.log("ROOMCODE", newRoomCode);
			} else {
				const playerNewObj = {
					playerId,
					name: player.name,
					avatar: player.avatar,
					socketID: socket.id,
					room: roomCode,
					isLeader: player.isLeader,
					preorderEnabled: gameOptions.preorder,
				};
				socket.emit("joinRoom", [roomCode, socket.id, playerNewObj]);
			}
		});

		socket.on("updateUserList", (updatedUserList) => {
			//console.log("Updated user list received:", updatedUserList);
			//makes sure that a leader is always assigned if not present at first
			setUserList(updatedUserList);
		});
		socket.on("updateLocalPlayer", (locaPlayer) => {
			setPlayer(locaPlayer);
		});

		socket.on("navigateToGameRoomR", (roomCode) => {
			departureRef.current = "game";
			saveSession({roomCode});
			navigate(`/play/${roomCode}`);
		});

		/*
			The room turned out to be a game already in progress with a chair
			standing empty, and the server just sat us in it - so this screen is
			skipped entirely and we walk straight into the round.
		*/
		socket.on("joinedGameInProgress", ({roomCode: joinedRoomCode}) => {
			departureRef.current = "game";
			saveSession({roomCode: joinedRoomCode});
			navigate(`/play/${joinedRoomCode}`);
		});

		socket.on("joinRoomFailed", ({message}) => {
			setJoinError(message);
		});

		return () => {
			socket.off("connect");
			socket.off("updateLocalPlayer");
			socket.off("updateUserList");
			socket.off("navigateToGameRoomR");
			socket.off("joinedGameInProgress");
			socket.off("joinRoomFailed");
		};
	}, [socket, player, roomCode, setRoomCode, playerId]);

	useEffect(() => {
		if (socket.connected && roomCode) {
			const playerNewObj = {
				playerId,
				name: player.name,
				avatar: player.avatar,
				socketID: socket.id,
				room: roomCode,
				isLeader: player.isLeader,
				preorderEnabled: gameOptions.preorder,
			};
			socket.emit("joinRoom", [roomCode, socket.id, playerNewObj]);
		}
	}, [roomCode, socket, player, playerId]);

	const handleCopyCode = async () => {
		try {
			await navigator.clipboard.writeText(roomCode);
			setCopied(true);
			setTimeout(() => setCopied(false), 1600);
		} catch {
			setCopied(false);
		}
	};

	const handleLeaveRoom = () => {
		departureRef.current = "left";
		// leaveRoom frees the seat server side; just navigating away would leave
		// the player sitting at the table until their socket eventually drops.
		socket.emit("leaveRoom", roomCode);
		clearSession();
		setRoomCode("");
		navigate("/");
	};

	const isFull = userList.length >= 4;
	const seats = [0, 1, 2, 3];

	return (
		<div className="lobby-shell">
			<div className="lobby-topbar">
				<button type="button" className="icon-btn danger" onClick={() => setShowLeaveModal(true)} title="Leave room" aria-label="Leave room">
					✕
				</button>
			</div>

			<header className="brand fade-up">
				<span className="eyebrow">Lobby</span>
				<h1 className="brand-title" style={{fontSize: "clamp(1.6rem, 4vw, 2.2rem)"}}>
					Waiting for players
				</h1>
				<div className="mt-3">
					<div className="room-code">
						<span className="eyebrow">Code</span>
						<code>{roomCode}</code>
						<button type="button" className="copy-btn" onClick={handleCopyCode}>
							{copied ? "Copied!" : "Copy"}
						</button>
					</div>
				</div>
			</header>

			<main className="panel lobby-card fade-up">
				<div className="seat-grid">
					{seats.map((index) => (
						<div key={index}>{userList[index] ? <PlayerCard player={userList[index]} /> : <PlayerCardHolder />}</div>
					))}
				</div>

				<div className="d-flex flex-column gap-2">
					<div className="d-flex align-items-center justify-content-between">
						<span className="eyebrow">Table</span>
						<span className="chip">{userList.length} / 4 seated</span>
					</div>
					<div className="progress-track">
						<div className="progress-fill" style={{width: `${(Math.min(userList.length, 4) / 4) * 100}%`}} />
					</div>
				</div>

				<Button
					variant={isFull ? "success" : "secondary"}
					size="lg"
					onClick={() => {
						if (isFull) {
							departureRef.current = "game";
							saveSession({roomCode});
							socket.emit("navigateToGameRoom", roomCode);
							navigate(`/play/${roomCode}`);
						}
					}}
					disabled={!isFull || !player.isLeader}
					className="w-100">
					{isFull ? "Start the game" : `Need ${4 - userList.length} more player${4 - userList.length === 1 ? "" : "s"}`}
				</Button>

				{joinError && (
					<Alert variant="danger" className="mb-0">
						{joinError}{" "}
						<Link to="/" className="alert-link">
							Back to the lobby
						</Link>
					</Alert>
				)}

				{!player.isLeader && !joinError && <p className="muted text-center m-0" style={{fontSize: "0.85rem"}}>Only the host can start the game.</p>}
			</main>

			<p className="muted text-center m-0" style={{fontSize: "0.85rem", maxWidth: "440px"}}>
				Share the code above with three friends — the game begins as soon as every seat is taken.
			</p>

			<QuitGameModal
				show={showLeaveModal}
				onHide={() => setShowLeaveModal(false)}
				onConfirm={handleLeaveRoom}
				title="Leave this table?"
				body="Your seat opens up for someone else. You can join another table or start your own from the lobby."
				confirmLabel="Leave table"
			/>
		</div>
	);
};

export default GameWaitingArea;

// GameWaitingArea.jsx;
//NEW IDEA BITCHES : SET THE SOCKET CONNECTION AND STATE IN APP ON LOAD OR NOT ON LOAD(AUTO CONNECT IS FALSE IN SERVER IO CONFIG) AND THEN USE THAT IN ANY ROUTE IN THE APP COMPONENT
