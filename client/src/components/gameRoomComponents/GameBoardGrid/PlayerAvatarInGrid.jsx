import {useContext, useEffect, useState} from "react";
import {Button} from "react-bootstrap";
import {SocketContext} from "../../../contexts/SocketContext";
import {PlayerContext} from "../../../contexts/PlayerContext";

const PlayerAvatarInGrid = ({playerObject, localPlayer, hasCurrentTurn, hasLastPlayed}) => {
	const {socket, roomCode} = useContext(SocketContext);
	const [accuseButtonMsg, setAccuseButtonMsg] = useState("Accuse");
	const [isBeingAccused, setIsBeingAccused] = useState(false);
	const [hasBeenAccused, setHasBeenAccused] = useState(false);
	const [globallyAccused, setGloballyAccused] = useState(false);

	// Socket connection effect
	useEffect(() => {
		if (!socket.connected) {
			socket.connect();
		}
	}, [socket]);

	// Accusation state management effect
	useEffect(() => {
		const handleAccusationStart = ({accusedId, accused}) => {
			if (playerObject?.socketID === accusedId) {
				setIsBeingAccused(true);
				setHasBeenAccused(true);
				setGloballyAccused(true);
			}
			// Set global accusation state for all instances
			if (accused) {
				setGloballyAccused(true);
				setAccuseButtonMsg("Already Accused");
			}
		};

		const handleAccusationResolve = () => {
			setIsBeingAccused(false);
		};

		const handleTurnUpdate = () => {
			setIsBeingAccused(false);
			setHasBeenAccused(false);
			setGloballyAccused(false);
			setAccuseButtonMsg("Accuse");
		};

		socket.on("accusationStarted", handleAccusationStart);
		socket.on("accusationResolved", handleAccusationResolve);
		socket.on("updateTurn", handleTurnUpdate);
		socket.on("playerAccused", ({accusedId}) => {
			if (playerObject?.socketID === accusedId) {
				setGloballyAccused(true);
				setAccuseButtonMsg("Already Accused");
			}
		});

		return () => {
			socket.off("accusationStarted", handleAccusationStart);
			socket.off("accusationResolved", handleAccusationResolve);
			socket.off("updateTurn", handleTurnUpdate);
			socket.off("playerAccused");
		};
	}, [socket, playerObject?.socketID]); // Only depend on socket and playerObject.socketID

	const handleAccuseAndPreorder = (localPlayerID, actualPlayerID, actionType) => () => {
		if (!actualPlayerID || localPlayerID === actualPlayerID) {
			return;
		}

		if (actionType === "accuse") {
			if (playerObject.isPreordered || hasBeenAccused || globallyAccused) {
				setAccuseButtonMsg(playerObject.isPreordered ? "Preordered" : "Already Accused");
				return;
			}

			socket.emit("accuse", {
				roomCode,
				socketID: localPlayerID,
				accusedPlayerID: actualPlayerID,
			});

			// Emit global accusation state
			socket.emit("globalAccusation", {
				roomCode,
				accusedPlayerID: actualPlayerID,
			});
		} else if (actionType === "preorder") {
			socket.emit("preorder", {
				roomCode,
				socketID: localPlayerID,
				accusedPlayerID: actualPlayerID,
			});
		}
	};

	if (!playerObject) return null;
	let bgColor;
	if (hasCurrentTurn) {
		bgColor = "bg-green-200";
	} else if (isBeingAccused) {
		bgColor = "bg-red-100";
	} else {
		bgColor = "bg-blue-400";
	}
	return (
		<div
			className={`d-flex flex-column justify-content-center items-center p-2 rounded 
        	${bgColor}`}>
			<div className="d-flex gap-1 justify-content-center items-center">
				<img src={`/avatars/${playerObject.avatar?.replace("/avatars/", "")}`} width={50} />
				<h6>{playerObject.name}</h6>
				<h6>{playerObject.score}</h6>
			</div>
			<div className="gap-1">
				{hasLastPlayed && !hasCurrentTurn && (
					<Button variant="danger" size="sm" disabled={playerObject.isPreordered || localPlayer.socketID === playerObject.socketID || isBeingAccused || hasBeenAccused || globallyAccused} onClick={handleAccuseAndPreorder(localPlayer.socketID, playerObject.socketID, "accuse")}>
						{isBeingAccused ? "Being Accused" : globallyAccused ? "Already Accused" : accuseButtonMsg}
					</Button>
				)}
				{localPlayer.hasTurn && (
					<Button variant="warning" size="sm" disabled={playerObject?.preOrderInfo?.isPreordered} onClick={handleAccuseAndPreorder(localPlayer.socketID, playerObject.socketID, "preorder")}>
						Preorder
					</Button>
				)}
			</div>
		</div>
	);
};

export default PlayerAvatarInGrid;
