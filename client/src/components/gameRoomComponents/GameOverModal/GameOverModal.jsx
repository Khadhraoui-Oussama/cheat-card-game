import React from "react";
import {Modal, Button} from "react-bootstrap";

const GameOverModal = ({show, onHide, winner, otherPlayers}) => {
	if (!winner) return null;

	return (
		<Modal
			show={show}
			onHide={onHide}
			backdrop="static" // Prevent closing by clicking outside
			keyboard={false} // Prevent closing with keyboard
			centered>
			<Modal.Header>
				<Modal.Title>Game Over!</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<div className="d-flex flex-column gap-3">
					{/* Winner Section */}
					<div className="winner-section bg-warning bg-opacity-25 p-3 rounded">
						<h4 className="text-center mb-3">🏆 Winner 🏆</h4>
						<div className="d-flex align-items-center justify-content-between">
							<div className="d-flex align-items-center gap-2">
								<img src={`/avatars/${winner.avatar?.replace("/avatars/", "")}`} alt={winner.name} width={50} height={50} className="rounded-circle" />
								<span className="fw-bold">{winner.name}</span>
							</div>
							<span>0 cards left</span>
						</div>
					</div>

					{/* Other Players */}
					{otherPlayers?.map((player, index) => (
						<div key={player.socketID} className="d-flex justify-content-between align-items-center p-2 border-bottom">
							<div className="d-flex align-items-center gap-2">
								<span>{index + 2}.</span>
								<img src={`/avatars/${player.avatar?.replace("/avatars/", "")}`} alt={player.name} width={40} height={40} className="rounded-circle" />
								<span>{player.name}</span>
							</div>
							<span>{player.cardsLeft} cards left</span>
						</div>
					))}
				</div>
			</Modal.Body>
			<Modal.Footer>
				<Button variant="secondary" onClick={onHide}>
					Close
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default GameOverModal;
