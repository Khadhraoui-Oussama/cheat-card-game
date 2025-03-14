import {useContext, useState} from "react";
import {Button, Col, Form, FormControl, FormGroup, FormLabel, FormSelect, Image, Row, Stack} from "react-bootstrap";
import {GameContext} from "../contexts/GameContext";
import {PlayerContext} from "../contexts/PlayerContext";
import {Link} from "react-router-dom";

const GameOptionsSelect = () => {
	const [isPasswordVisible, setIsPassowrdVisible] = useState(false);
	//const {} = useContext(GameContext);
	const {setIsOpen, player, setPlayer} = useContext(PlayerContext);
	const {gameOptions, setGameOptions} = useContext(GameContext);

	return (
		<Stack className="popup-container ">
			<Stack className="popup p-2" gap={2}>
				<h3>Select game options</h3>
				<Form>
					<Stack>
						<Col>
							<Form.Check
								type="checkbox"
								label="Allow Preorders"
								checked={gameOptions.preorder}
								onChange={() =>
									setGameOptions((prev) => ({
										...prev,
										preorder: !prev.preorder,
									}))
								}
							/>
							{/* <Form.Check type="checkbox" label="Power-Ups" /> */}
							<Stack direction="horizontal" gap={2}>
								<FormLabel>Cards Suit</FormLabel>
								<FormSelect>
									<option>Classic</option>
								</FormSelect>
							</Stack>
							<FormLabel className="pt-2">More suits coming soon !!!</FormLabel>

							<Stack direction="horizontal" className="d-flex justify-center" gap={2}>
								<Button onClick={() => setIsOpen(false)}>Cancel</Button>
								<Link
									to="/wa/"
									// onClick={() => console.log("going to game waiting area")}
								>
									<Button
										onClick={() => {
											setIsOpen(false);

											console.log("Player before starting :", player);
										}}>
										Play Now
									</Button>
								</Link>
							</Stack>
						</Col>
					</Stack>
				</Form>
			</Stack>
		</Stack>
	);
};

export default GameOptionsSelect;
