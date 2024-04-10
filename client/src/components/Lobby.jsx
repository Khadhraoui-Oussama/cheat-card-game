// import AvatarSelect from "./AvatarSelect";
// import "../index.css";
// import { useContext } from "react";
// import { PlayerContext } from "../contexts/PlayerContext";
// import { Row } from "react-bootstrap";

// const Lobby = () => {
// 	const { player, setPlayer } = useContext(PlayerContext);
// 	console.log("avatar select");
// 	return (
// 		<div>
// 			<p>Player Name</p>
// 			<input type="text" name="player-name" id="player-name" placeholder="Choose you name" />
// 			<p>Choose you avatar</p>
// 			<label>
// 				<input
// 					id="male"
// 					name="gender"
// 					type="radio"
// 					value="male"
// 					onChange={(e) => setPlayer({ ...player, gender: e.target.value })}
// 				/>
// 				Male
// 			</label>
// 			<label>
// 				<input
// 					id="female"
// 					name="gender"
// 					type="radio"
// 					value="female"
// 					onChange={(e) => setPlayer({ ...player, gender: e.target.value })}
// 				/>
// 				Female
// 			</label>
// 			<Row>
// 				<AvatarSelect />
// 			</Row>
// 		</div>
// 	);
// };

// export default Lobby;
