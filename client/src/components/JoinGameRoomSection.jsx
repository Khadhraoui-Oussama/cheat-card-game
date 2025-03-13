import {useContext, useEffect, useState} from "react";
import {PlayerContext} from "../contexts/PlayerContext";
import {SocketContext} from "../contexts/SocketContext";
import {Link, useNavigate} from "react-router-dom";
import {Alert, Button} from "react-bootstrap";

const JoinGameSection = () => {
	const {roomCode, setRoomCode, socket} = useContext(SocketContext);
	const {player, setPlayer} = useContext(PlayerContext);
	const [joinAlert, setJoinAlert] = useState(false);
	const [playerInfoMissingAlert, setPlayerInfoMissingAlert] = useState(false);
	const navigate = useNavigate();

	//this could be trouble , why are we connecting to the socket and later disconnecting here and in the gameWaitingArea and a bunch of  other places , might need to change the way we handle it
	useEffect(() => {
		if (!socket.connected) {
			socket.connect();
		}
		return () => socket.disconnect();
	}, []);
	const handleJoinRoomWithCode = () => {
		//TODO CHECK FOR THE AVATAR AND THE NAME IN THE PLAYER ARE SET BEFORE JOINING

		if (roomCode && player.name.length > 2 && player.name.length < 21 && player.avatar.length > "/avatars/.svg".length) {
			setPlayerInfoMissingAlert(false);
			// min of avatar length
			socket.emit("getRoomSize", roomCode);
			socket.on("getRoomSizeR", (roomSize) => {
				if (roomSize === 4 || roomSize > 4) {
					// console.log("roomSize is full");
					setPlayer({...player, isLeader: false}); // why this change in state ??
					setJoinAlert(true);
				} else {
					setJoinAlert(false);
					navigate("/wa/");
				}
			});
		} else {
			setPlayerInfoMissingAlert(true);
		}
	};
	return (
		<div>
			<input
				type="text"
				placeholder="room code eg : SRkq4z9"
				max={7}
				style={{background: "#ddebf0"}}
				onChange={(e) => {
					setRoomCode(e.target.value);
					//working good checked with console.Log
				}}
				id="room-code"
			/>
			<Button
				onClick={() => {
					setPlayer({...player, isLeader: false});
					handleJoinRoomWithCode();
				}}>
				Join using a room code
			</Button>
			{playerInfoMissingAlert && (
				<Alert key="danger" variant="danger">
					Some input fields are missing , please Make sure to enter a valid room code, select an avatar and choose a name between 3 and 20 characters
				</Alert>
			)}
			{joinAlert && (
				<Alert key="danger" variant="danger">
					The room you are trying to join is full , please try another room or create your own game.
				</Alert>
			)}
		</div>
	);
};

export default JoinGameSection;
//TODO FIND A WAY TO LIMIT JOINING A ROOM TO 4 SOCKETS ONLY DONE
//JOIN WITH CODE NOW CHECKS THE PLAYER INFO (NAME AND AVATAR)
//FIND A WAY TO MAKE SURE THAT THE ROOMCODE WHEN CHOOSING START A NEW GAME IS BASED ON THE SOCKET AND WHEN PRESSING JOIN ROOM IT IS THE VALUE ENTERED AND BOTH FUNTIONALITIES WONT INTERFERE
//START WORKING ON DND-KIT FOR THE CARDS DRAG AND DROP
//FIND A WAY TO START THE GAME WITH THE CONFIG SELECTED IN THE GAMEOPTIONS FOR LATERR
