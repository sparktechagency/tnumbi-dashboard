"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

// import {
//   useAddSupportContentMutation,
//   useGetSupportContentQuery,
// } from "@/redux/feature/support-page/SupportPageApi";
import { toast } from "sonner";
import { Button } from "../ui/button";

const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

interface RichTextEditorProps {
  placeholder?: string;
  height?: string;
  type: string;
}

export default function TextEditor({
  placeholder = "Start typing...",
  height = "70vh",
  type,
}: RichTextEditorProps) {
  const { data: supportContent, refetch } = useGetSupportContentQuery({
    type: type,
  });
  const [content, setContent] = useState("");
  const [addSupportContent] = useAddSupportContentMutation();
  const handleSaveChanges = () => {
    const newContent = {
      content: content,
      type: type,
    };
    toast.promise(addSupportContent({ data: newContent }).unwrap(), {
      loading: "Saving changes...",
      success: (res) => {
        refetch();
        return <b>{res.message}</b>;
      },
      error: (err: any) => `Error: ${err.message || "Something went wrong"}`,
    });
  };

  useEffect(() => {
    if (supportContent) {
      setContent(supportContent?.data?.content || "");
    }
  }, [supportContent?.data]);

  const editor = useRef(null);

  const config = {
    readonly: false,
    placeholder,
    style: {
      height,
      background: "white",
      borderRadius: "6px",
      padding: "8px",
    },
  };

  return (
    <section className="relative min-h-[calc(100vh-120px)] bg-white p-6 ">
      <div className="jodit-container">
        <JoditEditor
          ref={editor}
          value={content}
          config={config}
          onBlur={(newContent) => setContent(newContent)}
          onChange={() => {}}
        />
      </div>
      <div className="absolute bottom-20 right-6">
        <Button
          size="lg"
          className="!bg-[#1a5fa4] !text-white !border-none"
          onClick={handleSaveChanges}
        >
          Save Changes
        </Button>
      </div>
    </section>
  );
}