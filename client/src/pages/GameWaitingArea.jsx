import { Stack, Container, Col, Row, Button, Card, Placeholder } from "react-bootstrap";

const GameWaitingArea = () => {
	return (
		<Container className="w-75 vh-100 flex align-items-center ">
			<Stack className="flex align-items-center ">
				<h4>Waiting for other players status</h4>
				<h5>Game code XXXYYYZZZ</h5>
			</Stack>
			<Stack className="flex align-items-center w-50 m-auto ">
				<Row className="w-100">
					<Col>
						<Card className="w-50 m-auto">
							<Card.Img src="/client/src/assets/avatars/m1.svg" />

							<Placeholder as={Card.Title} animation="glow">
								<Placeholder className="w-100 bg-warning" />
							</Placeholder>
						</Card>
					</Col>
					<Col>
						<Card className="w-50 m-auto">
							<Card.Img src="/client/src/assets/classic/AC.svg" />

							<Placeholder as={Card.Title} animation="glow">
								<Placeholder className="w-100 bg-warning" />
							</Placeholder>
						</Card>
					</Col>
				</Row>
				<Row className="w-100">
					<Col>
						<Card className="w-50 m-auto">
							<Card.Img src="/client/src/assets/avatars/w10.svg" />

							<Placeholder as={Card.Title} animation="glow">
								<Placeholder className="w-100 bg-warning" />
							</Placeholder>
						</Card>
					</Col>
					<Col>
						<Card className="w-50 m-auto">
							<Card.Img src="/client/src/assets/avatars/m1.svg" />
							<Placeholder as={Card.Title} animation="glow">
								<Placeholder className="w-100 bg-warning" />
							</Placeholder>
						</Card>
					</Col>
				</Row>
				<Row className=" w-100 ">
					<Col>
						<Button className="m-auto w-100">Play Now</Button>
					</Col>
					<Col className="m-auto text-center ">
						<span className="m-auto w-100">2/4</span>
					</Col>
				</Row>
			</Stack>
		</Container>
	);
};

export default GameWaitingArea;
