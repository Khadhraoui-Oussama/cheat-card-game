import React from "react";
import {Modal, Button} from "react-bootstrap";

const LastCardModal = ({show, onHide, lastCardInfo}) => {
	if (!lastCardInfo) return null;

	return (
		<Modal show={show} onHide={onHide} centered>
			<Modal.Header closeButton>
				<Modal.Title>{lastCardInfo.playerName}'s Final Card</Modal.Title>
			</Modal.Header>
			<Modal.Body className="text-center">
				<p>The last played card was:</p>
				<img src={`../../../public/classic/${lastCardInfo.card}.svg`} alt={`${lastCardInfo.card}`} style={{width: "150px"}} />
			</Modal.Body>
			<Modal.Footer>
				<Button variant="secondary" onClick={onHide}>
					Close
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default LastCardModal;
