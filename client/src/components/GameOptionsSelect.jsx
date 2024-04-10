import { useState } from "react";
import {
	Button,
	Col,
	Form,
	FormControl,
	FormGroup,
	FormLabel,
	FormSelect,
	Image,
	Row,
	Stack,
} from "react-bootstrap";
const GameOptionsSelect = () => {
	//todo conditionaly render show /hide password
	const [isPasswordVisible, setIsPassowrdVisible] = useState(false);
	return (
		<Stack>
			<h3>Select game options</h3>
			<Form>
				<Stack>
					<Col>
						<Form.Check type="checkbox" label="Preorder" />
						<Form.Check type="checkbox" label="Power-Ups" />
						<Stack direction="horizontal" gap={2}>
							<FormLabel>Cards Suit</FormLabel>
							<FormSelect>
								<option>Classic</option>
								<option>More suits coming next</option>
							</FormSelect>
						</Stack>
						<Form.Check type="checkbox" label="Enable Password" />
						<Stack direction="horizontal" gap={2}>
							<Form.Control
								type={isPasswordVisible ? "text" : "password"}
								placeholder="game room password"
							/>

							<Button
								className="bg-warning d-flex "
								onClick={() => setIsPassowrdVisible((prev) => !prev)}>
								{isPasswordVisible && (
									<img
										src="./src/assets/password_icons/eye-slash-solid.png"
										width={25}
										height={20}
									/>
								)}
								{!isPasswordVisible && (
									<img
										src="./src/assets/password_icons/eye-solid.png"
										height={20}
										width={25}
									/>
								)}
							</Button>
						</Stack>
						<Stack direction="horizontal">
							<Button>Cancel</Button>
							<Button>Play Now</Button>
						</Stack>
					</Col>
				</Stack>
			</Form>
		</Stack>
	);
};

export default GameOptionsSelect;
