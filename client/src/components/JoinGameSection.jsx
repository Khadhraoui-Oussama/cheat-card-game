import { useContext } from "react";
import { PlayerContext } from "../contexts/PlayerContext";

const JoinGameSection = () => {
	return (
		<div>
			<input type="text" placeholder="game room code" />
			<button>Join using code</button>
		</div>
	);
};

export default JoinGameSection;
