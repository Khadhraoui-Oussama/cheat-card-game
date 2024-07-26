import { Button, Card } from "react-bootstrap";

const PlayerCard = ({ player }) => {
	return (
		<Card className="w-50 m-auto" style={{ maxWidth: "200px", maxHeight: "200px" }}>
			<Card.Img className="w-50 m-auto" src={player.avatar} />
			<Card.Body>
				<Card.Title>{player.name}</Card.Title>
			</Card.Body>
		</Card>
	);
};

export default PlayerCard;
