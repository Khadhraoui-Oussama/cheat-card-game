// DroppableArea.jsx
import {SortableContext, horizontalListSortingStrategy} from "@dnd-kit/sortable";
import SortableItem from "./SortableItem";
import {useDroppable} from "@dnd-kit/core";

const DroppableArea = ({id, items, hint, className = ""}) => {
	const {setNodeRef, isOver} = useDroppable({
		id,
	});

	const classes = ["drop-zone", className, isOver ? "is-over" : "", items.length > 0 ? "has-cards" : ""].filter(Boolean).join(" ");

	return (
		<div ref={setNodeRef} className={classes}>
			<SortableContext id={id} items={items} strategy={horizontalListSortingStrategy}>
				{items.map((item, index) => (
					<SortableItem key={`${id}-${item}`} id={item} title={item} index={index} containerId={id} />
				))}
				{items.length === 0 && <div className="drop-zone-hint">{hint}</div>}
			</SortableContext>
		</div>
	);
};

export default DroppableArea;
