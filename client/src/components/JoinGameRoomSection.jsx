import {useContext, useEffect, useRef, useState} from "react";
import {PlayerContext} from "../contexts/PlayerContext";
import {SocketContext} from "../contexts/SocketContext";
import {useNavigate} from "react-router-dom";
import {Alert, Button} from "react-bootstrap";
import {socketRequest} from "../utils/socketRequest";

const JoinGameRoomSection = () => {
	const {roomCode, setRoomCode, socket} = useContext(SocketContext);
	const {player, setPlayer} = useContext(PlayerContext);
	const [joinAlert, setJoinAlert] = useState(false);
	const [noRoomAlert, setNoRoomAlert] = useState(false);
	const [playerInfoMissingAlert, setPlayerInfoMissingAlert] = useState(false);
	const [serverError, setServerError] = useState("");
	const [isJoining, setIsJoining] = useState(false);
	const joinCleanupRef = useRef(null);
	const navigate = useNavigate();

	//this could be trouble , why are we connecting to the socket and later disconnecting here and in the gameWaitingArea and a bunch of  other places , might need to change the way we handle it
	useEffect(() => {
		if (!socket.connected) {
			socket.connect();
		}
		return () => {
			joinCleanupRef.current?.();
		};
	}, []);

	const handleJoinRoomWithCode = () => {
		//TODO CHECK FOR THE AVATAR AND THE NAME IN THE PLAYER ARE SET BEFORE JOINING

		if (roomCode && player.name.length > 2 && player.name.length < 21 && player.avatar.length > "/avatars/.svg".length) {
			setPlayerInfoMissingAlert(false);
			setServerError("");
			setNoRoomAlert(false);
			// min of avatar length

			joinCleanupRef.current?.();
			setIsJoining(true);

			joinCleanupRef.current = socketRequest(socket, {
				emit: "getRoomSize",
				payload: roomCode,
				response: "getRoomSizeR",
				onReply: ({exists, openSeats}) => {
					joinCleanupRef.current = null;
					setIsJoining(false);

					/*
						An unknown code used to sail straight through here: an empty
						room and a room that was never there both have four seats
						going spare, so the joiner was seated in a brand new room of
						their own - which looks exactly like a successful join, while
						the host sits alone in the real one. One wrong character in a
						code full of lookalikes (l/I, O/0, -/_) was enough.
					*/
					if (!exists) {
						setNoRoomAlert(true);
						return;
					}

					// A game already running still has a seat to offer if somebody
					// walked away from it, so it is the free-seat count - not the
					// headcount - that decides whether this player can sit down.
					if (!openSeats) {
						setPlayer({...player, isLeader: false}); // why this change in state ??
						setJoinAlert(true);
					} else {
						setJoinAlert(false);
						navigate("/wa/");
					}
				},
				onTimeout: () => {
					joinCleanupRef.current = null;
					setIsJoining(false);
					setServerError("The server is not responding right now. Give it a moment and try again.");
				},
			});
		} else {
			setPlayerInfoMissingAlert(true);
		}
	};

	return (
		<div className="d-flex flex-column gap-2">
			<label className="field-label" htmlFor="room-code">
				Have a room code?
			</label>
			<div className="join-row">
				<input
					type="text"
					className="form-control"
					placeholder="SRkq4z9"
					maxLength={7}
					autoComplete="off"
					spellCheck="false"
					value={roomCode || ""}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							e.preventDefault();
							handleJoinRoomWithCode();
						}
					}}
					onChange={(e) => {
						setRoomCode(e.target.value.trim());
						setNoRoomAlert(false);
						//working good checked with console.Log
					}}
					id="room-code"
				/>
				<Button variant="info" onClick={handleJoinRoomWithCode} disabled={isJoining}>
					{isJoining ? "Joining…" : "Join"}
				</Button>
			</div>
			{playerInfoMissingAlert && (
				<Alert key="danger" variant="danger">
					Some input fields are missing , please Make sure to enter a valid room code, select an avatar and choose a name between 3 and 20 characters
				</Alert>
			)}
			{noRoomAlert && (
				<Alert variant="danger">
					No table is using the code <strong>{roomCode}</strong>. Codes are case sensitive — copy it from the host&apos;s screen rather than retyping it. To start your own table, use <strong>Create a new game</strong>.
				</Alert>
			)}
			{joinAlert && (
				<Alert key="danger" variant="danger">
					That room has no free seat right now — a game in progress only opens up when somebody leaves it. Try another room or create your own game.
				</Alert>
			)}
			{serverError && <Alert variant="danger">{serverError}</Alert>}
		</div>
	);
};

export default JoinGameRoomSection;
//TODO FIND A WAY TO LIMIT JOINING A ROOM TO 4 SOCKETS ONLY DONE
//JOIN WITH CODE NOW CHECKS THE PLAYER INFO (NAME AND AVATAR)
//FIND A WAY TO MAKE SURE THAT THE ROOMCODE WHEN CHOOSING START A NEW GAME IS BASED ON THE SOCKET AND WHEN PRESSING JOIN ROOM IT IS THE VALUE ENTERED AND BOTH FUNTIONALITIES WONT INTERFERE
//START WORKING ON DND-KIT FOR THE CARDS DRAG AND DROP
//FIND A WAY TO START THE GAME WITH THE CONFIG SELECTED IN THE GAMEOPTIONS FOR LATERR
