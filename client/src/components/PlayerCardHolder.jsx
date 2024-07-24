import { Card, Placeholder, Spinner } from "react-bootstrap";

const PlayerCardHolder = () => {
	return (
		<Card className="w-50 m-auto">
			<Spinner animation="border" role="img" className="m-auto pt-3">
				<span className="visually-hidden">Loading Player Image...</span>
			</Spinner>
			<Placeholder as={Card.Title} animation="glow">
				<Placeholder className="w-100 bg-warning" />
			</Placeholder>
		</Card>
	);
};

export default PlayerCardHolder;
