import {useState, useEffect, useContext} from "react";
import "./GameBoardGrid.css";
import {SocketContext} from "../../../contexts/SocketContext";
import {Button} from "react-bootstrap";
import PlayerAvatarInGrid from "./PlayerAvatarInGrid";

/*
THIS IS FOR THE PREVIOUS LOGIC OF GAMEBOARD WILL BE IMPORTED HERE FOR LAYOUT REASONS
*/
import {DndContext, DragOverlay, pointerWithin} from "@dnd-kit/core";
import {useSensor, useSensors, MouseSensor, TouchSensor, KeyboardSensor} from "@dnd-kit/core";
import {arrayMove, sortableKeyboardCoordinates} from "@dnd-kit/sortable";
import PlayableCard from "../PlayableCard";
import DroppableArea from "../DroppableArea";

/** END **/
import PowerupAnimation from "../PowerupAnimation/PowerupAnimation";
import PlayerSelectionModal from "../PlayerSelectionModal/PlayerSelectionModal";
import CardsRevealModal from "../CardsRevealModal/CardsRevealModal";
import ChatBox from "../ChatBox/ChatBox";
import LastCardModal from "../../LastCardModal/LastCardModal";
import {useNavigate} from "react-router-dom";
import QuitGameModal from "../../QuitGameModal/QuitGameModal";
import "./themes.css";
import SettingsModal from "../../SettingsModal/SettingsModal";
import GameOverModal from "../GameOverModal/GameOverModal";
import ConnectionOverlay from "../../ConnectionOverlay/ConnectionOverlay";
import {clearSession, saveSession} from "../../../utils/session";
import {POWERUPS, powerupById} from "../../../utils/powerups";

const TURN_SECONDS = 30;

const CARD_LABELS = {A: "Ace", J: "Jack", Q: "Queen", K: "King"};

/*
	A player who left for good keeps their chair in the roster - the hand is
	still on the table - so the empty seats are read straight off the roster
	rather than tracked separately. Every roster the server sends (the initial
	list, an update, the board handed back on reconnect) is the whole truth.
*/
const openSeatsFrom = (roster) => (Array.isArray(roster) ? roster.filter((seat) => seat.awaitingReplacement).map(({playerId, name}) => ({playerId, name})) : []);

const TimerRing = ({seconds}) => {
	const radius = 19;
	const circumference = 2 * Math.PI * radius;
	const ratio = Math.max(0, Math.min(1, seconds / TURN_SECONDS));
	const tone = seconds > 10 ? "" : seconds > 5 ? "warn" : "urgent";

	return (
		<div className={`timer ${tone}`} title="Time left in this turn">
			<svg width="46" height="46" viewBox="0 0 46 46" aria-hidden="true">
				<circle className="track" cx="23" cy="23" r={radius} fill="none" strokeWidth="4" />
				<circle className="bar" cx="23" cy="23" r={radius} fill="none" strokeWidth="4" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - ratio)} />
			</svg>
			<span className="timer-value">{Math.max(0, seconds)}</span>
		</div>
	);
};

const GameBoardGrid = () => {
	/** PREVIOUS GAMEBOARD LOGIC HERE  **/
	const [yourCards, setYourCards] = useState([]);
	const [cardsToPlay, setCardsToPlay] = useState([]); //cards that the player needs to confirm to play
	const [activeId, setActiveId] = useState();
	const [localPlayer, setLocalPlayer] = useState({});
	const [otherPlayers, setOtherPlayers] = useState([]);

	// dnd-kit sensor setup
	const mouseSensor = useSensor(MouseSensor);
	const touchSensor = useSensor(TouchSensor, {
		activationConstraint: {delay: 100, tolerance: 20},
	});
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

	/** END PREVIOUS GAMEBOARD LOGIC **/

	//TODO THE CLOCK SOULD BE SERVER SIDE FOR SYNCHRONUZATION
	//TODO START THE GAME LOGIC

	const {socket, roomCode, playerId} = useContext(SocketContext);
	const [usersinRoom, setUsersInRoom] = useState([]);

	// "online" | "reconnecting" | "failed"
	const [connectionState, setConnectionState] = useState("online");
	const [connectionError, setConnectionError] = useState(null);
	const [awayPlayer, setAwayPlayer] = useState(null); // someone else mid-reconnect

	const [isPlayersDataLoading, setIsPlayersDataLoading] = useState(true); // Add loading state for player avatar placeholders until their avatar loads

	const [gameStarted, setGameStarted] = useState(false);
	const [showChat, setShowChat] = useState(false);
	const [localPlayerHasTurn, setLocalPlayerHasTurn] = useState(false);
	const [currentTurnPlayer, setCurrentTurnPlayer] = useState(null);
	const [currentCardValue, setCurrentCardValue] = useState(null);
	const [eventMessage, setEventMessage] = useState("All game events will be displayed here.");
	const [lastPlayedPlayer, setLastPlayedPlayer] = useState(null);
	const [lastCardPresented, setLastCardPresented] = useState(null);

	// The powerup roll in flight, or null: {powerUpID, accuserName, accusedName, isMine}
	const [powerupRoll, setPowerupRoll] = useState(null);
	const [showCardsReveal, setShowCardsReveal] = useState(false);
	const [revealedCards, setRevealedCards] = useState({cards: [], playerName: ""});

	// Add gameOver state
	const [gameOver, setGameOver] = useState(false);
	const [showLastCardModal, setShowLastCardModal] = useState(false);
	const [winner, setWinner] = useState(null);
	const [orderedRestOfPlayersForGamOver, setOrderedRestOfPlayersForGameOver] = useState([]);
	const [openSeats, setOpenSeats] = useState([]); // chairs waiting for a replacement
	// Who has claimed whom. Public, because a preorder is open to everyone at
	// the table and each player only ever holds one.
	const [preorders, setPreorders] = useState([]);
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

		socket.on("getUsersInRoomR", (usersArray) => {
			setUsersInRoom(usersArray);
			setOpenSeats(openSeatsFrom(usersArray));
			setIsPlayersDataLoading(false); // Data is loaded, stop showing placeholders
			getPlayerAndOthers(usersArray);
			// console.log("users in the room array: ", usersArray);
		});

		socket.on("updateUserList", (updatedUserList) => {
			// A short roster no longer means the game is over - a player may just
			// be mid-reconnect, or their chair may be standing empty waiting for
			// somebody to take it over.
			setUsersInRoom(updatedUserList);
			setOpenSeats(openSeatsFrom(updatedUserList));
			getPlayerAndOthers(updatedUserList);
		});
		socket.emit("getUsersInRoom", roomCode);
		socket.on("startGameR", (roomCode) => {
			// console.log("Game started in room:", roomCode);
			setGameStarted(true);
			setGameOver(false);
			setPreorders([]); // a fresh deal clears every claim
		});

		socket.on("preordersUpdated", (claims) => {
			setPreorders(Array.isArray(claims) ? claims : []);
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
			setLastPlayedPlayer(data.lastPlayedPlayer ?? null);
			setCurrentCardValue(data.currentCardValue ?? null);
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
			// The roll is shown to the whole room, so it carries who caught whom
			// and reads differently for the player who won it.
			setPowerupRoll({...data, isMine: data.accuserID === socket.id});

			// Update powerup button state using data directly from event
			if (data.accuserID === socket.id) {
				setEnablePowerupsButtonState((prev) => ({
					...prev,
					[data.powerUpID]: prev[data.powerUpID] + 1,
				}));
			}
		});
		/*
			Somebody is gone for good. The round is not over: the server keeps
			their chair and everything on it, so the table just waits here until
			a replacement (or the same player) sits down.
		*/
		socket.on("seatOpened", ({name, openSeats: seats}) => {
			setOpenSeats(seats ?? []);
			setAwayPlayer(null); // the grace countdown is over, no timer to show
			setEventMessage(`${name} left the table — waiting for someone to take their seat.`);
		});

		socket.on("seatFilled", ({name, replacedName, openSeats: seats}) => {
			setOpenSeats(seats ?? []);
			setEventMessage(replacedName ? `${name} took over ${replacedName}'s seat — play resumes.` : `${name} is back at the table — play resumes.`);
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
			socket.off("preordersUpdated");
			socket.off("seatOpened");
			socket.off("seatFilled");
		};
	}, [socket]);

	//WE HAVE LOCAL PLAYER WHICH IS US , AND THE OTHER PLAYERS IN THE ROOM IN otherPlayers ARRAY

	// Update the startGame function to handle both new games and rematches
	const startGame = () => {
		socket.emit("startGame", {roomCode: roomCode, socketID: socket.id});
		// Reset necessary game states
		setGameOver(false);
		setTimeLeft(TURN_SECONDS);
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

	const [isNewTurn, setIsNewTurn] = useState(false); //to be updtaed when the player wins the accusation wether accuser or accused
	const [enablePowerupsButtonState, setEnablePowerupsButtonState] = useState({0: 0, 1: 0, 2: 0});

	// Separate timer-related state and effects
	const [timeLeft, setTimeLeft] = useState(TURN_SECONDS);

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

	const powerupHandlers = {
		0: handleTrueVisionPowerup,
		1: handleCleansePowerup,
		2: handleSkipPlayerPowerup,
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
	const [isLocalPlayerAccused, setIsLocalPlayerAccused] = useState(false);

	// Add to your existing useEffect or create new one
	useEffect(() => {
		socket.on("accusationStarted", (data) => {
			setCanAccuse(false);
			setCurrentAccusation(data);
			setIsLocalPlayerAccused(data.accusedId === socket.id);
			setEventMessage(`${data.accuserName} is accusing ${data.accusedName}!`);
		});

		socket.on("accusationResolved", () => {
			setCanAccuse(true);
			setCurrentAccusation(null);
			setIsLocalPlayerAccused(false);
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
		clearSession();
		navigate("/");
	};

	// Add these states at the top of your component
	const [showSettings, setShowSettings] = useState(false);
	const [theme, setTheme] = useState("dark");

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

	/* ------------------------------------------------------------------ */
	/* RECONNECTION                                                        */
	/* ------------------------------------------------------------------ */
	/*
		socket.io reconnects the transport on its own, but the new socket is a
		stranger to the server: it is not in the room and nothing knows it owns
		our seat. `attemptReconnect` re-binds the seat to the new socket id and
		hands the whole board back. It runs on every connect (including the
		first one walking in from the waiting area, which the server treats as a
		harmless no-op resync) so there is only one code path to get wrong.
	*/
	useEffect(() => {
		if (!roomCode || !playerId) return;

		const resync = () => {
			socket.emit("attemptReconnect", {roomCode, playerId});
		};

		const handleDisconnect = (reason) => {
			// We asked for this one (quitting the game) - not a failure.
			if (reason === "io client disconnect") return;
			setConnectionState("reconnecting");
		};

		const handleReconnected = ({player, players, gameStarted: startedOnServer, currentTurnSocketID, lastPlayedSocketID, currentCardValue: currentCardValueOnServer, isNewTurn: newTurnOnServer, timeLeft: timeLeftOnServer, preorders: preordersOnServer}) => {
			setConnectionState("online");
			setConnectionError(null);

			if (player) {
				setLocalPlayer(player);
				setYourCards(Array.isArray(player.cards) ? player.cards : []);
			}

			if (Array.isArray(players)) {
				setUsersInRoom(players);
				setOpenSeats(openSeatsFrom(players));
				setOtherPlayers(players.filter((user) => user.socketID !== socket.id));
				setIsPlayersDataLoading(false);
			}

			setGameStarted(Boolean(startedOnServer));
			setPreorders(Array.isArray(preordersOnServer) ? preordersOnServer : []);

			if (startedOnServer) {
				setGameOver(false);
				setCurrentTurnPlayer(currentTurnSocketID);
				setLocalPlayerHasTurn(currentTurnSocketID === socket.id);
				setLastPlayedPlayer(lastPlayedSocketID ?? null);
				setCurrentCardValue(currentCardValueOnServer ?? null);
				setIsNewTurn(Boolean(newTurnOnServer));
				setTimeLeft(timeLeftOnServer ?? 0);
			}

			// Anything staged but unconfirmed never left our hand server side,
			// so the authoritative hand above already contains it.
			setCardsToPlay([]);
			saveSession({roomCode});
		};

		const handleReconnectFailed = ({message}) => {
			setConnectionState("failed");
			setConnectionError(message);
			clearSession();
		};

		const handleConnectionChanged = ({name, connected, graceSeconds}) => {
			setAwayPlayer(connected ? null : {name, secondsLeft: graceSeconds ?? 60});
		};

		socket.on("connect", resync);
		socket.on("disconnect", handleDisconnect);
		socket.on("reconnectionSuccessful", handleReconnected);
		socket.on("reconnectionFailed", handleReconnectFailed);
		socket.on("playerConnectionChanged", handleConnectionChanged);

		if (socket.connected) resync();

		return () => {
			socket.off("connect", resync);
			socket.off("disconnect", handleDisconnect);
			socket.off("reconnectionSuccessful", handleReconnected);
			socket.off("reconnectionFailed", handleReconnectFailed);
			socket.off("playerConnectionChanged", handleConnectionChanged);
		};
	}, [socket, roomCode, playerId]);

	// Countdown for the "waiting for X" banner.
	useEffect(() => {
		if (!awayPlayer) return;
		const intervalId = setInterval(() => {
			setAwayPlayer((previous) => (previous ? {...previous, secondsLeft: previous.secondsLeft - 1} : null));
		}, 1000);
		return () => clearInterval(intervalId);
	}, [awayPlayer?.name]);

	const handleReturnToLobby = () => {
		clearSession();
		socket.disconnect();
		navigate("/");
	};

	// Nothing can be played into a table with an empty chair - the server
	// refuses the move anyway, so the buttons say so up front.
	const isWaitingForSeat = openSeats.length > 0;

	/*
		A preorder no longer waits for your turn: it can be placed at any point
		of a live round, by anybody, as long as the table is whole. The one claim
		you are allowed is read from the same public list everyone else sees.
	*/
	const roundInPlay = gameStarted && !gameOver && !isWaitingForSeat;
	const hasPreorderOut = Boolean(preorders.find((claim) => claim.socketID === socket.id)?.hasIssuedPreorder);

	/*
		Cleanse is the one powerup with a moment: it clears the preorder sitting
		on you, and a preorder is exactly what turns into an accusation the
		instant you play. So the button calls for attention while you are under
		one - or while an accusation is actually being read out against you.
	*/
	const localPlayerIsPreordered = Boolean(preorders.find((claim) => claim.socketID === socket.id)?.isPreordered);
	const cleanseIsUrgent = localPlayerIsPreordered && enablePowerupsButtonState[1] > 0;

	const renderOpponent = (seat) => {
		if (isPlayersDataLoading) {
			return <div className="pod-skeleton" aria-hidden="true" />;
		}
		return (
			<PlayerAvatarInGrid
				playerObject={otherPlayers[seat]}
				localPlayer={localPlayer}
				hasCurrentTurn={otherPlayers[seat]?.socketID === currentTurnPlayer}
				hasLastPlayed={otherPlayers[seat]?.socketID === lastPlayedPlayer}
				canAccuse={canAccuse && lastPlayedPlayer !== null}
				roundInPlay={roundInPlay}
				hasPreorderOut={hasPreorderOut}
				preorder={preorders.find((claim) => claim.socketID === otherPlayers[seat]?.socketID)}
			/>
		);
	};

	return (
		<DndContext sensors={sensors} collisionDetection={pointerWithin} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
			<div className={`game-shell theme-${theme}`}>
				{/* ---- top bar ---- */}
				<header className="game-topbar">
					<button type="button" className="icon-btn" onClick={() => setShowSettings(true)} title="Settings" aria-label="Settings">
						⚙
					</button>
					<button type="button" className="mobile-chat-toggle" onClick={() => setShowChat((isOpen) => !isOpen)} aria-expanded={showChat} aria-controls="mobile-chat-panel">
						<span aria-hidden="true">▢</span> Chat
					</button>
					<span className="chip d-none d-md-inline-flex">
						Room <strong style={{color: "var(--gold)"}}>{roomCode}</strong>
					</span>

					<div className="event-banner">
						<span className="event-dot" />
						<span className="event-text" title={eventMessage}>
							Current card: {currentCardValue ? CARD_LABELS[currentCardValue] ?? currentCardValue : "—"}  |||||  {eventMessage}
						</span>
					</div>

					{!gameOver && gameStarted && <TimerRing seconds={timeLeft} />}

					<button type="button" className="icon-btn danger" onClick={handleQuitGame} title="Quit game" aria-label="Quit game">
						✕
					</button>
				</header>

				{/* ---- table ---- */}
				<div className="game-main">
					<aside id="mobile-chat-panel" className={`chat-panel${showChat ? " is-open" : ""}`}>
						<ChatBox socket={socket} roomCode={roomCode} playerName={localPlayer?.name} />
					</aside>

					<section className="game-table">
						<ConnectionOverlay state={connectionState} errorMessage={connectionError} awayPlayer={awayPlayer} openSeats={openSeats} roomCode={roomCode} onReturnToLobby={handleReturnToLobby} />

						<div className="opponents-row">
							{renderOpponent(0)}
							{renderOpponent(1)}
							{renderOpponent(2)}
						</div>

						<div className="table-center">
							{localPlayerHasTurn ? (
								<DroppableArea id="cards-to-play" items={cardsToPlay} className="play-zone" hint="Drag your cards here to play your move." />
							) : (
								<div className="pile-idle">
									<img src="/cardPile.svg" alt="" />
									<span>{isWaitingForSeat ? "Paused — the table needs a player" : gameStarted ? "Waiting for the current player…" : "The pile is ready"}</span>
								</div>
							)}
						</div>
					</section>

					<aside className="powerups-panel">
						<div className="chat-head">Powerups</div>
						<ul className="powerups">
							{POWERUPS.map((powerup) => {
								const count = enablePowerupsButtonState[powerup.id];
								const underAccusation = powerup.id === 1 && isLocalPlayerAccused && count > 0;
								const urgent = (powerup.id === 1 && cleanseIsUrgent) || underAccusation;
								// Cleanse only ever clears a preorder, so the tooltip
								// says which of the two put the spotlight on it.
								const urgentTitle = cleanseIsUrgent ? "You are preordered — cleanse it before that accusation fires" : "You are being accused — cleanse clears the preorder behind it";
								return (
									<li key={powerup.id}>
										<button type="button" className={`powerup${urgent ? " is-urgent" : ""}`} disabled={count === 0 || isWaitingForSeat} onClick={powerupHandlers[powerup.id]} title={urgent ? urgentTitle : powerup.blurb}>
											<span className="powerup-icon" aria-hidden="true">
												{powerup.icon}
											</span>
											<span className="powerup-name">{powerup.name}</span>
											{urgent && <span className="powerup-alert">Use me</span>}
											<span className="powerup-count">{count}</span>
										</button>
									</li>
								);
							})}
						</ul>
					</aside>
				</div>

				{/* ---- your hand ---- */}
				<footer className="hand-zone">
					{!gameStarted || gameOver ? (
						localPlayer?.isLeader ? (
							<div className="hand-controls">
								<Button variant="success" size="lg" onClick={gameOver ? handleStartAnotherGame : startGame}>
									{gameOver ? "Start another game" : "Start game"}
								</Button>
							</div>
						) : (
							<p className="waiting-note m-0">
								Waiting for the leader to start the game
								<span className="dots">
									<span />
									<span />
									<span />
								</span>
							</p>
						)
					) : (
						<DroppableArea id="your-cards" items={Array.isArray(yourCards) ? yourCards : []} hint="Drag your cards here to keep them in your hand" />
					)}

					<div className="hand-controls">
						{isNewTurn && localPlayerHasTurn && (
							<div className="declare-box">
								<label htmlFor="newSelectedCardToPlay">Ech Habetet :</label>
								<select id="newSelectedCardToPlay">
									{["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"].map((card) => (
										<option key={card} value={card}>
											{CARD_LABELS[card] ?? card}
										</option>
									))}
								</select>
							</div>
						)}
						<Button variant="success" disabled={!localPlayerHasTurn || cardsToPlay.length === 0 || isWaitingForSeat} onClick={handleConfirmTurn}>
							Confirm move
						</Button>
						<Button variant="danger" disabled={cardsToPlay.length === 0} onClick={handleCancelTurn}>
							Cancel
						</Button>
					</div>
				</footer>

				<LastCardModal show={showLastCardModal} onHide={() => setShowLastCardModal(false)} lastCardInfo={lastCardPresented} />

				{/* Inside the shell so it picks up the room's theme tokens. */}
				<PowerupAnimation
					roll={powerupRoll}
					onAnimationComplete={() => {
						if (powerupRoll) {
							const wonPowerup = powerupById(powerupRoll.powerUpID);
							setEventMessage(`${powerupRoll.isMine ? "You" : powerupRoll.accuserName} won ${wonPowerup?.name ?? "a powerup"} for calling ${powerupRoll.accusedName ?? "that"} bluff.`);
						}
						setPowerupRoll(null);
					}}
				/>
			</div>
			<DragOverlay>
				{activeId ? (
					<div className="drag-overlay">
						<PlayableCard cardType={activeId} />
					</div>
				) : null}
			</DragOverlay>
			<PlayerSelectionModal show={showPlayerSelection} onHide={() => setShowPlayerSelection(false)} players={otherPlayers} onSelect={handlePlayerSelect} actionType={currentPowerupAction} />
			<CardsRevealModal show={showCardsReveal} onHide={() => setShowCardsReveal(false)} cards={revealedCards.cards} playerName={revealedCards.playerName} />
			<QuitGameModal show={showQuitModal} onHide={() => setShowQuitModal(false)} onConfirm={handleConfirmQuit} />
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
