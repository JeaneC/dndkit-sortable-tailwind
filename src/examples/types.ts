export interface ItemBase {
  name: string;
  id: string;
}

export interface ItemFileType extends ItemBase {
  type: "file";
  fileType: "general" | "image" | "document";
  parentId?: string | null;
  name: string;
}

export interface ItemFolderType extends ItemBase {
  type: "folder";
  items: Item[];
}

export type Item = ItemFileType | ItemFolderType;

export type FlattenedItem = Item & {
  parentId: string | null;
  depth: number;
  index: number;
};
