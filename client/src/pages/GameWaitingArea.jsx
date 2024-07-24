import { useContext, useEffect, useState } from "react";
import { Stack, Container, Col, Row, Button, Card, Placeholder } from "react-bootstrap";
import { Link } from "react-router-dom";
import { io } from "socket.io-client";
import { SocketContext } from "../contexts/SocketContext";
import { PlayerContext } from "../contexts/PlayerContext";
import PlayerCardHolder from "../components/PlayerCardHolder";
import PlayerCard from "../components/PlayerCard";
const GameWaitingArea = () => {
	const { socket, setSocket, roomCode, setRoomCode } = useContext(SocketContext);
	const { player, setPlayer } = useContext(PlayerContext);
	const [userList, setUserList] = useState([]); // State to store the players in the room ( waiting area for now)

	console.log("ROOMCODE", roomCode);

	//INTIALIZE SOCKET ONLY AND DISCONNECT IT WHEN THE GameWaitingArea COMPONENET UNMOUNTS
	useEffect(() => {
		// url of render backend : https://card-game-zcy5.onrender.com
		// io(url) connects to the socket io server at the url
		const newSocket = io("http://localhost:5000"); // same port the socket.io server will listen to ,change if needed
		setSocket(newSocket);
		newSocket.on("connect", () => {
			console.log("socket connected :", newSocket.id); //
			if (!roomCode) {
				const a = newSocket.id.substring(0, 7);
				setRoomCode(a);
				console.log("ROOMCODE", a);
			}
		});

		// Listen for updateUserList event
		newSocket.on("updateUserList", (updatedUserList) => {
			console.log("Updated user list received:", updatedUserList);
			setUserList(updatedUserList);
		});

		return () => {
			if (newSocket) {
				console.log("socket disconnected : ", newSocket.id);
				newSocket.disconnect();
			}
		};
	}, []);
	// Emit joinRoom event when roomCode is set
	useEffect(() => {
		if (socket && roomCode) {
			const playerNewObj = { name: player.name, avatar: player.avatar };
			console.log("***socket.id before emiting to joinRoom", socket.id);
			socket.emit("joinRoom", [roomCode, socket.id, playerNewObj]);
		}
	}, [socket, roomCode]);

	return (
		<Container className="w-75 vh-100 flex align-items-center ">
			<Stack className="flex align-items-center ">
				<h4>Waiting for other players status</h4>
				<h5>Game code {roomCode}</h5>
			</Stack>
			<Stack className="flex align-items-center w-50 m-auto ">
				<Row className="w-100">
					<Col>
						{userList[0] ? <PlayerCard player={userList[0]} /> : <PlayerCardHolder />}
					</Col>
					<Col>
						{userList[1] ? <PlayerCard player={userList[1]} /> : <PlayerCardHolder />}
					</Col>
				</Row>
				<Row className="w-100">
					<Col>
						{userList[2] ? <PlayerCard player={userList[2]} /> : <PlayerCardHolder />}
					</Col>
					<Col>
						{userList[3] ? <PlayerCard player={userList[3]} /> : <PlayerCardHolder />}
					</Col>
				</Row>
				<Row className=" w-100 ">
					<Col>
						<Link to="/play">
							<Button
								className="m-auto w-100"
								onClick={() => {
									console.log("playing game");
								}}>
								Play Now
							</Button>
						</Link>
					</Col>
					<Col className="m-auto text-center ">
						<span className="m-auto w-100">2/4</span>
					</Col>
				</Row>
			</Stack>
		</Container>
	);
};

export default GameWaitingArea;
