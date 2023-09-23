import { UniqueIdentifier } from "@dnd-kit/core";
import { ItemFolderType } from "../examples/types";

export function digForFolderAndDoSomething(
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
