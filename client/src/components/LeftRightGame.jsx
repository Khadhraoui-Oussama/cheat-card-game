// import { useEffect, useState } from "react";
// import { io } from "socket.io-client";

// const LeftRightGame = ({socket,setSocket, players }) => {

// 	const turn = Math.floor(Math.random() * 2);

// 	useEffect(() => {
// 		const newSocket = io("http://localhost:5000");
// 		setSocket(newSocket);
// 		return () => {
// 			newSocket.disconnect();
// 		};
// 	}, []);

// 	const handleBoxClick = (box) => {
// 		if (socket) {
// 			socket.emit("boxClicked", { box, player: players[turn]? });
// 		}
// 	};

// 	const boxStyle = {
// 		display: "inline-block",
// 		width: "100px",
// 		height: "100px",
// 		margin: "20px",
// 		backgroundColor: "#ccc",
// 		textAlign: "center",
// 		lineHeight: "100px",
// 		fontSize: "24px",
// 		cursor: "pointer",
// 	};

// 	return (
// 		<>
// 			<h2>Guess which Box I clicked: the left or the right one?</h2>
// 			<h3>It's {players[turn]??.name}'s turn</h3>
// 			<div style={{ display: "flex", justifyContent: "center" }}>
// 				<div style={boxStyle} onClick={() => handleBoxClick("left")}>
// 					Left
// 				</div>
// 				<div style={boxStyle} onClick={() => handleBoxClick("right")}>
// 					Right
// 				</div>
// 			</div>
// 		</>
// 	);
// };

// export default LeftRightGame;

import { useEffect, useState } from "react";

const LeftRightGame = ({ socket, players }) => {
	const [turn, setTurn] = useState(null);
	const [winner, setWinner] = useState(null);
	const [clickedBox, setClickedBox] = useState(null);

	useEffect(() => {
		socket?.on("startGame", ({ firstTurn }) => {
			setTurn(firstTurn);
		});

		socket?.on("boxClicked", ({ box, player }) => {
			setClickedBox({ box, player });
		});

		socket?.on("gameWinner", (winner) => {
			setWinner(winner);
		});

		return () => {
			socket?.off("startGame");
			socket?.off("boxClicked");
			socket?.off("gameWinner");
		};
	}, [socket]);

	const handleBoxClick = (box) => {
		if (turn && players[turn]?.isTurn) {
			socket.emit("boxClicked", { box, player: players[turn] });
		}
	};

	return (
		<>
			<h2>Guess which Box I clicked: the left or the right one?</h2>
			{!winner && (
				<>
					<h3>It's {players[turn]?.name}'s turn</h3>
					<div style={{ display: "flex", justifyContent: "center" }}>
						<div
							style={boxStyle}
							onClick={() => handleBoxClick("left")}
							disabled={!players[turn]?.isTurn}>
							Left
						</div>
						<div
							style={boxStyle}
							onClick={() => handleBoxClick("right")}
							disabled={!players[turn]?.isTurn}>
							Right
						</div>
					</div>
				</>
			)}
			{winner && <h3>{winner.name} wins!</h3>}
		</>
	);
};

const boxStyle = {
	display: "inline-block",
	width: "100px",
	height: "100px",
	margin: "20px",
	backgroundColor: "#ccc",
	textAlign: "center",
	lineHeight: "100px",
	fontSize: "24px",
	cursor: "pointer",
};

export default LeftRightGame;
