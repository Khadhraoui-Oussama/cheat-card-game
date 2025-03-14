import React, {useEffect, useState} from "react";
import "./PowerupAnimation.css";

const PowerupAnimation = ({isVisible, powerUpID, onAnimationComplete}) => {
	const [currentIndex, setCurrentIndex] = useState(0);
	const powerups = ["True Vision", "Cleanse", "Skip Another's Turn"];
	//true vision :0, cleanse: 1, skip another's turn: 2
	const finalPowerup = powerups[powerUpID];

	useEffect(() => {
		if (isVisible) {
			const animationDuration = 1000; // 1 second
			const totalSteps = 6;
			const intervalTime = animationDuration / totalSteps;

			let step = 0;
			const interval = setInterval(async () => {
				setCurrentIndex((prev) => (prev + 1) % powerups.length);
				step++;

				if (step === totalSteps) {
					clearInterval(interval);
					setCurrentIndex(powerUpID); // Ensure final selection
					setTimeout(onAnimationComplete, 1000);
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
