import {Card, Placeholder, Spinner} from "react-bootstrap";

const PlayerCardHolder = () => {
	return (
		<Card className="w-50 m-auto shadow-2xl" style={{height: "100%"}}>
			<Spinner animation="border" role="img" className="m-auto pt-3">
				<span className="visually-hidden">Loading Player Image...</span>
			</Spinner>
			<Placeholder as={Card.Title} animation="glow">
				<Placeholder className="w-100 bg-info" />
			</Placeholder>
		</Card>
	);
};

export default PlayerCardHolder;
