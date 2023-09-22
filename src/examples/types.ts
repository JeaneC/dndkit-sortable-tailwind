export interface ItemBase {
  name: string;
  id: string;
}

export interface ItemFileType extends ItemBase {
  type: "file";
  fileType: "general" | "image" | "document";
  parentId?: string;
  name: string;
}

export interface ItemFolderType extends ItemBase {
  type: "folder";
  items: Item[];
}

export type Item = ItemFileType | ItemFolderType;
