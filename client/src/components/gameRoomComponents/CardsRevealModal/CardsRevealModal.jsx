import React from "react";
import {Modal} from "react-bootstrap";
import PlayableCard from "../PlayableCard";

const CardsRevealModal = ({show, onHide, cards, playerName}) => {
	return (
		<Modal show={show} onHide={onHide} centered size="lg">
			<Modal.Header closeButton>
				<Modal.Title>{playerName}'s Cards</Modal.Title>
			</Modal.Header>
			<Modal.Body>
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
