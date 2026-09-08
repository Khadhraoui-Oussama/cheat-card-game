import {Modal, Button} from "react-bootstrap";

/*
	Shared by the game room and the waiting area. The defaults are the mid-game
	wording; the lobby overrides them, because leaving an unstarted table frees
	the seat outright instead of holding it open for a replacement.
*/
const QuitGameModal = ({
	show,
	onHide,
	onConfirm,
	title = "Leave the table?",
	body = "Your hand stays on the table and the round pauses until somebody takes your seat. You cannot come back to it once another player sits down.",
	confirmLabel = "Quit game",
}) => {
	return (
		<Modal show={show} onHide={onHide} centered>
			<Modal.Header closeButton>
				<Modal.Title>{title}</Modal.Title>
			</Modal.Header>
			<Modal.Body className="muted">{body}</Modal.Body>
			<Modal.Footer>
				<Button variant="secondary" onClick={onHide}>
					Cancel
				</Button>
				<Button variant="danger" onClick={onConfirm}>
					{confirmLabel}
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default QuitGameModal;
