import {Button, Card} from "react-bootstrap";

const PlayerCard = ({player}) => {
	return (
		<Card className="w-50 m-auto shadow-2xl" style={{maxWidth: "100%", maxHeight: "100%"}}>
			<Card.Img className="w-50 m-auto" src={player.avatar} />
			<Card.Body>
				<Card.Title style={{fontSize: "1rem"}} className="text-center shadow">
					{player.name}
				</Card.Title>
			</Card.Body>
		</Card>
	);
};

export default PlayerCard;
