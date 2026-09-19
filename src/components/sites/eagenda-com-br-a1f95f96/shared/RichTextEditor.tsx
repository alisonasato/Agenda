"use client";

import { useEffect, useRef, type RefObject } from "react";
import {
  Alignment,
  Autoformat,
  BlockQuote,
  Bold,
  ClassicEditor,
  Essentials,
  Font,
  Heading,
  Italic,
  Link,
  List,
  ListProperties,
  Paragraph,
  PasteFromOffice,
  SourceEditing,
} from "ckeditor5";
import "ckeditor5/ckeditor5.css";

type RichTextEditorProps = {
  /** Receives the editor instance (e.g. to set data or insert text); optional. */
  editorRef?: RefObject<ClassicEditor | null>;
  name: string;
  id: string;
  /** Content language; the original leaves the default ("en") on most forms. */
  language?: string;
  maxLength?: number;
  className?: string;
};

/**
 * The original’s rich-text fields: CKEditor 5 (v43.2.0, via django_ckeditor_5) with the same
 * toolbar, heading, font-family and font-size options everywhere. Its UI strings are English on
 * the live pages too (no translation bundle is loaded). The editor replaces a hidden textarea.
 */
export function RichTextEditor({ editorRef, name, id, language, maxLength, className }: RichTextEditorProps) {
  const hostRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // destroy() shows the source textarea again, which a dev (StrictMode) remount would leave visible.
    const destroy = (e: ClassicEditor) => e.destroy().then(() => hostRef.current?.style.setProperty("display", "none"));
    let editor: ClassicEditor | undefined;
    let cancelled = false;
    ClassicEditor.create(hostRef.current!, {
      plugins: [Essentials, Autoformat, Paragraph, Heading, Bold, Italic, Link, List, ListProperties, BlockQuote, Font, Alignment, PasteFromOffice, SourceEditing],
      toolbar: [
        "heading", "|", "bold", "italic", "link", "bulletedList", "numberedList", "blockQuote", "undo", "redo",
        "fontFamily", "fontSize", "fontColor", "fontBackgroundColor", "alignment", "|", "sourceEditing",
      ],
      heading: {
        options: [
          { model: "paragraph", title: "Paragraph", class: "ck-heading_paragraph" },
          { model: "heading1", view: "h2", title: "Heading 1", class: "ck-heading_heading1" },
          { model: "heading2", view: "h3", title: "Heading 2", class: "ck-heading_heading2" },
          { model: "heading3", view: "h4", title: "Heading 3", class: "ck-heading_heading3" },
        ],
      },
      fontSize: { options: ["tiny", "small", "default", "big", "huge"] },
      fontFamily: {
        options: [
          "default",
          "Arial, Helvetica, sans-serif",
          "Courier New, Courier, monospace",
          "Georgia, serif",
          "Lucida Sans Unicode, Lucida Grande, sans-serif",
          "Tahoma, Geneva, sans-serif",
          "Times New Roman, Times, serif",
          "Trebuchet MS, Helvetica, sans-serif",
          "Verdana, Geneva, sans-serif",
        ],
      },
      ...(language ? { language } : {}),
    }).then((e) => {
      if (cancelled) return void destroy(e);
      editor = e;
      if (editorRef) editorRef.current = e;
    });
    return () => {
      cancelled = true;
      if (editorRef) editorRef.current = null;
      if (editor) destroy(editor);
    };
  }, [editorRef, language]);

  return <textarea ref={hostRef} name={name} id={id} className={className} maxLength={maxLength} rows={10} style={{ display: "none" }} />;
}
