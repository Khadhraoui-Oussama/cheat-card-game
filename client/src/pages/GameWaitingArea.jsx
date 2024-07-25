import { useContext, useEffect, useState } from "react";
import { Stack, Container, Col, Row, Button, Card, Placeholder } from "react-bootstrap";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { SocketContext } from "../contexts/SocketContext";
import { PlayerContext } from "../contexts/PlayerContext";
import PlayerCardHolder from "../components/PlayerCardHolder";
import PlayerCard from "../components/PlayerCard";
const GameWaitingArea = () => {
	const { socket, roomCode, setRoomCode } = useContext(SocketContext);
	const { player } = useContext(PlayerContext);
	const [userList, setUserList] = useState([]);
	const navigate = useNavigate();

	useEffect(() => {
		if (!socket.connected) {
			socket.connect();
		}

		socket.on("connect", () => {
			console.log("Socket connected:", socket.id);
			if (!roomCode) {
				const newRoomCode = socket.id.substring(0, 7);
				setRoomCode(newRoomCode);
				console.log("ROOMCODE", newRoomCode);
			} else {
				const playerNewObj = {
					name: player.name,
					avatar: player.avatar,
					socketID: socket.id,
					room: roomCode,
					isLeader: player.isLeader,
				};
				socket.emit("joinRoom", [roomCode, socket.id, playerNewObj]);
			}
		});

		socket.on("updateUserList", (updatedUserList) => {
			console.log("Updated user list received:", updatedUserList);
			setUserList(updatedUserList);
		});

		socket.on("navigateToGameRoomR", (roomCode) => {
			navigate(`/play/${roomCode}`);
		});

		return () => {
			socket.off("connect");
			socket.off("updateUserList");
			socket.off("navigateToGameRoomR");
		};
	}, [socket, player, roomCode, setRoomCode]);

	useEffect(() => {
		if (socket.connected && roomCode) {
			const playerNewObj = {
				name: player.name,
				avatar: player.avatar,
				socketID: socket.id,
				room: roomCode,
				isLeader: player.isLeader,
			};
			socket.emit("joinRoom", [roomCode, socket.id, playerNewObj]);
		}
	}, [roomCode, socket, player]);

	return (
		<Container className="w-75 vh-100 flex align-items-center ">
			<Stack className="flex align-items-center ">
				<h4>Waiting for other players To Join the room</h4>
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
						<Button
							className="m-auto w-100"
							variant={userList.length < 4 ? "secondary" : "success"}
							onClick={() => {
								if (userList.length >= 4) {
									socket.emit("navigateToGameRoom", roomCode);
									navigate(`/play/${roomCode}`); // Navigate programmatically
								}
							}}
							disabled={userList.length < 4 || !player.isLeader} //the button is disabled for all the users when the users joined in are less than 4 and only activated to the leader of the room
						>
							Play Now
						</Button>
					</Col>
					<Col className="m-auto text-center ">
						<span className="m-auto w-100">{userList.length}/4</span>
					</Col>
				</Row>
			</Stack>
		</Container>
	);
};

export default GameWaitingArea;

GameWaitingArea.jsx;
//NEW IDEA BITCHES : SET THE SOCKET CONNECTION AND STATE IN APP ON LOAD OR NOT ON LOAD(AUTO CONNECT IS FALSE IN SERVER IO CONFIG) AND THEN USE THAT IN ANY ROUTE IN THE APP COMPONENT
