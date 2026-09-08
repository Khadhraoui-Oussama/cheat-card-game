import {useContext, useEffect, useState} from "react";
import {Button} from "react-bootstrap";
import {SocketContext} from "../../../contexts/SocketContext";
import {GameContext} from "../../../contexts/GameContext";

const PlayerAvatarInGrid = ({playerObject, localPlayer, hasCurrentTurn, hasLastPlayed, roundInPlay, hasPreorderOut, preorder}) => {
	const {socket, roomCode} = useContext(SocketContext);
	const {gameOptions} = useContext(GameContext);
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

	// The chair is still at the table with its hand on it, but nobody is in it.
	const isAway = playerObject.connected === false;
	const isOpenSeat = Boolean(playerObject.awaitingReplacement);
	const podState = [hasCurrentTurn ? "is-turn" : isBeingAccused ? "is-accused" : "", isAway ? "is-away" : ""].filter(Boolean).join(" ");
	const canShowAccuse = hasLastPlayed && !hasCurrentTurn && !isAway;

	/*
		Preordering used to be something only the player holding the turn could
		do. It is open to the whole table now - the claim is what matters, not
		whose move it is - so the button is on every pod for the whole round.
		Each player still gets exactly one claim, and each target can only be
		claimed once, which is what the disabled states below say.
	*/
	const canShowPreorder = gameOptions.preorder && roundInPlay && !isAway;
	const targetIsClaimed = Boolean(preorder?.isPreordered);
	const claimedByMe = targetIsClaimed && preorder.playerWhoPreordered === localPlayer?.socketID;
	const preorderLabel = claimedByMe ? "Preordered ✓" : targetIsClaimed ? "Claimed" : hasPreorderOut ? "Preorder used" : "Preorder";
	const preorderTitle = claimedByMe
		? `Your accusation fires the moment ${playerObject.name} plays.`
		: targetIsClaimed
		? `${playerObject.name} has already been preordered by somebody else.`
		: hasPreorderOut
		? "You already have a preorder out — it comes back once an accusation is resolved."
		: `Accuse ${playerObject.name} automatically the moment they play, turn or no turn.`;

	return (
		<div className={`player-pod ${podState}`}>
			{isOpenSeat && <span className="pod-flag warn">Seat open</span>}
			{isAway && !isOpenSeat && <span className="pod-flag warn">Away</span>}
			{!isAway && hasCurrentTurn && <span className="pod-flag">Playing</span>}
			{!isAway && !hasCurrentTurn && hasLastPlayed && <span className="pod-flag alt">Last played</span>}

			<div className="pod-avatar">
				<img src={`/avatars/${playerObject.avatar?.replace("/avatars/", "")}`} alt="" />
			</div>
			<h6 className="pod-name" title={playerObject.name}>
				{playerObject.name}
			</h6>
			<span className="pod-score">★ {playerObject.score ?? 0}</span>

			{(canShowAccuse || canShowPreorder) && (
				<div className="pod-actions">
					{canShowAccuse && (
						<Button className="pod-action-button accuse-button" variant="danger" size="sm" disabled={playerObject.isPreordered || localPlayer.socketID === playerObject.socketID || isBeingAccused || hasBeenAccused || globallyAccused} onClick={handleAccuseAndPreorder(localPlayer.socketID, playerObject.socketID, "accuse")}>
							{isBeingAccused ? "Being Accused" : globallyAccused ? "Already Accused" : accuseButtonMsg}
						</Button>
					)}
					{/* localPlayer.preorderEnabled is counterintuitive because we are storing the gameoptions state inside of each player ,but for now it will suffice */}
					{/* locaPlayer.preorderEnabled == gameOptions.preorder */}
					{canShowPreorder && (
						<Button className="pod-action-button preorder-button" variant="warning" size="sm" disabled={targetIsClaimed || hasPreorderOut} title={preorderTitle} onClick={handleAccuseAndPreorder(localPlayer.socketID, playerObject.socketID, "preorder")}>
							{preorderLabel}
						</Button>
					)}
				</div>
			)}
		</div>
	);
};

export default PlayerAvatarInGrid;
