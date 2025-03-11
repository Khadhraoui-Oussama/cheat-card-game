import {Button} from "react-bootstrap";

const PlayerAvatarInGrid = ({avatarPath, score}) => {
	return (
		<>
			<div className="d-flex flex-column justify-content-center items-center">
				<div className="d-flex gap-1 justify-content-center items-center">
					<img src={`/avatars/${avatarPath}`} width={50} />
					<h6>{score}</h6>
				</div>
				<div className="gap 1">
					<Button variant="danger" size="sm">
						Accuse
					</Button>
					<Button variant="success" disabled size="sm">
						Preorder
					</Button>
				</div>
			</div>
		</>
	);
};

export default PlayerAvatarInGrid;
