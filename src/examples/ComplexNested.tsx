import { useMemo, useState } from "react";

import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  DragEndEvent,
  MouseSensor,
  KeyboardSensor,
  DragOverlay,
  UniqueIdentifier,
  DragStartEvent,
  DragMoveEvent,
  DragOverEvent,
  MeasuringStrategy,
  DropAnimation,
  defaultDropAnimation,
  Modifier,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Item, ItemFolderType } from "./types";
import { current, produce } from "immer";
import {
  SortableItemExtended,
  flatten,
  getProjection,
  digForFolderAndDoSomething,
} from "../common/SortableExtended";
import { createPortal } from "react-dom";
import { CSS } from "@dnd-kit/utilities";

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

const measuring = {
  droppable: {
    strategy: MeasuringStrategy.Always,
  },
};
const dropAnimationConfig: DropAnimation = {
  keyframes({ transform }) {
    return [
      { opacity: 1, transform: CSS.Transform.toString(transform.initial) },
      {
        opacity: 0,
        transform: CSS.Transform.toString({
          ...transform.final,
          x: transform.final.x + 5,
          y: transform.final.y + 5,
        }),
      },
    ];
  },
  easing: "ease-out",
  sideEffects({ active }) {
    active.node.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: defaultDropAnimation.duration,
      easing: defaultDropAnimation.easing,
    });
  },
};

const adjustTranslate: Modifier = ({ transform }) => {
  return {
    ...transform,
    y: transform.y - 25,
  };
};

export function ComplexNested() {
  const [folder, setFolder] = useState(sampleSidebar);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [overId, setOverId] = useState<UniqueIdentifier | null>(null);
  const [offsetLeft, setOffsetLeft] = useState(0);

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

  const { flattenedItems, flattenedIds, activeItem } = useMemo(() => {
    let flattenedItems = flatten(folder.items, 0, null);

    if (activeId != null) {
      const excludedFolders = [activeId];
      flattenedItems = flattenedItems.filter((item) => {
        if (item.parentId && excludedFolders.includes(item.parentId)) {
          if ("items" in item) {
            excludedFolders.push(item.id);
          }
          return false;
        }

        return true;
      });
    }

    const flattenedIds = flattenedItems.map((item) => item.id);
    const activeItem = activeId
      ? flattenedItems.find(({ id }) => id === activeId)
      : null;

    return {
      flattenedItems,
      flattenedIds,
      activeItem,
    };
  }, [activeId, folder.items]);

  const projected =
    activeId && overId
      ? getProjection(flattenedItems, activeId, overId, offsetLeft)
      : null;

  return (
    <ul className="menu menu-xs bg-base-200 rounded-lg max-w-xs w-full">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        measuring={measuring}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext
          items={flattenedIds}
          strategy={verticalListSortingStrategy}
        >
          {flattenedItems.map((item) => {
            return (
              <SortableItemExtended
                key={item.id}
                {...item}
                depth={
                  activeItem && item.id === activeItem.id && projected
                    ? projected.depth
                    : item.depth
                }
              />
            );
          })}
          {createPortal(
            <DragOverlay
              dropAnimation={dropAnimationConfig}
              modifiers={[adjustTranslate]}
            >
              {activeId && activeItem ? (
                <SortableItemExtended
                  {...activeItem}
                  clone
                  childCount={
                    "items" in activeItem ? activeItem.items.length + 1 : 0
                  }
                />
              ) : null}
            </DragOverlay>,
            document.body
          )}
        </SortableContext>
      </DndContext>
    </ul>
  );

  function handleDragStart({ active: { id: activeId } }: DragStartEvent) {
    setActiveId(activeId);
    setOverId(activeId);

    document.body.style.setProperty("cursor", "grabbing");
  }

  function handleDragMove({ delta }: DragMoveEvent) {
    setOffsetLeft(delta.x);
  }

  function handleDragOver({ over }: DragOverEvent) {
    setOverId(over?.id ?? null);
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    resetState();

    if (!projected || !over || !activeItem) return;

    const overItem = flattenedItems.find((item) => item.id === over.id)!;

    if (
      overItem.id === activeItem.id &&
      activeItem.parentId === projected.parentId
    ) {
      return;
    }

    const newFolder = produce(folder, (draft) => {
      // ------ Items are in the same array ------
      if (
        overItem.parentId === activeItem.parentId &&
        overItem.depth === projected.depth
      ) {
        digForFolderAndDoSomething(
          { itemId: active.id, folder: draft, getParentIfFolder: true },
          (activeFolder, index) => {
            activeFolder.items = arrayMove(
              activeFolder.items,
              index,
              overItem.index
            );
          }
        );
        return;
      }

      // ------ Items are in different depths ------

      let removedItem: Item | undefined;
      digForFolderAndDoSomething(
        {
          itemId: active.id,
          folder: draft,
          getParentIfFolder: activeItem.type === "folder",
        },
        (activeFolder, index) => {
          removedItem = activeFolder.items.splice(index, 1)[0];
        }
      );

      const isActiveItemBeforeOver =
        flattenedItems.findIndex((item) => item.id === activeItem.id) <
        flattenedItems.findIndex((item) => item.id === overItem.id);

      if (removedItem) {
        if (projected.parentId) {
          digForFolderAndDoSomething(
            {
              itemId: projected.parentId,
              folder: draft,
              getParentIfFolder: false,
            },
            (projectedFolder) => {
              console.log(
                "projected",
                projected.parentId,
                current(projectedFolder),
                "over---",
                overItem,
                { isActiveItemBeforeOver }
              );

              const overItemIndex = projectedFolder.items.findIndex(
                (item) => item.id === overItem?.id
              );

              if (overItemIndex > -1) {
                projectedFolder.items.splice(
                  overItemIndex + (isActiveItemBeforeOver ? 1 : 0),
                  0,
                  removedItem as Item
                );
              } else if (overItem.id === activeItem.id) {
                projectedFolder.items.push(removedItem as Item);
              } else {
                projectedFolder.items.splice(0, 0, removedItem as Item);
              }
            }
          );
        } else {
          // // This is at the root level
          const overItemIndex = draft.items.findIndex(
            (item) => item.id === overItem?.id
          );

          if (overItemIndex > -1) {
            draft.items.splice(overItemIndex, 0, removedItem);
          }
        }
      }
    });

    setFolder(newFolder);
  }

  function handleDragCancel() {
    resetState();
  }

  function resetState() {
    setOverId(null);
    setActiveId(null);
    setOffsetLeft(0);

    document.body.style.setProperty("cursor", "");
  }
}
