import { arrayMove, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FlattenedItem, Item, ItemFolderType } from "../examples/types";
import { ReactNode } from "react";
import classNames from "classnames";
import {
  DocumentIcon,
  FolderIcon,
  PaperClipIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import { UniqueIdentifier } from "@dnd-kit/core";

export function SortableItemExtended({
  clone,
  childCount,
  ...item
}: FlattenedItem & {
  clone?: boolean;
  childCount?: number;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    marginLeft: item.depth * 20,
  };

  const element = (
    <>
      <li
        className={classNames(
          clone &&
            "active select-none  rounded-lg w-52  border border-accent border-dotted flex relative text-xs p-0"
        )}
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
      >
        <ItemFileExtended item={item} />
        {clone && childCount !== undefined && childCount > 1 ? (
          <span className="absolute -right-2 -top-2 bottom-0 badge-xs badge-accent m-0 p-0 h-6 w-6 flex justify-center items-center">
            {childCount}
          </span>
        ) : null}
      </li>
    </>
  );

  if (clone) {
    return (
      <>
        <ul className="menu z-20">{element}</ul>
      </>
    );
  }

  return element;
}

export function ItemFileExtended({ item }: { item: Item }) {
  let icon: ReactNode | null = null;

  if (item.type === "folder") {
    icon = <FolderIcon className="w-4 inline" />;
  } else {
    if (item.fileType === "document") {
      icon = <PaperClipIcon className="w-4 inline" />;
    } else if (item.fileType === "image") {
      icon = <PhotoIcon className="w-4 inline" />;
    } else if (item.fileType === "general") {
      icon = <DocumentIcon className="w-4 inline" />;
    }
  }

  return (
    <a className="max-h-fit relative group/item">
      {icon}
      {item.name}
    </a>
  );
}

export function getProjection(
  items: FlattenedItem[],
  activeId: UniqueIdentifier,
  overId: UniqueIdentifier,
  dragOffset: number
) {
  const overItemIndex = items.findIndex(({ id }) => id === overId);
  const activeItemIndex = items.findIndex(({ id }) => id === activeId);

  const activeItem = items[activeItemIndex];
  const newItems = arrayMove(items, activeItemIndex, overItemIndex);

  const previousItem = newItems[overItemIndex - 1];
  const nextItem = newItems[overItemIndex + 1];

  // Determines the current depth based on indentationWidth
  const dragDepth = Math.round(dragOffset / 20);
  const projectedDepth = activeItem.depth + dragDepth;

  let maxDepth = 0;
  if (previousItem) {
    maxDepth =
      "items" in previousItem ? previousItem.depth + 1 : previousItem.depth;
  }

  const minDepth = nextItem ? nextItem.depth : 0;
  let depth = projectedDepth;

  if (projectedDepth >= maxDepth) {
    depth = maxDepth;
  } else if (projectedDepth < minDepth) {
    depth = minDepth;
  }

  return { depth, parentId: getParentId() };

  function getParentId() {
    if (depth === 0 || !previousItem) {
      return null;
    }

    if (depth === previousItem.depth) {
      return previousItem.parentId;
    }

    if (depth > previousItem.depth) {
      return previousItem.id;
    }

    const newParent = newItems
      .slice(0, overItemIndex)
      .reverse()
      .find((item) => item.depth === depth)?.parentId;

    return newParent ?? null;
  }
}

export function flatten(
  items: Item[],
  depth = 0,
  parentId: string | null
): FlattenedItem[] {
  return items.reduce<FlattenedItem[]>((acc, item, index) => {
    return [
      ...acc,
      {
        ...item,
        index: index,
        depth: depth,
        parentId: parentId,
      },
      ...("items" in item ? flatten(item.items, depth + 1, item.id) : []),
    ];
  }, []);
}

export function digForFolderAndDoSomething(
  {
    itemId,
    folder,
    getParentIfFolder = true,
  }: {
    itemId: UniqueIdentifier;
    folder: ItemFolderType;
    getParentIfFolder: boolean;
  },
  action: (folder: ItemFolderType, index: number) => void
) {
  const items = folder.items;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.id === itemId) {
      if (item.type === "folder" && !getParentIfFolder) {
        action(item, 0);
      } else {
        action(folder, i);
      }
      break;
    }
    if (item.type === "folder") {
      digForFolderAndDoSomething(
        { itemId, folder: item, getParentIfFolder },
        action
      );
    }
  }
}
