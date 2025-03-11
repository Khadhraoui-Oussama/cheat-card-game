import React from "react";
import {SortableContext, horizontalListSortingStrategy} from "@dnd-kit/sortable";
import SortableItem from "./SortableItem";
import {useDroppable} from "@dnd-kit/core";

const DroppableArea = ({id, items, style, customDroppableAreaLabel}) => {
	const {setNodeRef, isOver} = useDroppable({
		id,
	});

	const containerStyle = {
		...style,
		transition: "background-color 0.3s ease",
		backgroundColor: isOver ? "rgb(41, 238, 159)" : style.backgroundColor, // Light green when hovering
		display: "flex",
		flexWrap: "wrap",
		gap: "10px",
		padding: "20px",
		minHeight: "120px",
		border: isOver ? "2px dashed #4CAF50" : "2px solid transparent", // Green border when hovering
	};

	return (
		<div ref={setNodeRef} style={containerStyle}>
			<SortableContext id={id} items={items} strategy={horizontalListSortingStrategy}>
				{items.map((item, index) => (
					<SortableItem key={`${id}-${item}`} id={item} title={item} index={index} containerId={id} totalCards={items.length} />
				))}
				{items.length === 0 && (
					<div
						style={{
							width: "100%",
							height: "100%",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							color: "#999",
							fontSize: "14px",
						}}>
						{customDroppableAreaLabel}
					</div>
				)}
			</SortableContext>
		</div>
	);
};

export default DroppableArea;
