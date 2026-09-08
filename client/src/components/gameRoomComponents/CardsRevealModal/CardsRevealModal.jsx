import {Modal} from "react-bootstrap";
import PlayableCard from "../PlayableCard";

const CardsRevealModal = ({show, onHide, cards, playerName}) => {
	return (
		<Modal show={show} onHide={onHide} centered size="lg">
			<Modal.Header closeButton>
				<Modal.Title>👁 {playerName}&apos;s cards</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<p className="muted mb-3" style={{fontSize: "0.86rem"}}>
					Some of them, anyway — could be all of them, who knows?
				</p>
				<div className="d-flex flex-wrap gap-2 justify-content-center">
					{cards.map((card, index) => (
						<PlayableCard key={index} cardType={card} />
					))}
				</div>
			</Modal.Body>
		</Modal>
	);
};

export default CardsRevealModal;
//TODO ALL PLAYERS NOW HAVE PLAY NOW AND START GAME ABILITY WTF
