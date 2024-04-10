import "../index.css";
import { useContext, useState } from "react";
import { PlayerContext } from "../contexts/PlayerContext";
import { Alert, Col, Container, Row, Stack } from "react-bootstrap";
import GameOptionsSelect from "../components/GameOptionsSelect";
import PlayerInfoSelect from "../components/PlayerInfoSelect";
import JoinGameSection from "../components/JoinGameSection";
import LobbyFooter from "../components/LobbyFooter";
import { Popup } from "reactjs-popup";

const GameLobby = () => {
	const {
		player,
		setPlayer,
		isCreateGame,
		validatePLayerInfo,
		openPopup,
		setIsOpen,
		isOpen,
		inputError,
	} = useContext(PlayerContext);

	//state for name alert show up avatar select

	console.log("isOpen", isOpen);
	console.log("inputError", inputError);
	return (
		<Container>
			<Col>
				<Stack
					className="flex justify-items-center align-items-center vh-100 "
					style={{ border: "solid 2px blue" }}>
					<Stack
						gap={1}
						style={{ width: "45%", maxHeight: "90vh", border: "solid 2px red" }}
						className="m-auto pt-2">
						<PlayerInfoSelect />
						<JoinGameSection />
						<button onClick={() => openPopup()}> Create a new game </button>
						<Popup
							open={isOpen}
							modal
							nested
							position="center"
							onClose={() => setIsOpen(false)}>
							<GameOptionsSelect />
						</Popup>
						<LobbyFooter />
						{inputError && (
							<Alert key="danger" variant="danger">
								Some input fields are missing , please Make sure to select an avatar
								and choose a name between 3 and 20 characters
							</Alert>
						)}
					</Stack>
				</Stack>
			</Col>
		</Container>
	);
};

export default GameLobby;
