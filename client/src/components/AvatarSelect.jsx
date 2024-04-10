import { useContext } from "react";
import { PlayerContext } from "../contexts/PlayerContext";
import "bootstrap/dist/css/bootstrap.min.css";

import { Col, Image } from "react-bootstrap";
const AvatarSelect = () => {
	//gender is male or female
	const { player, setPlayer } = useContext(PlayerContext);
	console.log("player", player);
	const prefix = player.gender === "male" ? "m" : "w";
	const avatarList = [];

	for (let index = 1; index < 13; index++) {
		avatarList.push(`../src/assets/avatars/${prefix}${index}.svg`);
	}
	return avatarList.map((imagePath, indexKey) => {
		return (
			<Col
				xs={-1}
				key={indexKey}
				onClick={() => setPlayer({ ...player, avatar: imagePath.substring(22) })}
				className="bg-warning m-1 rounded-3"
				style={{ cursor: "pointer" }}>
				<Image className="rounded-3 " src={imagePath} width={40} />
			</Col>
		);
	});
};

export default AvatarSelect;

/*
#2A2F4F
#917FB3
#E5BEEC
#FDE2F3
*/
