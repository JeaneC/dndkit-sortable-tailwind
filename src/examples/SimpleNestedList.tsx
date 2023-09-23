import { useState } from "react";

import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  DragEndEvent,
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
import { digForFolderAndDoSomething } from "../common/utils";

export const sampleSidebar: ItemFolderType = {
  items: [
    {
      fileType: "document",
      id: "2",
      name: " 2- resume.pdf",
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
          type: "folder",
          id: "7",
          name: "7 - Images",
          items: [
            {
              type: "file",
              fileType: "image",
              id: "8",
              name: "8 - Screenshot1.png",
            },
            {
              type: "file",
              fileType: "image",
              id: "9",
              name: "9 - Screenshot2.png",
            },
            {
              type: "folder",
              id: "10",
              name: "10 - Others",
              items: [
                {
                  type: "file",
                  fileType: "image",
                  id: "11",
                  name: "11 - Screenshot3.png",
                },
              ],
            },
          ],
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

export function SimpleNestedList() {
  const [folder, setFolder] = useState(sampleSidebar);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
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
          const newItem = folder.items[overIndex];

          if (newItem?.type === "folder") {
            newItem.items = [removedItem, ...newItem.items];
          } else {
            folder.items.splice(overIndex, 0, removedItem);
          }
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
