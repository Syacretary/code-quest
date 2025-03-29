import { useEffect, useRef } from "react";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  theme?: string;
}

export function CodeEditor({
  value,
  onChange,
  language = "python",
  theme = "vs-dark",
}: CodeEditorProps) {
  const editorRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Check if Monaco is already loaded
    if (window.monaco) {
      initMonaco();
    } else {
      // Load Monaco dynamically
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.46.0/min/vs/loader.min.js";
      script.async = true;
      script.onload = () => {
        window.require.config({
          paths: { vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.46.0/min/vs" }
        });
        
        window.require(["vs/editor/editor.main"], initMonaco);
      };
      document.body.appendChild(script);
    }

    return () => {
      // Dispose the editor when component unmounts
      if (editorRef.current) {
        editorRef.current.dispose();
      }
    };
  }, []);

  // Initialize Monaco editor
  const initMonaco = () => {
    if (!containerRef.current || editorRef.current) return;
    
    // Create editor instance
    editorRef.current = window.monaco.editor.create(containerRef.current, {
      value,
      language,
      theme,
      automaticLayout: true,
      minimap: { enabled: false },
      lineNumbers: "on",
      roundedSelection: false,
      scrollBeyondLastLine: false,
      readOnly: false,
      tabSize: 2,
      fontSize: 14,
    });

    // Add change listener
    editorRef.current.onDidChangeModelContent(() => {
      onChange(editorRef.current.getValue());
    });
  };

  // Update editor content when value prop changes
  useEffect(() => {
    if (editorRef.current) {
      const currentValue = editorRef.current.getValue();
      if (value !== currentValue) {
        editorRef.current.setValue(value);
      }
    }
  }, [value]);

  return (
    <div ref={containerRef} className="h-full w-full" />
  );
}
