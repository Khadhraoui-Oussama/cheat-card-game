import {Button, Card} from "react-bootstrap";

const PlayerCard = ({player}) => {
	return (
		<Card className="w-50 m-auto" style={{maxWidth: "80px", maxHeight: "80px"}}>
			<Card.Img className="w-50 m-auto" src={player.avatar} />
			<Card.Body>
				<Card.Title style={{fontSize: ".5rem"}}>{player.name}</Card.Title>
			</Card.Body>
		</Card>
	);
};

export default PlayerCard;
