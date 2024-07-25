import { useContext, useEffect, useState } from "react";
import { SocketContext } from "../contexts/SocketContext";
import "../index.css";
import { io } from "socket.io-client";
import PlayerCard from "../components/PlayerCard";

const GameRoom = () => {
	const { socket, roomCode } = useContext(SocketContext);
	const [style, setStyle] = useState({
		maxWidth: "200px",
		minHeight: "200px",
		backgroundColor: "red",
		cursor: "pointer",
	});
	const [usersinRoom, setUsersInRoom] = useState([]);
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
			setStyle({ ...style, backgroundColor: newColor });
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
			<div style={{ display: "inline-flex" }}>
				{usersinRoom?.map((user) => {
					return <PlayerCard player={user} key={user.socketID} />;
				})}
			</div>
		</>
	);
};

export default GameRoom;
