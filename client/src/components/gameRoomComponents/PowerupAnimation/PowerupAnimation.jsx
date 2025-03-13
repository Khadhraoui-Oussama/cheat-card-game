import React, {useEffect, useState} from "react";
import "./PowerupAnimation.css";

const PowerupAnimation = ({isVisible, powerUpID, onAnimationComplete}) => {
	const [currentIndex, setCurrentIndex] = useState(0);
	const powerups = ["True Vision", "Cleanse", "Skip Another's Turn"];

	useEffect(() => {
		if (isVisible) {
			const animationDuration = 1000; // 1 second
			const steps = 15; // Number of "spins" before landing
			const intervalTime = animationDuration / steps;

			let step = 0;
			const interval = setInterval(() => {
				setCurrentIndex((prev) => (prev + 1) % powerups.length);
				step++;

				if (step === steps) {
					clearInterval(interval);
					setCurrentIndex(powerUpID);
					setTimeout(onAnimationComplete, 500);
				}
			}, intervalTime);

			return () => clearInterval(interval);
		}
	}, [isVisible, powerUpID]);

	if (!isVisible) return null;

	return (
		<div className="powerup-animation-overlay">
			<div className="powerup-animation-container">
				<div className="powerup-wheel">
					{powerups.map((powerup, index) => (
						<div key={powerup} className={`powerup-item ${index === currentIndex ? "active" : ""}`}>
							{powerup}
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default PowerupAnimation;
