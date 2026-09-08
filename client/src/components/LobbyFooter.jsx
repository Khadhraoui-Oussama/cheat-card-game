import {Link} from "react-router-dom";

const LobbyFooter = () => {
	return (
		<div className="d-flex align-items-center justify-content-center gap-3">
			<Link className="link-btn" to="/tutorial">
				How to play
			</Link>
			<span className="text-faint" style={{color: "var(--text-faint)"}}>
				·
			</span>
			<Link className="link-btn" to="/feedback">
				Feedback
			</Link>
		</div>
	);
};

export default LobbyFooter;
