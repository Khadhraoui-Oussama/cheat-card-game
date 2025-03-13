import "../index.css";
import {useContext, useEffect, useState} from "react";
import {PlayerContext} from "../contexts/PlayerContext";
import {Alert, Button, Col, Container, Row, Stack} from "react-bootstrap";
import GameOptionsSelect from "../components/GameOptionsSelect";
import PlayerInfoSelect from "../components/PlayerInfoSelect";
import JoinGameRoomSection from "../components/JoinGameRoomSection";
import LobbyFooter from "../components/LobbyFooter";
import {Popup} from "reactjs-popup";
import {SocketContext} from "../contexts/SocketContext";

const LandingPage = () => {
	const {player, setPlayer, isCreateGame, validatePLayerInfo, openPopup, setIsOpen, isOpen, inputError} = useContext(PlayerContext);

	const {socket, roomCode, setRoomCode} = useContext(SocketContext);
	const [joinAlert, setJoinAlert] = useState(false);

	useEffect(() => {
		setPlayer({playerSocket: socket, name: "", gender: "male", avatar: "", isLeader: true});
		setRoomCode();
	}, []); //ON MOUNT SET THE PLAYER OBJECT TO THE ABOVE , WHAT HAPPENS WHEN THE PLAYER DISCONNECTS AND COMES BACK PROBABLY NEED TO ACCESS INTERNAL SOTRAGE

	const handleCreateNewRoom = () => {
		// Clear any existing room code when creating a new game
		setRoomCode("");
		// Emit getRoomSize with empty string to generate new room
		socket.emit("getRoomSize", "");
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
		<Container className="d-flex justify-content-center align-items-center vh-100">
			<Col xs={12} sm={10} md={8} lg={6} xl={4} className="bg-fuchsia-200 rounded-3 shadow-lg">
				<Stack gap={3} className="p-4">
					<PlayerInfoSelect />
					<JoinGameRoomSection />
					<div className="d-flex justify-content-center">
						<Button
							onClick={handleCreateNewRoom}
							style={{minWidth: "200px"}} // Adjust width as needed
						>
							Create a new game
						</Button>
					</div>
					{joinAlert && (
						<Alert key="danger" variant="danger">
							Looks like there is already a room with that code, Please try another code.
						</Alert>
					)}
					<Popup open={isOpen} modal nested position="center" onClose={() => setIsOpen(false)}>
						<GameOptionsSelect />
					</Popup>
					<LobbyFooter />
					{inputError && (
						<Alert key="danger" variant="danger">
							Some input fields are missing, please Make sure to select an avatar and choose a name between 3 and 20 characters
						</Alert>
					)}
				</Stack>
			</Col>
		</Container>
	);
};

export default LandingPage;
