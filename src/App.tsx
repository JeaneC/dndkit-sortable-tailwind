import { useState } from "react";
import { SimpleList } from "./examples/SimpleList";
import { SimpleNestedList } from "./examples/SimpleNestedList";
import { SimpleNestedListWithDelete } from "./examples/SimpleNestedListWithDelete";

type DemoType = "nested" | "flat" | "nested-delete";

export default function App() {
  const [demoType, setDemoType] = useState<DemoType>("flat");

  return (
    <div className="p-4">
      <select
        className="select select-bordered mb-4"
        value={demoType}
        onChange={(e) => setDemoType(e.target.value as unknown as DemoType)}
      >
        <option value="flat">Flat</option>
        <option value="nested">Simple Nested</option>
        <option value="nested-delete">Simple Nested w/ Delete</option>
      </select>

      {demoType === "flat" && (
        <ListWrapper description="Basic example of a flat list. Drag around items.">
          <SimpleList />
        </ListWrapper>
      )}
      {demoType === "nested" && (
        <ListWrapper description="Nested. Drag items across folders or levels.">
          <SimpleNestedList />
        </ListWrapper>
      )}
      {demoType === "nested-delete" && (
        <ListWrapper description="Nested. Drag items and allow items to be deleted.">
          <SimpleNestedListWithDelete />
        </ListWrapper>
      )}
    </div>
  );
}

function ListWrapper({
  description,
  children,
}: {
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-sm mb-4">{description}</p>
      {children}
    </div>
  );
}
