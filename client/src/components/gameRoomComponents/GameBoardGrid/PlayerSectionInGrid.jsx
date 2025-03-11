import React from "react";
import {Card, Placeholder, Button} from "react-bootstrap";

const PlayerSectionInGrid = ({avatar, playerName, isLoading}) => {
	return (
		<div className="row-start-2 col-start-2 flex flex-col justify-center items-center">
			{isLoading ? (
				<>
					{/* Placeholder for avatar */}
					<Placeholder as="div" animation="glow">
						<Placeholder className="rounded-circle " style={{width: "60px", height: "60px"}} />
					</Placeholder>
					{/* Placeholder for name */}

					<Placeholder animation="glow">
						<Placeholder xs={7} className="rounded-md" style={{width: "3.5rem", height: "1rem"}} />
					</Placeholder>
				</>
			) : (
				<>
					{/* Actual avatar */}
					<div className="w-9 h-9 bg-green-300 rounded-full mx-auto flex justify-center items-center  pb-1">
						<img src={avatar} width="40" alt={`${playerName}'s avatar`} />
					</div>
					{/* Player name */}
					<h6>{playerName}</h6>
				</>
			)}
			{/* Accuse button, only visible when not loading */}
			{!isLoading && <button className="mt-1 bg-red-500 text-white rounded-md shadow-md">Accuse</button>}
		</div>
	);
};

export default PlayerSectionInGrid;

// const PlayerSectionInGrid = (props) => {
// 	return (
// 		<div className="row-start-2 col-start-2 flex justify-center items-center">
// 			<div className="text-center flex flex-col items-center">
// 				<div className="w-9 h-9 bg-green-300 rounded-full mx-auto flex justify-center items-center  pb-1">
// 					<img src={props.avatar} width={40} />
// 				</div>
// 				<h6>{props.playerName}</h6>
// 				<button className="mt-1 bg-red-500 text-white rounded-md shadow-md">Accuse</button>
// 			</div>
// 		</div>
// 	);
// };

// export default PlayerSectionInGrid;
