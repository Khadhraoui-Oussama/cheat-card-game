import AvatarSelect from "./AvatarSelect";
import {useContext} from "react";
import {PlayerContext} from "../contexts/PlayerContext";

const PlayerInfoSelect = () => {
	const {player, setPlayer, setSelectedAvatarPath} = useContext(PlayerContext);

	const handleGenderChange = (gender) => {
		setPlayer({...player, avatar: "", gender});
		setSelectedAvatarPath("");
	};

	return (
		<>
			<div>
				<label className="field-label" htmlFor="player-name">
					Your name
				</label>
				<input
					type="text"
					name="player-name"
					id="player-name"
					className="form-control"
					maxLength={20}
					autoComplete="off"
					value={player.name}
					placeholder="e.g. Sami"
					onChange={(e) => {
						setPlayer({...player, name: e.target.value});
					}}
				/>
			</div>

			<div>
				<div className="d-flex align-items-center justify-content-between mb-2">
					<span className="field-label mb-0">Your avatar</span>
					<div className="segmented">
						<label className={player.gender === "male" ? "active" : ""}>
							<input id="male" name="gender" type="radio" value="male" checked={player.gender === "male"} onChange={(e) => handleGenderChange(e.target.value)} />
							Male
						</label>
						<label className={player.gender === "female" ? "active" : ""}>
							<input id="female" name="gender" type="radio" value="female" checked={player.gender === "female"} onChange={(e) => handleGenderChange(e.target.value)} />
							Female
						</label>
					</div>
				</div>
				<div className="avatar-grid">
					<AvatarSelect />
				</div>
			</div>
		</>
	);
};

export default PlayerInfoSelect;
