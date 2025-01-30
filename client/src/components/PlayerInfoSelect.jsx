import {Stack} from "react-bootstrap";
import AvatarSelect from "./AvatarSelect";
import {useContext} from "react";
import {PlayerContext} from "../contexts/PlayerContext";

const PlayerInfoSelect = () => {
	const {player, setPlayer, selectedAvatarPath, setSelectedAvatarPath} = useContext(PlayerContext);
	return (
		<>
			<p>Player Name</p>
			<input
				type="text"
				name="player-name"
				id="player-name"
				style={{background: "#ddebf0"}}
				placeholder="Choose your name"
				onChange={(e) => {
					setPlayer({...player, name: e.target.value});
					setSelectedAvatarPath("");
				}}
			/>
			<p>Choose your avatar</p>
			<Stack direction="horizontal">
				<label>
					<input
						id="male"
						name="gender"
						type="radio"
						value="male"
						defaultChecked
						onChange={(e) => {
							setPlayer({...player, avatar: "", gender: e.target.value});
							setSelectedAvatarPath("");
						}}
					/>
					Male
				</label>
				<label>
					<input id="female" name="gender" type="radio" value="female" onChange={(e) => setPlayer({...player, avatar: "", gender: e.target.value})} />
					Female
				</label>
			</Stack>
			<Stack direction="horizontal" className="mx-auto w-100 flex-wrap">
				<AvatarSelect />
			</Stack>
		</>
	);
};

export default PlayerInfoSelect;
