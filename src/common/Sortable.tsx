import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Item, ItemFileType, ItemFolderType } from "../examples/types";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import classNames from "classnames";
import {
  DocumentIcon,
  FolderIcon,
  FolderOpenIcon,
  PaperClipIcon,
  PhotoIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { digForFolderAndDoSomething } from "./utils";
import { produce } from "immer";

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
          "menu-dropdown-toggle relative group/item",
          open && "menu-dropdown-show",
          shouldClose && "bg-primary"
        )}
        onClick={() => {
          setOpen(!open);
        }}
      >
        {open ? (
          <FolderOpenIcon className="inline w-4" />
        ) : (
          <FolderIcon className="inline w-4" />
        )}
        {folder.name}

        <DeleteItem item={folder} isFolder />
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
    <a className="max-h-fit relative group/item">
      {icon}
      {item.name}
      <DeleteItem item={item} />
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

function DeleteItem({ item, isFolder }: { item: Item; isFolder?: boolean }) {
  const folderContext = useContext(FolderContext);

  if (!folderContext) return null;

  return (
    <div
      className={classNames(
        "absolute right-0 top-0 bottom-0 group-hover/item:flex hidden items-center",
        isFolder ? "mr-6" : "mr-2"
      )}
    >
      <XMarkIcon
        className="w-4 hover:bg-primary"
        onClick={(e) => {
          e.stopPropagation();

          folderContext.setFolder(
            produce(folderContext.folder, (draft) => {
              digForFolderAndDoSomething(item.id, draft, (folder) => {
                folder.items = folder.items.filter(
                  (folderItem) => folderItem.id !== item.id
                );
              });
            })
          );
        }}
      />
    </div>
  );
}

export const FolderContext = createContext<{
  folder: ItemFolderType;
  setFolder: (folder: ItemFolderType) => void;
} | null>(null);
