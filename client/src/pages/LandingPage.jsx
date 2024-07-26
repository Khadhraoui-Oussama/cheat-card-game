import "../index.css";
import { useContext, useEffect, useState } from "react";
import { PlayerContext } from "../contexts/PlayerContext";
import { Alert, Button, Col, Container, Row, Stack } from "react-bootstrap";
import GameOptionsSelect from "../components/GameOptionsSelect";
import PlayerInfoSelect from "../components/PlayerInfoSelect";
import JoinGameRoomSection from "../components/JoinGameRoomSection";
import LobbyFooter from "../components/LobbyFooter";
import { Popup } from "reactjs-popup";
import { Socket } from "socket.io-client";
import { SocketContext } from "../contexts/SocketContext";

const LandingPage = () => {
	const {
		player,
		setPlayer,
		isCreateGame,
		validatePLayerInfo,
		openPopup,
		setIsOpen,
		isOpen,
		inputError,
	} = useContext(PlayerContext);
	const { socket, roomCode, setRoomCode } = useContext(SocketContext);
	const [joinAlert, setJoinAlert] = useState(false);

	useEffect(() => {
		setPlayer({ playerSocket: socket, name: "", gender: "male", avatar: "", isLeader: true });
		setRoomCode();
	}, []);
	const handleCreateNewRoom = () => {
		//TODO CHECK FOR THE AVATAR AND THE NAME IN THE PLAYER ARE SET BEFORE JOINING
		// min of avatar length
		socket.emit("getRoomSize", roomCode);
		socket.on("getRoomSizeR", (roomSize) => {
			if (roomSize) {
				setJoinAlert(true);
			} else {
				setJoinAlert(false);
				openPopup();
			}
		});
	};
	return (
		<Container>
			<Col>
				<Stack
					className="flex justify-items-center align-items-center vh-100 "
					style={{ border: "solid 2px blue" }}>
					<Stack
						gap={1}
						style={{ width: "80%", maxHeight: "90vh", border: "solid 2px red" }}
						className="m-auto pt-2">
						<PlayerInfoSelect />
						<JoinGameRoomSection />
						<Button
							onClick={() => {
								handleCreateNewRoom();
							}}>
							Create a new game
						</Button>
						{joinAlert && (
							<Alert key="danger" variant="danger">
								Looks like there is already a room with that code , Please try
								another code.
							</Alert>
						)}
						<Popup
							open={isOpen}
							modal
							nested
							position="center"
							onClose={() => setIsOpen(false)}>
							<GameOptionsSelect />
						</Popup>
						<LobbyFooter />
						{inputError && (
							<Alert key="danger" variant="danger">
								Some input fields are missing , please Make sure to select an avatar
								and choose a name between 3 and 20 characters
							</Alert>
						)}
					</Stack>
				</Stack>
			</Col>
		</Container>
	);
};

export default LandingPage;
