import {Modal, Button} from "react-bootstrap";

const PlayerSelectionModal = ({show, onHide, players, onSelect, actionType}) => {
	return (
		<Modal show={show} onHide={onHide} centered>
			<Modal.Header closeButton>
				<Modal.Title>Select a player to {actionType === "trueVision" ? "reveal" : "skip"}</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<p className="muted mb-3" style={{fontSize: "0.86rem"}}>
					{actionType === "trueVision" ? "You'll see some of the cards they are holding." : "Only the player whose turn it currently is can be skipped."}
				</p>
				<div className="d-flex flex-column gap-2">
					{players.map((player) => (
						<Button key={player.socketID} onClick={() => onSelect(player)} variant="outline-primary" className="d-flex align-items-center gap-2 justify-content-start">
							<img src={`/avatars/${player.avatar?.replace("/avatars/", "")}`} alt="" width={28} height={28} style={{borderRadius: "50%", background: "var(--surface-2)"}} />
							{player.name}
						</Button>
					))}
				</div>
			</Modal.Body>
		</Modal>
	);
};

export default PlayerSelectionModal;
