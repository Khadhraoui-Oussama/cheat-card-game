import React from "react";
import PlayableCard from "./PlayableCard";
import {Alert} from "react-bootstrap";

const LastCardDisplay = ({lastCardInfo}) => {
	if (!lastCardInfo?.isLastCard) return null;

	const {cardType, playerName, claimedValue, wasCorrect} = lastCardInfo;

	return (
		<div className="position-absolute d-flex flex-column align-items-center" style={{right: "20px", top: "50%", transform: "translateY(-50%)"}}>
			<Alert variant={wasCorrect ? "success" : "danger"} className="mb-2 text-center">
				Final Card by {playerName}
				<br />
				Claimed: {claimedValue}
			</Alert>
			<PlayableCard cardType={cardType} />
		</div>
	);
};

export default LastCardDisplay;
