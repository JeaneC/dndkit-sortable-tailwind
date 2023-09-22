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
import { ItemFolderType } from "./types";
import { ItemFile, SortableFolder, SortableItem } from "../common/Sortable";

const sampleSidebar: ItemFolderType = {
  items: [
    {
      fileType: "document",
      id: "2",
      name: "resume.pdf",
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
          name: "Project-final.psd",
        },
        {
          type: "file",
          fileType: "general",
          id: "6",
          name: "Project-final-2.psd",
        },
      ],
      name: "My Files",
    },
    {
      type: "file",
      fileType: "document",
      id: "4",
      name: "reports-final-2.pdf",
    },
  ],
  name: "My Files",
  type: "folder",
  id: "1",
};

export function NestedList() {
  const [folder, setFolder] = useState(sampleSidebar);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setFolder((folder) => {
        const oldIndex = folder.items.findIndex(
          (item) => item.id === active.id
        );
        const newIndex = folder.items.findIndex((item) => item.id === over.id);

        return {
          ...folder,
          items: arrayMove(folder.items, oldIndex, newIndex),
        };
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
        <SortableContext
          items={folder.items}
          strategy={verticalListSortingStrategy}
        >
          {folder.items.map((item) => {
            return (
              <SortableItem key={item.id} id={item.id}>
                {item.type === "folder" ? (
                  <SortableFolder
                    folder={item}
                    setFolder={(newFolder) => {
                      setFolder({
                        ...folder,
                        items: folder.items.map((item) => {
                          if (item.id === newFolder.id) {
                            return newFolder;
                          }

                          return item;
                        }),
                      });
                    }}
                  />
                ) : (
                  <ItemFile item={item} />
                )}
              </SortableItem>
            );
          })}
        </SortableContext>
      </DndContext>
    </ul>
  );
}
