import {useContext} from "react";
import {PlayerContext} from "../contexts/PlayerContext";
import "bootstrap/dist/css/bootstrap.min.css";

const AvatarSelect = () => {
	const {player, setPlayer, selectedAvatarPath, setSelectedAvatarPath} = useContext(PlayerContext);
	const prefix = player.gender === "male" ? "m" : "w";
	const avatarList = [];

	for (let index = 1; index < 13; index++) {
		avatarList.push(`/avatars/${prefix}${index}.svg`);
	}

	return avatarList.map((imagePath, indexKey) => {
		const isSelected = imagePath === selectedAvatarPath;
		return (
			<button
				type="button"
				key={indexKey}
				aria-label={`Avatar ${indexKey + 1}`}
				aria-pressed={isSelected}
				onClick={() => {
					setPlayer({...player, avatar: imagePath});
					setSelectedAvatarPath(imagePath);
				}}
				className={`avatar-tile${isSelected ? " selected" : ""}`}>
				<img src={imagePath} alt="" />
			</button>
		);
	});
};

export default AvatarSelect;
