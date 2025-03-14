import React from "react";
import {Modal} from "react-bootstrap";
import PlayableCard from "../PlayableCard";

const CardsRevealModal = ({show, onHide, cards, playerName}) => {
	return (
		<Modal show={show} onHide={onHide} centered size="lg">
			<Modal.Header closeButton>
				<Modal.Title>Some of {playerName}'s Cards, (could be all cards , who knows ?)</Modal.Title>
			</Modal.Header>
			<Modal.Body className="h-100">
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
