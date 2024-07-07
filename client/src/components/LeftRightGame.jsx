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
	const [boxColor, setBoxColor] = useState("blue");
	const handleClick = () => {
		socket?.emit("changeColor");
	};
	useEffect(() => {
		socket?.on("changeColor", () => {
			// Toggle between blue and red
			setBoxColor((prevColor) => (prevColor === "blue" ? "red" : "blue"));
		});
		return () => {
			socket?.off("changeColor");
		};
	}, [socket]);

	const boxStyle = {
		display: "inline-block",
		width: "200px",
		height: "200px",
		margin: "20px",
		backgroundColor: boxColor,
		textAlign: "center",
		lineHeight: "100px",
		fontSize: "24px",
		cursor: "pointer",
	};
	return (
		<>
			<h2>Click on the box to change its fill color</h2>
			<div id="box" style={boxStyle} onClick={() => handleClick()}></div>
		</>
	);
};

export default LeftRightGame;
