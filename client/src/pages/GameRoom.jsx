import {useContext, useEffect, useState} from "react";
import {SocketContext} from "../contexts/SocketContext";
import "../index.css";
import {io} from "socket.io-client";
import PlayerCard from "../components/PlayerCard";
import PlayableCard from "../components/gameRoomComponents/PlayableCard";

const GameRoom = () => {
	const {socket, roomCode} = useContext(SocketContext);
	const [style, setStyle] = useState({
		maxWidth: "100px",
		minHeight: "100px",
		backgroundColor: "red",
		//display: "inline-block",
		cursor: "pointer",
	});
	const [usersinRoom, setUsersInRoom] = useState([]);
	const [cards, setCards] = useState(["AC", "2C", "3C", "4C", "5C", "6C", "7C", "8C", "9C", "TC", "JC", "QC"]);
	// const [cards, setCards] = useState([
	// 	"AC",
	// 	"2C",
	// 	"3C",
	// 	"4C",
	// 	"5C",
	// 	"6C",
	// 	"7C",
	// 	"8C",
	// 	"9C",
	// 	"TC",
	// 	"JC",
	// 	"QC",
	// 	"KC",
	// 	"AD",
	// 	"2D",
	// 	"3D",
	// 	"4D",
	// 	"5D",
	// 	"6D",
	// 	"7D",
	// 	"8D",
	// 	"9D",
	// 	"TD",
	// 	"JD",
	// 	"QD",
	// 	"KD",
	// 	"AH",
	// 	"2H",
	// 	"3H",
	// 	"4H",
	// 	"5H",
	// 	"6H",
	// 	"7H",
	// 	"8H",
	// 	"9H",
	// 	"TH",
	// 	"JH",
	// 	"QH",
	// 	"KH",
	// 	"AS",
	// 	"2S",
	// 	"3S",
	// 	"4S",
	// 	"5S",
	// 	"6S",
	// 	"7S",
	// 	"8S",
	// 	"9S",
	// 	"TS",
	// 	"JS",
	// 	"QS",
	// 	"KS",
	// ]);

	useEffect(() => {
		if (!socket.connected) {
			socket.connect();
		}

		socket.emit("getUsersInRoom", roomCode);
		socket.on("getUsersInRoomR", (usersArray) => {
			setUsersInRoom(usersArray);
			console.log("users in the room array: ", usersArray);
		});

		socket.on("updateUserList", (usersArray) => {
			setUsersInRoom(usersArray);
		});

		socket.on("changeBoxColor", (newColor) => {
			setStyle({...style, backgroundColor: newColor});
		});

		return () => {
			socket.off("changeBoxColor");
			socket.off("getUsersInRoomR");
			socket.off("updateUserList");
		};
	}, [socket]);

	return (
		<>
			<h5>Welcome to the Game Room</h5>
			<div
				style={style}
				onClick={() => {
					socket.emit("changeBoxColor", [roomCode, style.backgroundColor]);
				}}></div>
			<div style={{display: "inline-flex"}}>
				{usersinRoom?.map((user) => {
					return <PlayerCard player={user} key={user.socketID} />;
				})}
			</div>
			<br />
			<h5>These are your cards :</h5>
			<div
				style={{
					display: "inline-flex",
					border: "dashed violet 4px",
					minWidth: "75vw",
					minHeight: "200px",
				}}>
				{cards.map((card) => {
					return <PlayableCard cardType={card} key={card} />;
				})}
			</div>
		</>
	);
};

export default GameRoom;
