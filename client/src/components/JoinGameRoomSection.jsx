import { useContext } from "react";
import { PlayerContext } from "../contexts/PlayerContext";
import { SocketContext } from "../contexts/SocketContext";
import { Link } from "react-router-dom";
import { Button } from "react-bootstrap";

const JoinGameSection = () => {
	const { roomCode, setRoomCode } = useContext(SocketContext);
	return (
		<div>
			<input
				type="text"
				placeholder="room code eg : SRkq4z9"
				max={7}
				onChange={(e) => {
					setRoomCode(e.target.value);
					//working good checked with console.Log
				}}
			/>
			<Link to="/wa/">
				<Button>Join using a room code</Button>
			</Link>
		</div>
	);
};

export default JoinGameSection;
