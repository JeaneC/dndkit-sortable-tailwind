import { useState } from "react";

import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  DragEndEvent,
  UniqueIdentifier,
  MouseSensor,
  KeyboardSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Item, ItemFolderType } from "./types";
import { SortableItem } from "../common/Sortable";
import { produce } from "immer";

const sampleSidebar: ItemFolderType = {
  items: [
    {
      fileType: "document",
      id: "2",
      name: "2 - resume.pdf",
      type: "file",
    },
    {
      type: "folder",
      id: "3",
      items: [
        {
          type: "file",
          fileType: "general",
          id: "5",
          name: "5 - Project-final.psd",
        },
        {
          type: "file",
          fileType: "general",
          id: "6",
          name: "6 - Project-final-2.psd",
        },
        {
          type: "file",
          fileType: "general",
          id: "7",
          name: "7 - Project-final-3.psd",
        },
        {
          fileType: "document",
          id: "8",
          name: "8 - resume-2.pdf",
          type: "file",
        },
      ],
      name: "3 - My Files",
    },
    {
      type: "file",
      fileType: "document",
      id: "4",
      name: "4 - reports-final-2.pdf",
    },
  ],
  name: "1 - My Files",
  type: "folder",
  id: "1",
};

export function NestedList() {
  const [folder, setFolder] = useState(sampleSidebar);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 0,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // Edge case: Make sure over is not inside active
    let isOverInsideActive = false;
    const activeFolder = folder.items.find((item) => item.id === active.id);

    if (activeFolder && activeFolder.type === "folder") {
      digForFolderAndDoSomething(over.id, activeFolder, () => {
        isOverInsideActive = true;
      });

      if (isOverInsideActive) return;
    }

    const newFolder = produce(folder, (draft) => {
      let removedItem: Item | undefined;
      digForFolderAndDoSomething(active.id, draft, (folder) => {
        folder.items = folder.items.filter((item) => {
          if (item.id === active.id) {
            removedItem = item;
            return false;
          }
          return true;
        });
      });

      digForFolderAndDoSomething(over.id, draft, (folder) => {
        const overIndex = folder.items.findIndex(
          (item) => item.id === over.id
        )!;

        if (removedItem) {
          folder.items.splice(overIndex, 0, removedItem);
        }
      });
    });

    setFolder(newFolder);
  };

  return (
    <ul className="menu menu-xs bg-base-200 rounded-lg max-w-xs w-full">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={folder.items}
          strategy={verticalListSortingStrategy}
        >
          {folder.items.map((item) => {
            return <SortableItem key={item.id} item={item} />;
          })}
        </SortableContext>
      </DndContext>
    </ul>
  );
}

function digForFolderAndDoSomething(
  itemId: UniqueIdentifier,
  folder: ItemFolderType,
  action: (folder: ItemFolderType) => void
) {
  for (const item of folder.items) {
    if (item.id === itemId) {
      action(folder);
      break;
    }
    if (item.type === "folder") {
      digForFolderAndDoSomething(itemId, item, action);
    }
  }
}
