import {useContext, useEffect, useState} from "react";
import {Stack, Container, Col, Row, Button, Card, Placeholder} from "react-bootstrap";
import {Link, Navigate, useNavigate} from "react-router-dom";
import {SocketContext} from "../contexts/SocketContext";
import {PlayerContext} from "../contexts/PlayerContext";
import PlayerCardHolder from "../components/PlayerCardHolder";
import PlayerCard from "../components/PlayerCard";
import {GameContext} from "../contexts/GameContext";
const GameWaitingArea = () => {
	const {socket, roomCode, setRoomCode} = useContext(SocketContext);
	const {player, setPlayer} = useContext(PlayerContext);
	const {gameOptions, setGameOptions} = useContext(GameContext);
	const [userList, setUserList] = useState([]);
	const navigate = useNavigate();

	useEffect(() => {
		if (!socket.connected) {
			socket.connect();
		}
		// why are we creting a new roomcode and a new playerobject ??
		//might need to revisit how we pass state and data
		socket.on("connect", () => {
			//console.log("Socket connected:", socket.id);
			if (!roomCode) {
				const newRoomCode = socket.id.substring(0, 7);
				setRoomCode(newRoomCode);
				//console.log("ROOMCODE", newRoomCode);
			} else {
				const playerNewObj = {
					name: player.name,
					avatar: player.avatar,
					socketID: socket.id,
					room: roomCode,
					isLeader: player.isLeader,
					preorderEnabled: gameOptions.preorder,
				};
				socket.emit("joinRoom", [roomCode, socket.id, playerNewObj]);
			}
		});

		socket.on("updateUserList", (updatedUserList) => {
			//console.log("Updated user list received:", updatedUserList);
			//makes sure that a leader is always assigned if not present at first
			setUserList(updatedUserList);
		});
		socket.on("updateLocalPlayer", (locaPlayer) => {
			setPlayer(locaPlayer);
		});

		socket.on("navigateToGameRoomR", (roomCode) => {
			navigate(`/play/${roomCode}`);
		});

		return () => {
			socket.off("connect");
			socket.off("updateLocalPlayer");
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
				preorderEnabled: gameOptions.preorder,
			};
			socket.emit("joinRoom", [roomCode, socket.id, playerNewObj]);
		}
	}, [roomCode, socket, player]);

	return (
		<Container className="d-flex justify-content-center align-items-center vh-100">
			<Col xs={12} sm={10} md={8} lg={6} xl={4} className="bg-green-300 rounded-3 shadow-lg p-4">
				<Stack gap={4}>
					<div className="text-center">
						<h4>Waiting for other players</h4>
						<h5 className="text-muted pt-1">Game code: {roomCode}</h5>
					</div>

					<div className="d-flex flex-column gap-3">
						<Row className="g-3">
							<Col xs={6}>{userList[0] ? <PlayerCard player={userList[0]} /> : <PlayerCardHolder />}</Col>
							<Col xs={6}>{userList[1] ? <PlayerCard player={userList[1]} /> : <PlayerCardHolder />}</Col>
						</Row>
						<Row className="g-3">
							<Col xs={6}>{userList[2] ? <PlayerCard player={userList[2]} /> : <PlayerCardHolder />}</Col>
							<Col xs={6}>{userList[3] ? <PlayerCard player={userList[3]} /> : <PlayerCardHolder />}</Col>
						</Row>
					</div>

					<Row className="align-items-center g-3">
						<Col xs={8}>
							<Button
								variant={userList.length < 4 ? "secondary" : "success"}
								onClick={() => {
									if (userList.length >= 4) {
										socket.emit("navigateToGameRoom", roomCode);
										navigate(`/play/${roomCode}`);
									}
								}}
								disabled={userList.length < 4 || !player.isLeader}
								className="w-100">
								Play Now
							</Button>
						</Col>
						<Col xs={4} className="text-center">
							<span className="fs-5">{userList.length}/4</span>
						</Col>
					</Row>
				</Stack>
			</Col>
		</Container>
	);
};

export default GameWaitingArea;

// GameWaitingArea.jsx;
//NEW IDEA BITCHES : SET THE SOCKET CONNECTION AND STATE IN APP ON LOAD OR NOT ON LOAD(AUTO CONNECT IS FALSE IN SERVER IO CONFIG) AND THEN USE THAT IN ANY ROUTE IN THE APP COMPONENT
