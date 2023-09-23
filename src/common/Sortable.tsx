import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Item, ItemFileType, ItemFolderType } from "../examples/types";
import { ReactNode, useEffect, useState } from "react";
import classNames from "classnames";
import {
  DocumentIcon,
  FolderIcon,
  FolderOpenIcon,
  PaperClipIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";

export function ItemFolder({
  folder,
  shouldClose,
}: {
  folder: ItemFolderType;
  shouldClose?: boolean;
}) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (shouldClose && open) {
      setOpen(false);
    }
  }, [open, shouldClose]);

  return (
    <>
      <span
        className={classNames(
          "menu-dropdown-toggle",
          open && "menu-dropdown-show",
          shouldClose && "bg-primary"
        )}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setOpen(!open);
        }}
      >
        {open ? (
          <FolderOpenIcon className="inline w-4" />
        ) : (
          <FolderIcon className="inline w-4" />
        )}
        {folder.name}
      </span>
      {open && (
        <ul>
          {folder.items.map((item) => {
            return <SortableItem key={item.id} item={item} />;
          })}
        </ul>
      )}
    </>
  );
}

export function ItemFile({ item }: { item: ItemFileType }) {
  let icon: ReactNode | null = null;

  if (item.fileType === "document") {
    icon = <PaperClipIcon className="w-4 inline" />;
  } else if (item.fileType === "image") {
    icon = <PhotoIcon className="w-4 inline" />;
  } else if (item.fileType === "general") {
    icon = <DocumentIcon className="w-4 inline" />;
  }

  return (
    <a className="max-h-fit">
      {icon}
      {item.name}
    </a>
  );
}
export function SortableItem({ item }: { item: Item }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isOver,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <>
      <li
        className={classNames(isOver && "z-20  border-t-2 border-accent")}
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
      >
        {item.type === "folder" ? (
          <ItemFolder folder={item} key={item.id} shouldClose={isDragging} />
        ) : (
          <ItemFile item={item} key={item.id} />
        )}
      </li>
    </>
  );
}
