import React, {useState, useEffect, useContext} from "react";
import "./GameBoardGrid.css";
import {SocketContext} from "../../../contexts/SocketContext";
import {Button, ButtonGroup, Container, Placeholder, Stack, Card} from "react-bootstrap";
import PlayerAvatarInGrid from "./PlayerAvatarInGrid";

/*
THIS IS FOR THE PREVIOUS LOGIC OF GAMEBOARD WILL BE IMPORTED HERE FOR LAYOUT REASONS 
*/
import {DndContext, DragOverlay, pointerWithin} from "@dnd-kit/core";
import {useSensor, useSensors, MouseSensor, TouchSensor, KeyboardSensor} from "@dnd-kit/core";
import {arrayMove, SortableContext, sortableKeyboardCoordinates} from "@dnd-kit/sortable";
import SortableItem from "../SortableItem";
import DroppableArea from "../DroppableArea";

/** END **/
import LastCardDisplay from "../LastCardDisplay";
import PowerupAnimation from "../PowerupAnimation/PowerupAnimation";
import PlayerSelectionModal from "../PlayerSelectionModal/PlayerSelectionModal";
import CardsRevealModal from "../CardsRevealModal/CardsRevealModal";
import ChatBox from "../ChatBox/ChatBox";
import LastCardModal from "../../LastCardModal/LastCardModal";
import {useNavigate} from "react-router-dom";
import QuitGameModal from "../../QuitGameModal/QuitGameModal";
import DisconnectModal from "../../DisconnectModal/DisconnectModal";
import "./themes.css";
import SettingsModal from "../../SettingsModal/SettingsModal";
import GameOverModal from "../GameOverModal/GameOverModal";

const GameBoardGrid = () => {
	/** PREVIOUS GAMEBOARD LOGIC HERE  **/
	const [yourCards, setYourCards] = useState([]);
	const [cardsToPlay, setCardsToPlay] = useState([]); //cards that the player needs to confirm to play
	const [activeId, setActiveId] = useState();
	const [localPlayer, setLocalPlayer] = useState({});
	const [otherPlayers, setOtherPlayers] = useState([]);

	// dnd-kit sensor setup
	const mouseSensor = useSensor(MouseSensor);
	const touchSensor = useSensor(TouchSensor);
	const keyboardSensor = useSensor(KeyboardSensor, {
		coordinateGetter: sortableKeyboardCoordinates,
	});

	const sensors = useSensors(mouseSensor, touchSensor, keyboardSensor);

	const handleDragStart = (event) => {
		const {active} = event;
		setActiveId(active.id);
	};

	const handleDragEnd = (event) => {
		const {active, over} = event;

		if (!over) {
			setActiveId(null);
			return;
		}

		// Get container IDs
		const activeContainer = active.data.current?.sortable.containerId;
		const overContainer = over.id === "your-cards" || over.id === "cards-to-play" ? over.id : over.data.current?.sortable.containerId;

		if (activeContainer === overContainer) {
			// Handle same container sorting
			const items = activeContainer === "your-cards" ? yourCards : cardsToPlay;
			const setItems = activeContainer === "your-cards" ? setYourCards : setCardsToPlay;

			const oldIndex = items.indexOf(active.id);
			const newIndex = items.indexOf(over.id);

			if (oldIndex !== -1 && newIndex !== -1) {
				setItems(arrayMove(items, oldIndex, newIndex));
			}
		} else if (overContainer) {
			// Handle moving between containers
			const sourceItems = activeContainer === "your-cards" ? yourCards : cardsToPlay;
			const setSourceItems = activeContainer === "your-cards" ? setYourCards : setCardsToPlay;
			const targetItems = overContainer === "your-cards" ? yourCards : cardsToPlay;
			const setTargetItems = overContainer === "your-cards" ? setYourCards : setCardsToPlay;

			setSourceItems(sourceItems.filter((item) => item !== active.id));
			setTargetItems([...targetItems, active.id]);
		}

		setActiveId(null);
	};
	// useEffect(() => {
	// 	console.log("Your cards:", yourCards);
	// 	console.log("Cards to play:", cardsToPlay);
	// }, [yourCards, cardsToPlay]);

	/** END PREVIOUS GAMEBOARD LOGIC **/

	//TODO THE CLOCK SOULD BE SERVER SIDE FOR SYNCHRONUZATION
	//TODO START THE GAME LOGIC

	const {socket, roomCode} = useContext(SocketContext);
	const [usersinRoom, setUsersInRoom] = useState([]);

	const [isPlayersDataLoading, setIsPlayersDataLoading] = useState(true); // Add loading state for player avatar placeholders until their avatar loads

	const [gameStarted, setGameStarted] = useState(false);
	const [localPlayerHasTurn, setLocalPlayerHasTurn] = useState(false);
	const [currentTurnPlayer, setCurrentTurnPlayer] = useState(null);
	const [eventMessage, setEventMessage] = useState("All game events will be displayed here.");
	const [currentCardValuePlaying, setCurrentCardValuePlaying] = useState(null);
	const [lastPlayedPlayer, setLastPlayedPlayer] = useState(null);
	const [lastCardPresented, setLastCardPresented] = useState(null);

	// Add state for animation
	const [showPowerupAnimation, setShowPowerupAnimation] = useState(false);
	const [powerupAnimationId, setPowerupAnimationId] = useState(null);
	const [powerupAnimationName, setPowerupAnimationName] = useState("");
	const [lastPowerupReceiver, setLastPowerupReceiver] = useState(null);
	const [showCardsReveal, setShowCardsReveal] = useState(false);
	const [revealedCards, setRevealedCards] = useState({cards: [], playerName: ""});

	// Add gameOver state
	const [gameOver, setGameOver] = useState(false);
	const [showLastCardModal, setShowLastCardModal] = useState(false);
	const [winner, setWinner] = useState(null);
	const [orderedRestOfPlayersForGamOver, setOrderedRestOfPlayersForGameOver] = useState([]);
	const [showDisconnectModal, setShowDisconnectModal] = useState(false);
	const [disconnectedPlayer, setDisconnectedPlayer] = useState(null);
	const [showGameOverModal, setShowGameOverModal] = useState(false);

	useEffect(() => {
		if (!socket.connected) {
			socket.connect();
		}

		//THIS GETS ALL THE USERS IN THE ROOM

		const getPlayerAndOthers = (usersArray) => {
			const player = usersArray.find((user) => user.socketID === socket.id);
			setLocalPlayer(player);
			const others = usersArray.filter((user) => user.socketID !== socket.id);
			setOtherPlayers(others);
		};

		socket.emit("getUsersInRoom", roomCode);
		socket.on("getUsersInRoomR", (usersArray) => {
			setUsersInRoom(usersArray);
			setIsPlayersDataLoading(false); // Data is loaded, stop showing placeholders
			getPlayerAndOthers(usersArray);
			// console.log("users in the room array: ", usersArray);
		});

		socket.on("updateUserList", (updatedUserList) => {
			if (updatedUserList.length < 4) {
				const disconnectedPlayer = usersinRoom.find((player) => !updatedUserList.find((p) => p.socketID === player.socketID));
				setDisconnectedPlayer(disconnectedPlayer);
				setShowDisconnectModal(true);
			}
			setUsersInRoom(updatedUserList);
		});
		socket.on("startGameR", (roomCode) => {
			// console.log("Game started in room:", roomCode);
			setGameStarted(true);
			setGameOver(false);
		});

		socket.on("updateLocalPlayer", (player) => {
			setLocalPlayer(player);
			setYourCards(player.cards);
			// console.log("Local player updated:", player);
		});

		socket.on("updateTurn", (data) => {
			setIsNewTurn(data.newTurnStatus);
			setLocalPlayerHasTurn(data.currentPlayer === socket.id);
			setCurrentTurnPlayer(data.currentPlayer);
			// Only update lastPlayedPlayer if cards were actually played
			if (data.lastPlayedPlayer !== null) {
				setLastPlayedPlayer(data.lastPlayedPlayer);
			}
		});
		socket.on("gameOver", (data) => {
			const {winner, players} = data;

			// Set winner
			setWinner(winner);

			// Sort and set other players
			const otherPlayers = players.filter((player) => player.socketID !== winner.socketID).sort((a, b) => a.cardsLeft - b.cardsLeft);

			setOrderedRestOfPlayersForGameOver(otherPlayers);
			setTimeLeft(0);
			setGameOver(true);
			setShowGameOverModal(true); // Make sure this is set to true
			setEventMessage(`Game Over! Winner is ${winner.name}`);

			console.log("Game Over Data:", {
				winner,
				orderedPlayers: otherPlayers,
				showModal: true,
			});
		});

		socket.on("receiveCards", (player) => {
			//console.log("Received my cards:", player.cards); // Log the received cards
			// Extract the array from the playerCards property
			setYourCards(player.cards); // Use the playerCards array or empty array as fallback
			setLocalPlayer(player);
		});
		socket.on("accusePlayer", (data) => {
			// {cardsPlayedArray, cardValueTold}
			const {roomCode, socketID, accusedPlayerID} = data;
			socket.emit("accuse", {roomCode, socketID, accusedPlayerID});
			//console.log("accusing player:", {roomCode, socketID, accusedPlayerID});
		});
		socket.on("updateGameEventMessage", (message) => {
			setEventMessage(message);
		});
		socket.on("updateNewTurnStatus", (status) => {
			setIsNewTurn(status);
		});
		socket.on("lastCardPresented", (data) => {
			setLastCardPresented(data);
			if (data.isFinalCard) {
				setShowLastCardModal(true);
			}
		});
		// Update the playPowerupDice socket handler
		socket.on("playPowerupDice", (data) => {
			console.log("Powerup received data:", data);
			setPowerupAnimationId(data.powerUpID);
			if (data.powerUpID == 0) {
				setPowerupAnimationName("True Vision");
			} else if (data.powerUpID == 1) {
				setPowerupAnimationName("Cleanse");
			} else if (data.powerUpID == 2) {
				setPowerupAnimationName("Skip Player");
			}
			setLastPowerupReceiver(data.accuserName);
			setShowPowerupAnimation(true);

			// Update powerup button state using data directly from event
			if (data.accuserID === socket.id) {
				setEnablePowerupsButtonState((prev) => ({
					...prev,
					[data.powerUpID]: prev[data.powerUpID] + 1,
				}));
			}
		});
		socket.on("playerDisconnected", ({remainingPlayers, disconnectedPlayer}) => {
			setUsersInRoom(remainingPlayers);
			setDisconnectedPlayer(disconnectedPlayer);
			setShowDisconnectModal(true);

			// Stop any ongoing timers or game states
			setTimeLeft(0);
			setGameStarted(false);
			setGameOver(true);
		});

		return () => {
			socket.off("getUsersInRoomR");
			socket.off("updateUserList");
			socket.off("updateTurn");
			socket.off("gameOver");
			socket.off("receiveCards");
			socket.off("updateLocalPlayer");
			socket.off("lastCardPresented");
			socket.off("startGameR");
			socket.off("playerDisconnected");
		};
	}, [socket]);

	// useEffect(() => {
	// 	console.log("Current Player:", localPlayer);
	// 	console.log("Other Players:", otherPlayers);
	// }, [localPlayer, otherPlayers]);

	//WE HAVE LOCAL PLAYER WHICH IS US , AND THE OTHER PLAYERS IN THE ROOM IN otherPlayers ARRAY

	// Update the startGame function to handle both new games and rematches
	const startGame = () => {
		socket.emit("startGame", {roomCode: roomCode, socketID: socket.id});
		// Reset necessary game states
		setGameOver(false);
		setTimeLeft(30);
		setYourCards([]);
		setCardsToPlay([]);
		setEventMessage("All game events will be displayed here.");

		// If the local player is the leader, set their turn immediately
		if (localPlayer?.isLeader) {
			setLocalPlayerHasTurn(true);
			setIsNewTurn(true);
			setCurrentTurnPlayer(socket.id);
		}
	};

	const handleStartAnotherGame = () => {
		// Reset local game states
		setGameOver(false);
		setGameStarted(false);
		setYourCards([]);
		setCardsToPlay([]);
		setEventMessage("All game events will be displayed here.");

		// Emit start game event
		socket.emit("startGame", {roomCode, socketID: socket.id});
	};

	//THIS WORKS DONT CHANGE IT
	const handleCancelTurn = () => {
		// Clear the cards-to-play area
		setYourCards([...yourCards, ...cardsToPlay]);
		setCardsToPlay([]);
		//console.log("Turn cancelled");
	};
	/********  END    ********/

	//TODO IMPLEMENT A FUNCTION THAT TAKES IN THE CARDS IN THE CARDS-TO-PLAY ARRAY AND SENDS THEM TO THE SERVER EITHER WHEN THE TIMER RUNS OUT OR WHEN CONFIRM BUTTON IS CLICKED ,FOR NOW MAKE ONLY CONFIRM BUTTON WORK
	//hasTurn is a boolean that is true when it is the player's turn
	const handleConfirmTurn = () => {
		if (!localPlayerHasTurn || cardsToPlay.length === 0) {
			return;
		}

		// Check if player is trying to play all cards except their last one
		if (yourCards.length === 0 && cardsToPlay.length > 1) {
			setEventMessage("You must keep at least one card in your hand!");
			return;
		}

		// Handle final card play
		if (yourCards.length === 0 && cardsToPlay.length === 1) {
			// Get card value for the final play
			const selectElement = document.getElementById("newSelectedCardToPlay");
			let lastCardValue;
			if (isNewTurn) {
				lastCardValue = selectElement?.value;
			} else {
				lastCardValue = null;
			}
			console.log("****last cardValueTOld", lastCardValue);
			let cardValueTold = lastCardValue;
			socket.emit("makeMove", {
				roomCode,
				socketID: socket.id,
				cardsPlayedArray: cardsToPlay,
				isNewTurn,
				cardValueTold,
				isFinalCard: true,
			});
		} else {
			// Normal turn
			let cardValueTold = null;
			const selectElement = document.getElementById("newSelectedCardToPlay");
			if (selectElement && isNewTurn) {
				cardValueTold = selectElement.value;
			}

			socket.emit("makeMove", {
				roomCode,
				socketID: socket.id,
				cardsPlayedArray: cardsToPlay,
				isNewTurn,
				cardValueTold,
				isFinalCard: false,
			});
		}

		setCardsToPlay([]);
		setLocalPlayerHasTurn(false);
		setIsNewTurn(false);
	};

	const PlayerPlaceholder = () => (
		<Card style={{width: "150px"}}>
			<Card.Body>
				<Placeholder as={Card.Text} animation="glow">
					<Placeholder xs={10} />
				</Placeholder>
				<Placeholder.Button variant="success" xs={6} />
				<Placeholder.Button variant="danger" xs={6} />
			</Card.Body>
		</Card>
	);

	const [isNewTurn, setIsNewTurn] = useState(false); //to be updtaed when the player wins the accusation wether accuser or accused
	const [enablePowerupsButtonState, setEnablePowerupsButtonState] = useState({0: 0, 1: 0, 2: 0});

	// Separate timer-related state and effects
	const [timeLeft, setTimeLeft] = useState(30);

	// Add a dedicated effect for timer-related socket events
	useEffect(() => {
		socket.on("updateTimer", (newTimeLeft) => {
			setTimeLeft(newTimeLeft);
		});

		socket.on("turnTimedOut", () => {
			if (localPlayerHasTurn) {
				setYourCards((prevCards) => [...prevCards, ...cardsToPlay]);
				setCardsToPlay([]);
				setEventMessage("Time's up! Cards returned to hand.");
			}
			setLocalPlayerHasTurn(false);
		});

		return () => {
			socket.off("updateTimer");
			socket.off("turnTimedOut");
		};
	}, [socket, localPlayerHasTurn, cardsToPlay]);

	// Add these handler functions before the return statement
	const handleTrueVisionPowerup = () => {
		if (enablePowerupsButtonState[0] > 0) {
			setCurrentPowerupAction("trueVision");
			setShowPlayerSelection(true);
		}
	};

	const handleCleansePowerup = () => {
		if (enablePowerupsButtonState[1] > 0) {
			socket.emit("usePowerup", {
				type: "cleanse",
				powerupId: 1,
				roomCode,
				userId: socket.id,
			});
		}
	};

	const handleSkipPlayerPowerup = () => {
		if (enablePowerupsButtonState[2] > 0) {
			setCurrentPowerupAction("skipPlayer");
			setShowPlayerSelection(true);
		}
	};

	// Add to your existing socket event listeners
	useEffect(() => {
		socket.on("revealCards", ({cards, playerName}) => {
			setEventMessage(`${playerName}'s cards were: ${cards.join(", ")}`);
			setRevealedCards({cards: cards, playerName: playerName});
			setShowCardsReveal(true);
		});

		socket.on("powerupUsed", ({type, powerupId}) => {
			setEnablePowerupsButtonState((prev) => ({
				...prev,
				[powerupId]: prev[powerupId] - 1,
			}));
		});

		return () => {
			socket.off("revealCards");
			socket.off("powerupUsed");
		};
	}, [socket]);

	// Add these states
	const [showPlayerSelection, setShowPlayerSelection] = useState(false);
	const [currentPowerupAction, setCurrentPowerupAction] = useState(null);

	// Add the handler for player selection
	const handlePlayerSelect = (selectedPlayer) => {
		if (currentPowerupAction === "skipPlayer") {
			// Check if selected player has current turn
			if (selectedPlayer.socketID === currentTurnPlayer) {
				socket.emit("usePowerup", {
					type: "skipPlayer",
					powerupId: 2,
					roomCode,
					userId: socket.id,
					targetId: selectedPlayer.socketID,
				});
			} else {
				setEventMessage("Can't skip this player's turn as they don't have the current turn!");
			}
		} else if (currentPowerupAction === "trueVision") {
			socket.emit("usePowerup", {
				type: "trueVision",
				powerupId: 0,
				roomCode,
				userId: socket.id,
				targetId: selectedPlayer.socketID,
			});
		}
		setShowPlayerSelection(false);
		setCurrentPowerupAction(null);
	};

	// Add new state
	const [canAccuse, setCanAccuse] = useState(true);
	const [currentAccusation, setCurrentAccusation] = useState(null);

	// Add to your existing useEffect or create new one
	useEffect(() => {
		socket.on("accusationStarted", (data) => {
			setCanAccuse(false);
			setCurrentAccusation(data);
			setEventMessage(`${data.accuserName} is accusing ${data.accusedName}!`);
		});

		socket.on("accusationResolved", () => {
			setCanAccuse(true);
			setCurrentAccusation(null);
		});

		return () => {
			socket.off("accusationStarted");
			socket.off("accusationResolved");
		};
	}, [socket]);

	// Add these states at the top of your component
	const [showQuitModal, setShowQuitModal] = useState(false);
	const navigate = useNavigate();

	// Add these handlers
	const handleQuitGame = () => {
		setShowQuitModal(true);
	};

	const handleConfirmQuit = () => {
		socket.emit("leaveRoom", roomCode);
		navigate("/");
	};

	// Add these states at the top of your component
	const [showSettings, setShowSettings] = useState(false);
	const [theme, setTheme] = useState("light");

	// Add theme change handler
	const handleThemeChange = (newTheme) => {
		setTheme(newTheme);
		localStorage.setItem("gameTheme", newTheme); // Save theme preference
	};

	// Add this to your existing useEffect or create a new one
	useEffect(() => {
		const savedTheme = localStorage.getItem("gameTheme");
		if (savedTheme) {
			setTheme(savedTheme);
		}
	}, []);

	return (
		<DndContext sensors={sensors} collisionDetection={pointerWithin} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
			<div className="position-relative">
				<div className={`container1 theme-${theme}`}>
					{/* first row */}
					<div className="d-flex justify-center items-center">
						<Button variant="info" onClick={() => setShowSettings(true)}>
							Settings
						</Button>
					</div>
					<div className=" col-span-2 d-flex justify-center items-center bg-cyan-200 rounded-2xl">{eventMessage}</div>
					<div className="d-flex justify-center items-center">
						<Button variant="danger" onClick={handleQuitGame}>
							Quit Game
						</Button>
					</div>
					{/* second row */}
					<div className="col-span-4 d-flex justify-around">{isPlayersDataLoading ? <p className="d-flex items-center text-center">Player Loading ...</p> : <PlayerAvatarInGrid playerObject={otherPlayers[0]} localPlayer={localPlayer} hasCurrentTurn={otherPlayers[0]?.socketID === currentTurnPlayer} hasLastPlayed={otherPlayers[0]?.socketID === lastPlayedPlayer} canAccuse={canAccuse && lastPlayedPlayer !== null} />}</div>
					{/* third row */}
					<div className="col-span-4 d-flex justify-center gap-1">
						<div className="col-span-4 d-flex justify-around items-center">{isPlayersDataLoading ? <p className="d-flex items-center text-center">Player Loading ...</p> : <PlayerAvatarInGrid playerObject={otherPlayers[1]} localPlayer={localPlayer} hasCurrentTurn={otherPlayers[1]?.socketID === currentTurnPlayer} hasLastPlayed={otherPlayers[1]?.socketID === lastPlayedPlayer} />}</div>
						<div className="w-1/3 d-flex justify-center items-center bg-amber-100 rounded-2xl ">
							{localPlayerHasTurn ? (
								<DroppableArea
									id="cards-to-play"
									items={cardsToPlay}
									style={{
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										position: "relative",
										width: "100%",
										maxWidth: "800px",
										padding: "10px 0",
										backgroundColor: "var(--droppable-bg)",
										margin: "10px auto",
										minHeight: "100px",
										cursor: "default",
									}}
									customDroppableAreaLabel={"Drag your cards here to play your move."}
								/>
							) : (
								<img src="../../../../cardPile.svg" width={200} />
							)}
						</div>
						<div className="col-span-4 d-flex justify-center items-center">{isPlayersDataLoading ? <p className="d-flex items-center text-center">Player Loading ...</p> : <PlayerAvatarInGrid localPlayer={localPlayer} playerObject={otherPlayers[2]} hasCurrentTurn={otherPlayers[2]?.socketID === currentTurnPlayer} hasLastPlayed={otherPlayers[2]?.socketID === lastPlayedPlayer} />}</div>
					</div>
					<div className="col-span-4 d-flex justify-around">{!gameOver && <div className={`text-2xl font-bold ${timeLeft > 10 ? "text-green-600" : timeLeft > 5 ? "text-yellow-600" : "text-red-600"}`}>{timeLeft > 0 ? `Time left : ${timeLeft}s` : "Time's up!"}</div>}</div>
					{/* third row */}
					<div className="col-span-2 h-100 d-flex flex-column ">
						<ChatBox socket={socket} roomCode={roomCode} playerName={localPlayer?.name} />
					</div>
					<div className="d-flex flex-col justify-center items-center">
						{!gameStarted || gameOver ? (
							localPlayer?.isLeader ? (
								<Button variant="success" onClick={gameOver ? handleStartAnotherGame : startGame}>
									{gameOver ? "Start Another Game" : "Start Game"}
								</Button>
							) : (
								<p>Waiting for the leader to start the game</p>
							)
						) : (
							<DroppableArea
								id="your-cards"
								items={Array.isArray(yourCards) ? yourCards : []} // Ensure items is always an array
								style={{
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									position: "relative",
									width: "100%",
									maxWidth: "800px",
									padding: "10px 0",
									backgroundColor: "var(--droppable-bg)",
									margin: "10px auto",
									minHeight: "100px",
									cursor: "default",
								}}
								customDroppableAreaLabel={"Drag your cards here to keep them in your hand"}
							/>
						)}
						{/* {console.log("isNewTurn", isNewTurn, " localPlayerHasTurn", localPlayerHasTurn)} */}
						{isNewTurn && localPlayerHasTurn ? (
							<div className="d-flex justify-center items-center gap-2 p-2 mb-2 bg-amber-200 text-blue-950">
								<label htmlFor="newSelectedCardToPlay">Ech Habetet : </label>
								<select id="newSelectedCardToPlay">
									{["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"].map((card) => (
										<option key={card} value={card}>
											{(() => {
												switch (card) {
													case "A":
														return "Ace";
													case "J":
														return "Jack";
													case "Q":
														return "Queen";
													case "K":
														return "King";
													default:
														return card;
												}
											})()}
										</option>
									))}
								</select>
							</div>
						) : null}
						<div className="d-flex justify-center items-center gap-2">
							<Button variant="success" disabled={!localPlayerHasTurn || cardsToPlay.length === 0} onClick={handleConfirmTurn}>
								Confirm
							</Button>
							<Button variant="danger" disabled={cardsToPlay.length === 0} onClick={handleCancelTurn}>
								Cancel
							</Button>
						</div>
					</div>
					<div>
						<ul className="d-flex flex-column gap-4 justify-center" style={{height: "100%"}}>
							{/* <li>
								<Button disabled={enablePowerupsButtonState[0] === 0} onClick={handleShieldPowerup} title="Protect yourself from the next accusation">
									Shield : {enablePowerupsButtonState[0]}
								</Button>
							</li> */}
							<li>
								<Button disabled={enablePowerupsButtonState[0] === 0} onClick={handleTrueVisionPowerup} title="See the last played cards' true values">
									True Vision : {enablePowerupsButtonState[0]}
								</Button>
							</li>
							<li>
								<Button disabled={enablePowerupsButtonState[1] === 0} onClick={handleCleansePowerup} title="Remove all preorders on you">
									Cleanse : {enablePowerupsButtonState[1]}
								</Button>
							</li>
							<li>
								<Button disabled={enablePowerupsButtonState[2] === 0} onClick={handleSkipPlayerPowerup} title="Skip the current player's turn">
									Skip a player : {enablePowerupsButtonState[2]}
								</Button>
							</li>
						</ul>
					</div>
				</div>
				<LastCardModal show={showLastCardModal} onHide={() => setShowLastCardModal(false)} lastCardInfo={lastCardPresented} />
			</div>
			<DragOverlay>{activeId ? <SortableItem id={activeId} title={activeId} /> : null}</DragOverlay>
			<PowerupAnimation
				isVisible={showPowerupAnimation}
				powerUpID={powerupAnimationId}
				onAnimationComplete={() => {
					setShowPowerupAnimation(false);
					setEventMessage(`Powerup ${powerupAnimationName} granted! to ${lastPowerupReceiver}`);
				}}
			/>
			<PlayerSelectionModal show={showPlayerSelection} onHide={() => setShowPlayerSelection(false)} players={otherPlayers} onSelect={handlePlayerSelect} actionType={currentPowerupAction} />
			<CardsRevealModal show={showCardsReveal} onHide={() => setShowCardsReveal(false)} cards={revealedCards.cards} playerName={revealedCards.playerName} />
			<QuitGameModal show={showQuitModal} onHide={() => setShowQuitModal(false)} onConfirm={handleConfirmQuit} />
			<DisconnectModal show={showDisconnectModal} playerName={disconnectedPlayer?.name} />
			<SettingsModal show={showSettings} onHide={() => setShowSettings(false)} currentTheme={theme} onThemeChange={handleThemeChange} />
			<GameOverModal show={showGameOverModal} onHide={() => setShowGameOverModal(false)} winner={winner} otherPlayers={orderedRestOfPlayersForGamOver} />
		</DndContext>
	);
};
//TODO ADD ECH HABETET SECTION AND ADD BUTTON FOR CONFIRM / CANCEL TURN DONE
//THE TURN ENDS WITH CONFIRM OR WITH THE CLOCK TIME RUNNING OUT
//IF THE TIMER RUNS AND THE PLAYER HAS NOT CONFIRMED HIS MOVE THE TURN IS AUTOMATICALLY PASSED
// AND START WORKING ON THE GAME LOGIC
//DONE ADD BUTTON TO START GAME BY LEADER
//START GAME AND GET SHUFFLED CARDS TO EACH SOCKET PRIVATELY
//ISSUE : DISABLE POSSIBLITY TO CREATE GAMEROOMS WITH CUSTOM ROOMCODES
//TODO IMPLEMENT DIFFERENT SVGS FOR THE PILE BASED ON HOW MANY CARDS ARE IN THE PILE

export default GameBoardGrid;
