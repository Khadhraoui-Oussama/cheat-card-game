import {closestCorners, DndContext, DragOverlay} from "@dnd-kit/core";
import {useState} from "react";
import {useSensor, useSensors, MouseSensor, TouchSensor, KeyboardSensor} from "@dnd-kit/core";
import {arrayMove, SortableContext, sortableKeyboardCoordinates} from "@dnd-kit/sortable";
import SortableItem from "./SortableItem";

const GameBoard = () => {
	const [yourCards, setYourCards] = useState(["AC", "2C", "3C", "4C", "5C", "6C", "JD", "QD", "KD", "AH", "2H", "3H", "4H", "5H", "6H", "7H", "8H"]);
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

		if (over && active.id !== over.id) {
			setYourCards((items) => {
				const oldIndex = items.indexOf(active.id);
				const newIndex = items.indexOf(over.id);

				return arrayMove(items, oldIndex, newIndex);
			});
		}

		setActiveId(null);
	};

	return (
		<div style={{width: "100%", display: "flex", justifyContent: "center", padding: "20px"}}>
			<DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
				<SortableContext items={yourCards}>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							position: "relative",
							width: "100%",
							maxWidth: "800px", // Optional max width
							padding: "10px 0",
						}}>
						{yourCards.map((card, index) => (
							<SortableItem key={card} id={card} title={card} index={index} totalCards={yourCards.length} />
						))}
					</div>
				</SortableContext>

				{/* Drag Overlay */}
				<DragOverlay>{activeId ? <SortableItem id={activeId} title={activeId} /> : null}</DragOverlay>
			</DndContext>
		</div>
	);
};

export default GameBoard;
