import { useState } from "react";
import { SimpleList } from "./examples/SimpleList";
import { SimpleNestedList } from "./examples/SimpleNestedList";

type DemoType = "nested" | "flat";

export default function App() {
  const [demoType, setDemoType] = useState<DemoType>("nested");

  return (
    <div className="p-4">
      <select
        className="select select-bordered mb-4"
        value={demoType}
        onChange={(e) => setDemoType(e.target.value as unknown as DemoType)}
      >
        <option value="flat">Flat</option>
        <option value="nested">Simple Nested</option>
      </select>
      {demoType === "nested" && (
        <ListWrapper description="Nested. Drag items across folders or levels.">
          <SimpleNestedList />
        </ListWrapper>
      )}
      {demoType === "flat" && (
        <ListWrapper description="Basic example of a flat list.">
          <SimpleList />
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
