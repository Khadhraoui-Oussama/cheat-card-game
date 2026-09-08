const PlayerCard = ({player}) => {
	return (
		<div className="seat filled">
			{player.isLeader && <span className="seat-badge">Host</span>}
			<div className="seat-avatar">
				<img src={player.avatar} alt="" />
			</div>
			<div className="seat-name">{player.name}</div>
		</div>
	);
};

export default PlayerCard;
