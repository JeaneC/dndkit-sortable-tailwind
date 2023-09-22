import { ItemFile, ItemFolder } from "./Item";
import { ItemFolderType } from "./types";

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
        {
          type: "folder",
          id: "7",
          name: "Images",
          items: [
            {
              type: "file",
              fileType: "image",
              id: "8",
              name: "Screenshot1.png",
            },
            {
              type: "file",
              fileType: "image",
              id: "9",
              name: "Screenshot2.png",
            },
            {
              type: "folder",
              id: "10",
              name: "Others",
              items: [
                {
                  type: "file",
                  fileType: "image",
                  id: "11",
                  name: "Screenshot3.png",
                },
              ],
            },
          ],
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

export function NestedSortableList() {
  return (
    <ul className="menu menu-xs bg-base-200 rounded-lg max-w-xs w-full">
      {sampleSidebar.items.map((item) => {
        if (item.type === "folder") {
          return <ItemFolder folder={item} key={item.id} />;
        }

        return <ItemFile item={item} key={item.id} />;
      })}
    </ul>
  );
}
