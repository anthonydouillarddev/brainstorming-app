"use client";

import { useCreateBlockNote } from "@blocknote/react";
import type { Block, PartialBlock } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { useEffect, useRef, useState } from "react";
import "./blocknote-overrides.css";

type Props = {
  initialBlocks: PartialBlock[] | null;
  initialMarkdown: string;
  theme: "light" | "dark";
  onChange: (patch: { content_blocks: Block[]; content: string }) => void;
};

function isNonEmptyBlockArray(value: unknown): value is PartialBlock[] {
  return Array.isArray(value) && value.length > 0;
}

export default function BlockNoteEditor({
  initialBlocks,
  initialMarkdown,
  theme,
  onChange,
}: Props) {
  const [ready, setReady] = useState(isNonEmptyBlockArray(initialBlocks));
  const editor = useCreateBlockNote({
    initialContent: isNonEmptyBlockArray(initialBlocks)
      ? initialBlocks
      : undefined,
  });
  const bootstrappedRef = useRef(false);

  // Import markdown legacy (content) au premier mount si pas de blocks.
  useEffect(() => {
    if (bootstrappedRef.current) return;
    bootstrappedRef.current = true;
    if (isNonEmptyBlockArray(initialBlocks)) return;
    let cancelled = false;
    (async () => {
      if (initialMarkdown.trim()) {
        const blocks = await editor.tryParseMarkdownToBlocks(initialMarkdown);
        if (cancelled) return;
        editor.replaceBlocks(editor.document, blocks);
      }
      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [editor, initialBlocks, initialMarkdown]);

  async function handleChange() {
    const blocks = editor.document;
    const markdown = await editor.blocksToMarkdownLossy(blocks);
    onChange({ content_blocks: blocks, content: markdown });
  }

  return (
    <div className="flex-1 min-h-[400px] bg-background/40 border border-border rounded-xl overflow-hidden">
      {!ready ? (
        <div className="p-6 text-sm text-muted">
          Importation du contenu…
        </div>
      ) : (
        <BlockNoteView
          editor={editor}
          theme={theme}
          onChange={handleChange}
        />
      )}
    </div>
  );
}
