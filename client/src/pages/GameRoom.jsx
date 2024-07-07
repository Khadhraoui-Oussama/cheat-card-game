import { useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { PlayerContext } from "../contexts/PlayerContext";
import LeftRightGame from "../components/LeftRightGame";
import "../index.css";
const GameRoom = () => {
	const [socket, setSocket] = useState(null);
	const [onlineUsers, setOnlineUsers] = useState([]);
	const { player, setPlayer, selectedAvatarPath, setSelectedAvatarPath } =
		useContext(PlayerContext);
	//initialize socket
	useEffect(() => {
		const newSocket = io("https://card-game-zcy5.onrender.com"); // same port the socket.io server will listen to ,change if needed
		setSocket(newSocket);
		//cleanup function for when we are no longer using the socket or we aretrying to reconnect
		return () => {
			if (newSocket) {
				newSocket.emit("removeUser", player);
				newSocket.disconnect();
			}
		};
	}, []);
	//add online user status
	useEffect(() => {
		if (socket === null) return;
		socket.emit("addNewUser", player);
		console.log("player before sending to socket server", player);
		socket.on("getOnlineUsers", (res) => {
			setOnlineUsers(res);
		});
		return () => {
			socket.off("getOnlineUsers");
		};
	}, [socket, player]);
	const notificationStyle = {
		color: "red",
	};
	const notificationStyle2 = {
		color: "green",
	};
	return (
		<>
			<h5>Welcome to the Game Room</h5>
			<h6>Users in the Room : </h6>
			{onlineUsers.map((user) => {
				return (
					<div className="playerBox" key={user.name}>
						<p>{user.name}</p>
						<img src={`/${user.avatar}`}></img>
					</div>
				);
			})}
			{onlineUsers.length < 2 && socket ? (
				<h5 style={notificationStyle}>Waiting for the other player to Join</h5>
			) : (
				<div>
					<h5 style={notificationStyle2}>Starting the Game</h5>
					<LeftRightGame socket={socket} setSocket={setSocket} players={onlineUsers} />
				</div>
			)}
		</>
	);
};

export default GameRoom;
