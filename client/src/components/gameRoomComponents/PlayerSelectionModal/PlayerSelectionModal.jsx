import React from "react";
import {Modal, Button} from "react-bootstrap";

const PlayerSelectionModal = ({show, onHide, players, onSelect, actionType}) => {
	return (
		<Modal show={show} onHide={onHide} centered>
			<Modal.Header closeButton>
				<Modal.Title>Select Player to {actionType === "trueVision" ? "View Cards" : "Skip Turn"}</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<div className="d-flex flex-column gap-2">
					{players.map((player) => (
						<Button key={player.socketID} onClick={() => onSelect(player)} variant="outline-primary">
							{player.name}
						</Button>
					))}
				</div>
			</Modal.Body>
		</Modal>
	);
};

export default PlayerSelectionModal;
