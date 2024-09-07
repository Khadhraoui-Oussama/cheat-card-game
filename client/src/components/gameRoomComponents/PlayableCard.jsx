import {Card, CardBody, CardImg} from "react-bootstrap";

const PlayableCard = ({cardType}) => {
	return (
		<Card
			style={{
				border: "none",
				maxHeight: "70px",
				boxShadow: "5px 5px 10px rgba(0, 0, 0, 0.2)",
				width: "50px",
			}}>
			<img src={`/classic/${cardType}.svg`} style={{width: "70px"}} />
		</Card>
	);
};

export default PlayableCard;
