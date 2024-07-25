import { useContext } from "react";
import { PlayerContext } from "../contexts/PlayerContext";
import { SocketContext } from "../contexts/SocketContext";
import { Link } from "react-router-dom";
import { Button } from "react-bootstrap";

const JoinGameSection = () => {
	const { roomCode, setRoomCode } = useContext(SocketContext);
	const { player, setPlayer } = useContext(PlayerContext);
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
				{/* TODO MAKE INPUT VALIDATION FOR THE ROOM CODE IF JOINING BY A CODE */}
				<button onClick={() => setPlayer({ ...player, isLeader: false })}>
					Join using a room code
				</button>
			</Link>
		</div>
	);
};

export default JoinGameSection;
