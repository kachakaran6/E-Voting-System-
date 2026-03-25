import React, { useRef, useState, useEffect } from "react";
import clsx from "clsx";

type Props = {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
};

export function OtpInput({ length = 6, value, onChange, error }: Props) {
  const [items, setItems] = useState<string[]>(new Array(length).fill(""));
  const inputRefs = useRef<HTMLInputElement[]>([]);

  useEffect(() => {
    const newItems = value.split("").slice(0, length);
    while (newItems.length < length) newItems.push("");
    setItems(newItems);
  }, [value, length]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>, index: number) {
    const val = e.target.value;
    if (!/^\d*$/.test(val)) return;

    const newItems = [...items];
    newItems[index] = val.slice(-1);
    const newValue = newItems.join("");
    onChange(newValue);

    if (val && index < length - 1) {
      inputRefs.current[index + 1].focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>, index: number) {
    if (e.key === "Backspace" && !items[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const data = e.clipboardData.getData("text").slice(0, length);
    if (!/^\d*$/.test(data)) return;
    onChange(data);
  }

  return (
    <div className="flex justify-between gap-2" onPaste={handlePaste}>
      {items.map((item, i) => (
        <input
          key={i}
          ref={(el) => { if (el) inputRefs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={item}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          className={clsx(
            "h-12 w-full max-w-[3rem] text-center text-xl font-bold rounded-xl border-2 bg-white transition-all outline-none",
            error 
              ? "border-danger-300 bg-danger-50 text-danger-900 focus:border-danger-500" 
              : "border-neutral-200 text-neutral-900 focus:border-brand-700/60 focus:ring-4 focus:ring-brand-700/5"
          )}
        />
      ))}
    </div>
  );
}
