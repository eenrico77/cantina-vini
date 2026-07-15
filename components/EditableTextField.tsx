import { useState, useRef, useEffect } from "react";

export default function EditableTextField({
  label,
  name,
  value,
  onChange,
  placeholder = "Aggiungi...",
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: any) => void;
  placeholder?: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [localVal, setLocalVal] = useState(value);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setLocalVal(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [isEditing, localVal]);

  const handleSave = () => {
    onChange({ target: { name, value: localVal, type: "textarea" } });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setLocalVal(value);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="mb-4">
        <label className="block text-[10px] font-bold text-ink-500 uppercase tracking-wider mb-2">{label}</label>
        <div className="bg-sand-50 rounded-2xl p-3 border border-sand-200">
          <textarea
            ref={textareaRef}
            name={name}
            value={localVal}
            onChange={e => setLocalVal(e.target.value)}
            className="w-full bg-transparent p-1 outline-none resize-none text-ink-700 text-sm overflow-hidden"
            placeholder={placeholder}
            rows={1}
            autoFocus
          />
          <div className="flex gap-2 mt-2">
            <button type="button" onClick={handleSave} className="bg-brand-500 text-white px-3 py-1.5 rounded font-bold text-xs shadow-sm">
              Fatto
            </button>
            <button type="button" onClick={handleCancel} className="text-ink-500 font-bold text-xs px-2">
              Annulla
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4 group">
      <div className="flex items-center gap-2 mb-1.5">
        <label className="block text-[10px] font-bold text-ink-500 uppercase tracking-wider">{label}</label>
        <button 
          type="button" 
          onClick={() => setIsEditing(true)} 
          className="text-brand-500 opacity-50 group-hover:opacity-100 transition-opacity p-1 -ml-1"
          title="Modifica"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
      </div>
      {value ? (
        <p className="text-sm text-ink-700 leading-relaxed whitespace-pre-wrap">{value}</p>
      ) : (
        <p className="text-sm text-ink-400 italic cursor-pointer" onClick={() => setIsEditing(true)}>{placeholder}</p>
      )}
    </div>
  );
}
