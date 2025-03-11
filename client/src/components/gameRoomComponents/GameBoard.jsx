import {closestCorners, DndContext, DragOverlay, pointerWithin} from "@dnd-kit/core";
import {useEffect, useState} from "react";
import {useSensor, useSensors, MouseSensor, TouchSensor, KeyboardSensor} from "@dnd-kit/core";
import {arrayMove, SortableContext, sortableKeyboardCoordinates} from "@dnd-kit/sortable";
import SortableItem from "./SortableItem";
import DroppableArea from "./DroppableArea";

const GameBoard = () => {
	const [yourCards, setYourCards] = useState(["AH", "2H"]);
	const [cardsToPlay, setCardsToPlay] = useState(["QD", "KD"]); //cards that the player needs to confirm to play

	const [activeId, setActiveId] = useState();

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
	useEffect(() => {
		console.log("Your cards:", yourCards);
		console.log("Cards to play:", cardsToPlay);
	}, [yourCards, cardsToPlay]);

	const gameLogic = () => {
		//HAVE TO IMPLEMENT A START BUTTON CLICKED BY THE LEADER TO START THE GAME
		//HAVE TO DISTRIBUTE THE CARDS BETWEEN THE 4 PLAYERS
		//HAVE TO KEEP TRACK OF EACH PLAYER TURN :
		// FIRST IT GOES IN A CIRCLE FROM P1 TO P4
		// IF PLAYER ACCUSES AND IS RIGHT : HE TAKES TURN
		// IF PLAYER ACCUSES AND IS WRONG : THE ACCUSED PLAYS AGAIN
		//
	};
	const handleClick = () => {
		console.log("Card clicked:", title);
	};
	//TODO : make the card pile also a dropppable area so that the player can drag the card from his hand to the pile and the pile will be updated
	//TODO : make the card pile a droppable area only when it's the players turn else an image of the pile
	return (
		<div style={{width: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "20px"}}>
			<DndContext sensors={sensors} collisionDetection={pointerWithin} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
				<DroppableArea
					id="your-cards"
					items={yourCards}
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						position: "relative",
						width: "100%",
						maxWidth: "800px",
						padding: "10px 0",
						backgroundColor: "#f5f5f5",
						margin: "10px auto",
						minHeight: "100px",
						cursor: "default",
					}}
				/>
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
						backgroundColor: "#e0e0e0",
						margin: "10px auto",
						minHeight: "100px",
						cursor: "default",
					}}
				/>

				<DragOverlay>{activeId ? <SortableItem id={activeId} title={activeId} /> : null}</DragOverlay>
			</DndContext>
		</div>
	);
};

export default GameBoard;
