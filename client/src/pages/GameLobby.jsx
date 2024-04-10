import AvatarSelect from "../components/AvatarSelect";
import "../index.css";
import { useContext, useState } from "react";
import { PlayerContext } from "../contexts/PlayerContext";
import { Container, Row, Stack } from "react-bootstrap";
import GameOptionsSelect from "../components/GameOptionsSelect";

const GameLobby = () => {
	const { player, setPlayer } = useContext(PlayerContext);
	const [isCreateGame, setIsCreateGame] = useState(false);
	return (
		<Stack>
			<p>Player Name</p>
			<input
				type="text"
				name="player-name"
				id="player-name"
				placeholder="Choose you name"
				onChange={(e) => setPlayer({ ...player, name: e.target.value })}
			/>
			<p>Choose you avatar</p>
			<label>
				<input
					id="male"
					name="gender"
					type="radio"
					value="male"
					defaultChecked
					onChange={(e) => setPlayer({ ...player, gender: e.target.value })}
				/>
				Male
			</label>
			<label>
				<input
					id="female"
					name="gender"
					type="radio"
					value="female"
					onChange={(e) => setPlayer({ ...player, gender: e.target.value })}
				/>
				Female
			</label>
			<Stack direction="horizontal">
				<AvatarSelect />
			</Stack>
			<div>
				<button onClick={() => setIsCreateGame((prev) => !prev)}>Create a game</button>
				<input type="text" placeholder="game room code" />
				<button>Join using code</button>
			</div>
			<div>
				<button>How To Play</button>
				<button>Contact us</button>
				<button>Language</button>
				<button>Settings</button>
			</div>
			{isCreateGame && <GameOptionsSelect className="popup" />}
		</Stack>
	);
};

export default GameLobby;
