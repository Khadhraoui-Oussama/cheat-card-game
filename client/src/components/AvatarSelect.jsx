import {useContext, useState, useEffect} from "react";
import {PlayerContext} from "../contexts/PlayerContext";
import "bootstrap/dist/css/bootstrap.min.css";

import {Col, Image} from "react-bootstrap";

const AvatarSelect = () => {
	const {player, setPlayer, selectedAvatarPath, setSelectedAvatarPath} = useContext(PlayerContext);
	const prefix = player.gender === "male" ? "m" : "w";
	const avatarList = [];

	for (let index = 1; index < 13; index++) {
		avatarList.push(`/avatars/${prefix}${index}.svg`);
	}

	useEffect(() => {
		console.log("player", player);
	}, [player]);

	return avatarList.map((imagePath, indexKey) => {
		const bg_color = imagePath === selectedAvatarPath ? "bg-success" : "";
		return (
			<Col
				xs={-1}
				key={indexKey}
				onClick={() => {
					setPlayer({...player, avatar: imagePath});
					setSelectedAvatarPath(imagePath);
				}}
				className={`${bg_color} m-1 rounded-3`}
				style={{cursor: "pointer", background: "#ddebf0"}}>
				<Image className="rounded-3" src={imagePath} width={40} />
			</Col>
		);
	});
};

export default AvatarSelect;
