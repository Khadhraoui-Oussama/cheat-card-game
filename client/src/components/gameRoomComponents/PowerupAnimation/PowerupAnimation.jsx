import {useEffect, useRef, useState} from "react";
import {POWERUPS, powerupById} from "../../../utils/powerups";
import "./PowerupAnimation.css";

/*
	The reel that hands out a powerup after a correct accusation.

	It is a real slot machine rather than a list that swaps places: the strip
	only ever travels one way, the step delays start short and grow, so the
	transform never finishes before the next step early on (a blur) and settles
	into distinct beats at the end. The number of steps is chosen so the strip
	comes to rest on the powerup that was actually rolled, instead of snapping
	to it once the spin is over.
*/
const REEL_REPEATS = 6; // enough copies of the strip for the longest spin
const MIN_TURNS = 4;
const REEL_STRIP = Array.from({length: REEL_REPEATS}, () => POWERUPS).flat();

const stepDelay = (step, steps) => 28 + Math.round(210 * (step / steps) ** 3);

const PowerupAnimation = ({roll, onAnimationComplete}) => {
	const [step, setStep] = useState(0);
	const [phase, setPhase] = useState("spinning");
	// The overlay can be clicked away mid-spin, and the timers keep running, so
	// the finish is guarded rather than fired twice.
	const settledRef = useRef(false);

	const complete = () => {
		if (settledRef.current) return;
		settledRef.current = true;
		onAnimationComplete?.();
	};

	useEffect(() => {
		if (!roll) return undefined;

		settledRef.current = false;
		setStep(0);
		setPhase("spinning");

		const landing = ((roll.powerUpID % POWERUPS.length) + POWERUPS.length) % POWERUPS.length;
		const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

		if (prefersReducedMotion) {
			setStep(landing);
			setPhase("locked");
			const settle = setTimeout(complete, 2200);
			return () => clearTimeout(settle);
		}

		// Whole turns of the strip, plus however many places are left to land
		// exactly on the winner.
		const steps = POWERUPS.length * MIN_TURNS + landing;
		const timers = [];
		let elapsed = 0;

		for (let index = 1; index <= steps; index++) {
			elapsed += stepDelay(index, steps);
			timers.push(
				setTimeout(() => {
					setStep(index);
					if (index === steps) setPhase("locked");
				}, elapsed)
			);
		}

		timers.push(setTimeout(complete, elapsed + 1500));
		return () => timers.forEach(clearTimeout);
	}, [roll]);

	if (!roll) return null;

	const powerup = powerupById(roll.powerUpID) ?? POWERUPS[0];
	const accused = roll.accusedName || "the last player";
	const accuser = roll.isMine ? "You" : roll.accuserName || "The accuser";
	const locked = phase === "locked";

	// Said plainly, and from the point of view of whoever is reading it.
	const winner = roll.isMine ? "you" : roll.accuserName || "they";
	const namedWinner = !roll.isMine && roll.accuserName;
	const headline = roll.isMine ? `You called ${accused}'s bluff` : `${roll.accuserName || "Somebody"} called ${accused}'s bluff`;
	const consequence = `${accused} picks up the pile, and ${winner} ${namedWinner ? "rolls" : "roll"} for a powerup.`;
	const verdict = roll.isMine ? `You won ${powerup.name}` : `${roll.accuserName || "They"} won ${powerup.name}`;

	return (
		<div className="powerup-overlay" role="dialog" aria-live="polite" aria-label={`${headline}. ${locked ? verdict : "Rolling for a powerup"}`} onClick={complete}>
			<div className={`powerup-card ${phase}`}>
				<span className="powerup-eyebrow">Accusation upheld</span>
				<h3 className="powerup-headline">{headline}</h3>
				<p className="powerup-consequence">{consequence}</p>

				<div className="powerup-reel" aria-hidden="true">
					<div className="powerup-reel-track" style={{transform: `translateY(calc(${-step} * var(--slot-h)))`}}>
						{REEL_STRIP.map((slot, index) => (
							<div className="powerup-slot" key={`${slot.id}-${index}`}>
								<span className="powerup-slot-icon">{slot.icon}</span>
								<span className="powerup-slot-name">{slot.name}</span>
							</div>
						))}
					</div>
				</div>

				{locked ? (
					<div className="powerup-result">
						<strong>{verdict}</strong>
						<p>{powerup.description}</p>
					</div>
				) : (
					<p className="powerup-rolling">
						{accuser} {roll.isMine ? "are" : "is"} rolling
						<span className="dots">
							<span />
							<span />
							<span />
						</span>
					</p>
				)}
			</div>
		</div>
	);
};

export default PowerupAnimation;
