import {Modal, Button} from "react-bootstrap";

const LastCardModal = ({show, onHide, lastCardInfo}) => {
	if (!lastCardInfo) return null;

	return (
		<Modal show={show} onHide={onHide} centered>
			<Modal.Header closeButton>
				<Modal.Title>{lastCardInfo.playerName}&apos;s final card</Modal.Title>
			</Modal.Header>
			<Modal.Body className="text-center">
				<p className="muted mb-3">The last played card was</p>
				<img src={`/classic/${lastCardInfo.card}.svg`} alt={`${lastCardInfo.card}`} style={{width: "150px", borderRadius: "8px", boxShadow: "var(--shadow)"}} />
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
