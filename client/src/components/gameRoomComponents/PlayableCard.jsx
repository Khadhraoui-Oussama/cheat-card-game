const PlayableCard = ({cardType}) => {
	return (
		<div className="playable-card">
			<img src={`/classic/${cardType}.svg`} alt={cardType} draggable="false" />
		</div>
	);
};

export default PlayableCard;
