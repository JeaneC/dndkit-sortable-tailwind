import { useState } from "react";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ItemFileType } from "./types";
import { ItemFile, SortableItem } from "../common/Sortable";

const sampleSidebar: ItemFileType[] = [
  {
    fileType: "document",
    id: "2",
    name: "resume.pdf",
    type: "file",
  },
  {
    fileType: "image",
    id: "3",
    name: "screenshot.png",
    type: "file",
  },
  {
    type: "file",
    fileType: "general",
    id: "4",
    name: "notes.txt",
  },
];

export function SimpleList() {
  const [items, setItems] = useState(sampleSidebar);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <ul className="menu menu-xs bg-base-200 rounded-lg max-w-xs w-full">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            <SortableItem key={item.id} id={item.id} item={item} />
          ))}
        </SortableContext>
      </DndContext>
    </ul>
  );
}
