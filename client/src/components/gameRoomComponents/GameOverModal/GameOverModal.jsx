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
				<Modal.Title>🏆 Game over</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<div className="d-flex flex-column gap-2">
					{/* Winner Section */}
					<div className="podium-row gold">
						<span className="podium-rank">1</span>
						<img className="podium-avatar" src={`/avatars/${winner.avatar?.replace("/avatars/", "")}`} alt="" />
						<span className="podium-name">{winner.name}</span>
						<span className="podium-cards">Winner · 0 cards</span>
					</div>

					{/* Other Players */}
					{otherPlayers?.map((player, index) => (
						<div key={player.socketID} className="podium-row">
							<span className="podium-rank">{index + 2}</span>
							<img className="podium-avatar" src={`/avatars/${player.avatar?.replace("/avatars/", "")}`} alt="" />
							<span className="podium-name">{player.name}</span>
							<span className="podium-cards">{player.cardsLeft} cards left</span>
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
