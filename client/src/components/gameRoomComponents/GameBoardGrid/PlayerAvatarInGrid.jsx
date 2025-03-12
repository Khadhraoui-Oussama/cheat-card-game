import {useContext, useEffect, useState} from "react";
import {Button} from "react-bootstrap";
import {SocketContext} from "../../../contexts/SocketContext";
import {PlayerContext} from "../../../contexts/PlayerContext";

const PlayerAvatarInGrid = ({playerObject, localPlayer, hasCurrentTurn, hasLastPlayed}) => {
	const {socket, roomCode} = useContext(SocketContext);
	const [accuseButtonMsg, setAccuseButtonMsg] = useState("Accuse");
	useEffect(() => {
		if (!socket.connected) {
			socket.connect();
		}
	});
	/*
	HANDLE THE ACCUSE AND PREORDER LOGIC HERE
	*/

	const handleAccuseAndPreorder = (localPlayerID, actualPlayerID, actionType) => () => {
		if (!actualPlayerID) {
			console.error("No player ID provided for accusation");
			return;
		}

		// Prevent self-accusation
		if (localPlayerID === actualPlayerID) {
			console.error("Cannot accuse yourself");
			return;
		}

		if (actionType === "accuse") {
			if (playerObject.isPreordered) {
				console.log("cannot accuse the player as he is already preordered");
				setAccuseButtonMsg("Preordered");
				return;
			}

			socket.emit("accuse", {
				roomCode,
				socketID: localPlayerID, // this is the accuser's ID
				accusedPlayerID: actualPlayerID, // this is the accused player's ID
			});

			console.log("Accusing player:", {
				room: roomCode,
				accuser: localPlayerID,
				accused: actualPlayerID,
			});
		} else if (actionType === "preorder") {
			socket.emit("preorder", {
				roomCode,
				socketID: localPlayerID,
				accusedPlayerID: actualPlayerID,
			});
		}
	};

	// Add null check for playerObject
	if (!playerObject) return null;

	//MAKE THE ACCUSE BUTTON DYNAMICALLY LOAD ONLY AFTER THE PLAYER HAS PLAYED THEIR TURN AND THEN HIDE IT AGAIN AFTER THE NEXT PLAYER HAS FINISHED THEIR TURN ,MEANING THE ACCUSE WINDOW WILL ONLY BE AVAILABLE AFTER THE PLAYER HAS PLAYED THEIR TURN ,AND BEFORE THE NEXT PLAYER HAS PLAYED THEIR TURN
	//PROPABLE SOLUTION: USE A STATE TO KEEP TRACK OF THE PLAYER WHOSE TURN IT IS (ALREADY IN GAMEBOARDGRID), AND ONLY UPDATE THAT STATE ON A SIGNAL FROM THE SERVER AFTER THE NEXT PLAYER HAS PLAYED THEIR TURN
	//THE FIRST PLAYER IE LEADER WILL HAVE ACCUSE BUTTON DISABLED, AFTER HE PLAYS HIS TURN THE ACCUSE BUTTON WILL BE ENABLED FOR THE NEXT PLAYER AND DISABLED FOR THE LEADER, AND SO ON
	return (
		<>
			<div className={`d-flex flex-column justify-content-center items-center p-2 rounded ${hasCurrentTurn ? "bg-green-200" : ""}`}>
				<div className="d-flex gap-1 justify-content-center items-center">
					<img src={`/avatars/${playerObject.avatar?.replace("/avatars/", "")}`} width={50} />
					<h6>{playerObject.name}</h6>
					<h6>{playerObject.score}</h6>
				</div>
				<div className="gap-1">
					{/* Only show accuse button when this player was the last to play */}
					{hasLastPlayed && !hasCurrentTurn && (
						<Button variant="danger" size="sm" disabled={playerObject.isPreordered || localPlayer.socketID === playerObject.socketID} onClick={handleAccuseAndPreorder(localPlayer.socketID, playerObject.socketID, "accuse")}>
							{accuseButtonMsg}
						</Button>
					)}
					{/* Show preorder button on other players when it's current player's turn */}
					{localPlayer.hasTurn && (
						<Button variant="warning" size="sm" disabled={playerObject?.preOrderInfo?.isPreordered} onClick={handleAccuseAndPreorder(localPlayer.socketID, playerObject.socketID, "preorder")}>
							Preorder
						</Button>
					)}
				</div>
			</div>
		</>
	);
};

export default PlayerAvatarInGrid;
