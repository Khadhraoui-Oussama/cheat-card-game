// // import {useDroppable} from "@dnd-kit/core";
// // import SortableItem from "./SortableItem";

// // const DroppableArea = ({title, items}) => {
// // 	const {setNodeRef} = useDroppable({id: title});

// // 	return (
// // 		<div style={{display: "flex"}}>
// // 			<h6>{title}</h6>
// // 			<div
// // 				ref={setNodeRef}
// // 				style={{display: "flex", outline: "solid red 2px", minWidth: "600px", minHeight: "150px"}}>
// // 				{items.map((cardTitle, key) => (
// // 					<SortableItem title={cardTitle} key={key} index={key} parent={title} />
// // 				))}
// // 			</div>
// // 		</div>
// // 	);
// // };

// // export default DroppableArea;

// import {useDroppable} from "@dnd-kit/core";
// import SortableItem from "./SortableItem";

// const DroppableArea = ({title, items}) => {
// 	const {setNodeRef} = useDroppable({id: title});
// 	items.forEach((element) => {
// 		console.log("***", element.key);
// 	});
// 	return (
// 		<div style={{display: "flex"}}>
// 			<h6>{title}</h6>
// 			<div
// 				ref={setNodeRef}
// 				style={{display: "flex", outline: "solid red 2px", minWidth: "600px", minHeight: "150px"}}>
// 				{items.map((cardTitle, key) => (
// 					<SortableItem title={cardTitle} key={key} id={cardTitle} parent={title} index={key} />
// 				))}
// 			</div>
// 		</div>
// 	);
// };

// export default DroppableArea;

// DroppableArea.jsx
import React from "react";
import {SortableContext, horizontalListSortingStrategy} from "@dnd-kit/sortable";
import SortableItem from "./SortableItem";
import {useDroppable} from "@dnd-kit/core";

const DroppableArea = ({id, items, parent, style}) => {
	//TODO CHECK IF THIS IS NECESSARY
	const {setNodeRef} = useDroppable({
		id,
	});

	return (
		<SortableContext id={id} items={items} strategy={horizontalListSortingStrategy}>
			<div style={style} ref={setNodeRef}>
				{items.map((id, index) => (
					<SortableItem key={id} id={id} title={id} index={index} parent={parent} />
				))}
			</div>
		</SortableContext>
	);
};

export default DroppableArea;
