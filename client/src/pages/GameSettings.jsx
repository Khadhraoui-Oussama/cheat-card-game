import {Link} from "react-router-dom";

const GameSettings = () => {
	return (
		<div className="page-shell">
			<Link className="page-back" to="/">
				← Back to lobby
			</Link>
			<span className="eyebrow">Settings</span>
			<h1 className="brand-title" style={{fontSize: "clamp(1.8rem, 5vw, 2.6rem)", marginBottom: "0.4rem"}}>
				Game settings
			</h1>
			<p className="muted">Table options live inside the game room — open the ⚙ button in the top bar while playing.</p>
		</div>
	);
};

export default GameSettings;
