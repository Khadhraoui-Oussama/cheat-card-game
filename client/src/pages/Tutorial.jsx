import {Link} from "react-router-dom";
import {POWERUPS} from "../utils/powerups";

const RULES = [
	{
		title: "Everyone gets 13 cards",
		body: "Four players, one shuffled deck. The first player to get rid of their hand wins the round.",
	},
	{
		title: "Call a value, play your cards",
		body: "On a fresh turn you announce a card value — Ace, 7, Queen, anything. Drag the cards you want to play into the middle. They go face down, so nobody knows whether you told the truth.",
	},
	{
		title: "Everyone after you must follow",
		body: "Once a value is on the table, the following players have to play that same value — or bluff and pretend they did.",
	},
	{
		title: "Accuse a liar",
		body: "Think the last player cheated? Hit Accuse on their pod. If they lied, they pick up the pile. If they were honest, you do.",
	},
	{
		title: "Preorder the accusation you can't make yet",
		body: "Sure somebody is about to bluff? Preorder them. Any player can, at any moment of the round — you do not need the turn, and you do not need them to have played yet. The instant they put cards down, your accusation fires on its own.",
	},
	{
		title: "One claim each, one claim per player",
		body: "You only ever hold one preorder at a time, and a player somebody has already claimed cannot be claimed again — so it is worth being first. Every claim on the table is wiped the moment any accusation is resolved, and Cleanse hands a claimed player their freedom back. The host can switch preorders off entirely in the game options.",
	},
	{
		title: "Win an accusation, win a powerup",
		body: "Every accusation you win rolls you one of the three powerups below, picked at random. Losing one gets you nothing, so a wild guess costs you the pile and buys you no consolation.",
	},
	{
		title: "Keep one card back",
		body: "You can never dump your whole hand at once — at least one card has to stay with you until the final play.",
	},
	{
		title: "Watch the clock",
		body: "Each turn is on a 30 second timer. Let it run out and your cards go straight back to your hand, turn wasted.",
	},
];

const Tutorial = () => {
	return (
		<div className="page-shell">
			<Link className="page-back" to="/">
				← Back to lobby
			</Link>
			<span className="eyebrow">How to play</span>
			<h1 className="brand-title" style={{fontSize: "clamp(1.8rem, 5vw, 2.6rem)", marginBottom: "0.4rem"}}>
				The rules of Cheat
			</h1>
			<p className="muted" style={{marginBottom: "2rem"}}>
				Lying is the whole point. Getting caught is the whole risk.
			</p>

			<div className="d-flex flex-column gap-3">
				{RULES.map((rule, index) => (
					<article className="rule-card" key={rule.title}>
						<span className="rule-num">{index + 1}</span>
						<div>
							<h3>{rule.title}</h3>
							<p>{rule.body}</p>
						</div>
					</article>
				))}
			</div>

			<span className="eyebrow" style={{display: "block", marginTop: "2.5rem"}}>
				The powerups
			</span>
			<h2 className="brand-title" style={{fontSize: "clamp(1.3rem, 3.5vw, 1.7rem)", margin: "0.3rem 0 0.4rem"}}>
				Three ways to bend a round
			</h2>
			<p className="muted" style={{marginBottom: "1.4rem"}}>
				You cannot buy these or start with them — a correct accusation is the only thing that hands one out, and which of the three you get is a dice roll. They stack up, and they keep until you spend them.
			</p>

			<div className="d-flex flex-column gap-3">
				{POWERUPS.map((powerup) => (
					<article className="rule-card" key={powerup.id}>
						<span className="rule-num icon" aria-hidden="true">
							{powerup.icon}
						</span>
						<div>
							<h3>{powerup.name}</h3>
							<p>{powerup.description}</p>
						</div>
					</article>
				))}
			</div>
		</div>
	);
};

export default Tutorial;
