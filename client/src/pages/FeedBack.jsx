import {Link} from "react-router-dom";

const FeedBack = () => {
	return (
		<div className="page-shell">
			<Link className="page-back" to="/">
				← Back to lobby
			</Link>
			<span className="eyebrow">Feedback</span>
			<h1 className="brand-title" style={{fontSize: "clamp(1.8rem, 5vw, 2.6rem)", marginBottom: "0.4rem"}}>
				Tell us what broke
			</h1>
			<p className="muted" style={{marginBottom: "2rem"}}>
				This is a hobby project and it shows — bug reports and ideas are genuinely welcome.
			</p>

			<div className="rule-card">
				<span className="rule-num">?</span>
				<div>
					<h3>The form is not wired up yet</h3>
					<p>Until it is, open an issue on the project repository or grab whoever sent you the room code.</p>
				</div>
			</div>

			<div className="rule-card" style={{marginTop: "1rem"}}>
				<span className="rule-num">@</span>
				<div>
					<h3>Contact Oussama</h3>
					<p>
						<a href="mailto:khdh.oussama@gmail.com">khdh.oussama@gmail.com</a>
						<br />
						<a href="https://www.linkedin.com/in/khadhraoui-oussama/" target="_blank" rel="noreferrer">
							LinkedIn
						</a>
					</p>
				</div>
			</div>
		</div>
	);
};

export default FeedBack;
