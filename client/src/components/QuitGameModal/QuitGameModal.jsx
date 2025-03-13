import React from "react";
import {Modal, Button} from "react-bootstrap";

const QuitGameModal = ({show, onHide, onConfirm}) => {
	return (
		<Modal show={show} onHide={onHide} centered>
			<Modal.Header closeButton>
				<Modal.Title>Quit Game</Modal.Title>
			</Modal.Header>
			<Modal.Body>Are you sure you want to quit? You'll be redirected to the landing page.</Modal.Body>
			<Modal.Footer>
				<Button variant="secondary" onClick={onHide}>
					Cancel
				</Button>
				<Button variant="danger" onClick={onConfirm}>
					Quit Game
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default QuitGameModal;
