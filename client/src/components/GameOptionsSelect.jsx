import {useContext} from "react";
import {Button, Form} from "react-bootstrap";
import {GameContext} from "../contexts/GameContext";
import {PlayerContext} from "../contexts/PlayerContext";
import {Link} from "react-router-dom";

const GameOptionsSelect = () => {
	const {setIsOpen} = useContext(PlayerContext);
	const {gameOptions, setGameOptions} = useContext(GameContext);

	return (
		<div className="options-dialog">
			<div className="options-head">
				<span className="eyebrow">New game</span>
				<h3>Table rules</h3>
			</div>

			<Form className="options-body">
				<label className="option-row">
					<div>
						<div className="option-title">Allow preorders</div>
						<p className="option-help">Players can queue an accusation against someone before their turn comes around.</p>
					</div>
					<Form.Check
						type="switch"
						checked={gameOptions.preorder}
						onChange={() =>
							setGameOptions((prev) => ({
								...prev,
								preorder: !prev.preorder,
							}))
						}
					/>
				</label>

				<div className="option-row">
					<div>
						<div className="option-title">Card suit</div>
						<p className="option-help">More decks are on the way.</p>
					</div>
					<Form.Select style={{maxWidth: "150px"}}>
						<option>Classic</option>
					</Form.Select>
				</div>
			</Form>

			<div className="options-foot">
				<Button variant="secondary" onClick={() => setIsOpen(false)}>
					Cancel
				</Button>
				<Link to="/wa/">
					<Button variant="success" onClick={() => setIsOpen(false)}>
						Play now
					</Button>
				</Link>
			</div>
		</div>
	);
};

export default GameOptionsSelect;
