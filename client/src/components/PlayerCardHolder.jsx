const PlayerCardHolder = () => {
	return (
		<div className="seat empty">
			<div className="seat-avatar" aria-hidden="true">
				<span style={{color: "var(--text-faint)", fontSize: "1.4rem"}}>?</span>
			</div>
			<div className="seat-empty-label">
				Waiting
				<span className="dots">
					<span />
					<span />
					<span />
				</span>
			</div>
		</div>
	);
};

export default PlayerCardHolder;
