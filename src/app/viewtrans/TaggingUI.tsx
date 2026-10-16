import ComboBox from "@/components/ComboBox";
import { useEffect, useState } from "react";

type TagginUIParams = {
  isSave: boolean;
  onReadyToClose: (tags: Array<Tag>) => void;
};

export default function TaggingUI({ isSave, onReadyToClose }: TagginUIParams) {
  // const [loading, setLoading] = useState(false);
  // const [isError, setIsError] = useState(false);
  const [tagList, setTagList] = useState<Array<Tag>>([]);
  const [tag, setTag] = useState<Tag>();
  const [tags, setTags] = useState<Array<Tag>>([]);

  useEffect(() => {
    (async () => {
      const resp = await fetch("/api/Tags", { method: "GET" });
      const tags: Array<Tag> = await resp.json();
      setTagList(tags);
    })();
  }, []);

  useEffect(() => {
    if (!tag) return;
    const newArray = [...tags];
    const idx = newArray.findIndex((i) => i.tag_name == tag.tag_name);
    if (idx !== -1) newArray.splice(idx, 1);
    else newArray.push(tag);
    setTags(newArray);
    setTag(undefined);
  }, [tag]);

  useEffect(() => {
    if (isSave && tags.length > 0) onReadyToClose(tags);
  }, [isSave]);

  return (
    <div className="p-2 flex flex-col gap-2 w-xs">
      <ComboBox<Tag>
        className="w-full border-cyan-500 focus:ring-cyan-500"
        displayValue="tag_name"
        options={tagList}
        label="Select Tag"
        allowNewValue={true}
        value={tag}
        onChange={(newV) => setTag(newV)}
      />
      <div>
        {tags.length === 0 ? (
          "No tag is selected"
        ) : (
          <div className="flex flex-col gap-1 items-start text-xs font-mono ">
            {tags.map((i, j) => (
              <div key={j} className="bg-blue-200 p-1 rounded-md flex gap-3">
                <div>#{i.tag_name}</div>
                <div
                  className="cursor-pointer"
                  onClick={() => {
                    setTag(i);
                  }}
                >
                  ❌
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
