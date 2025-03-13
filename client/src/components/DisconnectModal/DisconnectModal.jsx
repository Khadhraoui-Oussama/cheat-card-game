import React from "react";
import {Modal, Button} from "react-bootstrap";
import {useNavigate} from "react-router-dom";

const DisconnectModal = ({show, playerName}) => {
	const navigate = useNavigate();

	const handleReturnToLobby = () => {
		navigate("/");
		window.location.reload(); // Force a clean reload
	};

	return (
		<Modal show={show} backdrop="static" keyboard={false}>
			<Modal.Header>
				<Modal.Title>Game Interrupted</Modal.Title>
			</Modal.Header>
			<Modal.Body className="text-center">
				<div className="mb-3">{playerName ? `${playerName} has left the game.` : "A player has left the game."}</div>
				<div>The game cannot continue with missing players. Please return to the lobby to join or create a new game.</div>
			</Modal.Body>
			<Modal.Footer className="justify-content-center">
				<Button variant="primary" onClick={handleReturnToLobby}>
					Return to Lobby
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default DisconnectModal;
