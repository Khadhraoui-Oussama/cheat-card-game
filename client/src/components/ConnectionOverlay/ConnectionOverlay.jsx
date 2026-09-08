import {useState} from "react";
import {Button} from "react-bootstrap";

/*
	Four different stories to tell:
	- "it's us"        -> a blocking overlay, because nothing on the board can be
	                      trusted or acted on until we are back.
	- "they're away"   -> a banner, because the game is paused server side but the
	                      table (and the chat) is still readable.
	- "they're gone"   -> a panel with the room code, because the round is not
	                      over: the seat and the hand on it are being kept and the
	                      game resumes the moment somebody sits down in it.
	Nothing but the "it's us" case blocks the screen - the players still at the
	table can talk in the chat while they wait for a replacement.
*/
const SeatOpenPanel = ({openSeats, roomCode}) => {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(roomCode);
			setCopied(true);
			setTimeout(() => setCopied(false), 1600);
		} catch {
			setCopied(false);
		}
	};

	const names = openSeats.map((seat) => seat.name).filter(Boolean);
	const missing = names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}` : names[0];

	return (
		<div className="seat-open-panel" role="status">
			<div className="seat-open-head">
				<span className="away-spinner" aria-hidden="true" />
				<strong>
					Waiting for {openSeats.length} player{openSeats.length === 1 ? "" : "s"}
				</strong>
			</div>
			<p className="muted m-0">
				{missing ? `${missing} left the table. ` : ""}
				The hand{openSeats.length === 1 ? "" : "s"} and the turn order are being kept — the game picks up the moment {openSeats.length === 1 ? "somebody takes the seat" : "the seats are taken"}.
			</p>
			{roomCode && (
				<div className="room-code">
					<span className="eyebrow">Code</span>
					<code>{roomCode}</code>
					<button type="button" className="copy-btn" onClick={handleCopy}>
						{copied ? "Copied!" : "Copy"}
					</button>
				</div>
			)}
			<p className="muted m-0" style={{fontSize: "0.78rem"}}>
				Share the code, or wait for quick match to send someone over.
			</p>
		</div>
	);
};

const ConnectionOverlay = ({state, errorMessage, awayPlayer, openSeats = [], roomCode, onReturnToLobby}) => {
	if (state === "online") {
		// An empty chair outranks the countdown banner: that player is not
		// coming back on a timer any more, they are being replaced.
		if (openSeats.length > 0) return <SeatOpenPanel openSeats={openSeats} roomCode={roomCode} />;

		if (!awayPlayer) return null;

		return (
			<div className="away-banner" role="status">
				<span className="away-spinner" aria-hidden="true" />
				<span>
					<strong>{awayPlayer.name}</strong> lost connection — the game is paused.
				</span>
				<span className="away-count">{Math.max(0, awayPlayer.secondsLeft)}s</span>
			</div>
		);
	}

	const isFailed = state === "failed";

	return (
		<div className="connection-overlay" role="alertdialog" aria-live="assertive">
			<div className="connection-card">
				{isFailed ? (
					<>
						<div className="connection-icon danger" aria-hidden="true">
							⚠
						</div>
						<h3>Could not rejoin</h3>
						<p className="muted">{errorMessage || "Your seat at that table is gone."}</p>
						<Button variant="primary" onClick={onReturnToLobby}>
							Back to lobby
						</Button>
					</>
				) : (
					<>
						<div className="connection-icon" aria-hidden="true">
							<span className="away-spinner large" />
						</div>
						<h3>Reconnecting…</h3>
						<p className="muted">Hold on — your hand and your seat are being kept for you.</p>
						<Button variant="secondary" onClick={onReturnToLobby}>
							Give up and leave
						</Button>
					</>
				)}
			</div>
		</div>
	);
};

export default ConnectionOverlay;
