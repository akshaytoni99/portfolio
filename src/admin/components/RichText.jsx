import { useEffect, useRef } from "react";

const CSS = `
.adm-rt { border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; overflow: hidden; background: rgba(255,255,255,0.03); }
.adm-rt-toolbar { display: flex; gap: 2px; padding: 6px; border-bottom: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.02); }
.adm-rt-btn { min-width: 28px; height: 26px; padding: 0 8px; border: none; border-radius: 6px; background: transparent; color: rgba(255,255,255,0.75); font-size: 13px; cursor: pointer; font-family: inherit; }
.adm-rt-btn:hover { background: rgba(99,102,241,0.2); color: #fff; }
.adm-rt-area { min-height: 96px; padding: 10px 12px; font-size: 14px; line-height: 1.6; color: rgba(255,255,255,0.9); outline: none; }
.adm-rt-area:focus { box-shadow: inset 0 0 0 1px #6366f1; }
.adm-rt-area:empty::before { content: attr(data-placeholder); color: rgba(255,255,255,0.3); pointer-events: none; }
.adm-rt-area a { color: #38bdf8; }
.adm-rt-area ul { padding-left: 20px; margin: 6px 0; }
`;

let stylesInjected = false;
function injectStyles() {
  if (stylesInjected || typeof document === "undefined") return;
  stylesInjected = true;
  const style = document.createElement("style");
  style.dataset.admRichText = "";
  style.textContent = CSS;
  document.head.appendChild(style);
}

export default function RichText({ value, onChange, placeholder }) {
  injectStyles();
  const areaRef = useRef(null);

  useEffect(() => {
    const el = areaRef.current;
    if (el && (value || "") !== el.innerHTML) {
      el.innerHTML = value || "";
    }
  }, [value]);

  const emit = () => {
    const el = areaRef.current;
    if (!el) return;
    // Browsers leave <br>/<div><br></div> behind after select-all + delete;
    // treat text-empty content as truly empty so the placeholder returns and
    // no blank line gets published.
    onChange(el.textContent.trim() ? el.innerHTML : "");
  };

  const exec = (command, arg) => {
    areaRef.current?.focus();
    document.execCommand(command, false, arg);
    emit();
  };

  const addLink = () => {
    const url = window.prompt("Link URL:");
    if (!url) return;
    // "example.com" would resolve as a relative link and 404; give it a scheme.
    const normalized = /^([a-z]+:|#|\/)/i.test(url.trim()) ? url.trim() : `https://${url.trim()}`;
    exec("createLink", normalized);
  };

  const clearFormatting = () => {
    areaRef.current?.focus();
    document.execCommand("removeFormat");
    document.execCommand("unlink");
    emit();
  };

  const keepSelection = (e) => e.preventDefault();

  return (
    <div className="adm-rt">
      <div className="adm-rt-toolbar">
        <button
          type="button"
          className="adm-rt-btn"
          title="Bold"
          style={{ fontWeight: 700 }}
          onMouseDown={keepSelection}
          onClick={() => exec("bold")}
        >
          B
        </button>
        <button
          type="button"
          className="adm-rt-btn"
          title="Italic"
          style={{ fontStyle: "italic" }}
          onMouseDown={keepSelection}
          onClick={() => exec("italic")}
        >
          I
        </button>
        <button
          type="button"
          className="adm-rt-btn"
          title="Bullet list"
          onMouseDown={keepSelection}
          onClick={() => exec("insertUnorderedList")}
        >
          • List
        </button>
        <button
          type="button"
          className="adm-rt-btn"
          title="Insert link"
          onMouseDown={keepSelection}
          onClick={addLink}
        >
          Link
        </button>
        <button
          type="button"
          className="adm-rt-btn"
          title="Clear formatting"
          onMouseDown={keepSelection}
          onClick={clearFormatting}
        >
          Clear
        </button>
      </div>
      <div
        ref={areaRef}
        className="adm-rt-area"
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder || ""}
        onInput={emit}
        onBlur={emit}
      />
    </div>
  );
}
