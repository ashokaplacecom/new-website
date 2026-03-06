"use client";

import React, { useRef, useState, useCallback } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface OtpInputProps {
    length?: number;
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    error?: boolean;
}

export function OtpInput({
    length = 4,
    value,
    onChange,
    disabled = false,
    error = false,
}: OtpInputProps) {
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

    const digits = value.split("").concat(Array(length).fill("")).slice(0, length);

    const focusInput = useCallback(
        (index: number) => {
            if (index >= 0 && index < length) {
                inputRefs.current[index]?.focus();
            }
        },
        [length]
    );

    const handleChange = useCallback(
        (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
            const val = e.target.value;
            if (!/^\d*$/.test(val)) return;

            const digit = val.slice(-1);
            const newValue = value.split("");
            newValue[index] = digit;
            const joined = newValue.join("").slice(0, length);
            onChange(joined);

            if (digit && index < length - 1) {
                focusInput(index + 1);
            }
        },
        [value, length, onChange, focusInput]
    );

    const handleKeyDown = useCallback(
        (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Backspace") {
                e.preventDefault();
                const newValue = value.split("");
                if (newValue[index]) {
                    newValue[index] = "";
                    onChange(newValue.join(""));
                } else if (index > 0) {
                    newValue[index - 1] = "";
                    onChange(newValue.join(""));
                    focusInput(index - 1);
                }
            } else if (e.key === "ArrowLeft" && index > 0) {
                focusInput(index - 1);
            } else if (e.key === "ArrowRight" && index < length - 1) {
                focusInput(index + 1);
            }
        },
        [value, length, onChange, focusInput]
    );

    const handlePaste = useCallback(
        (e: React.ClipboardEvent) => {
            e.preventDefault();
            const pasted = e.clipboardData
                .getData("text")
                .replace(/\D/g, "")
                .slice(0, length);
            onChange(pasted);
            focusInput(Math.min(pasted.length, length - 1));
        },
        [length, onChange, focusInput]
    );

    return (
        <div className="flex items-center justify-center gap-3">
            {digits.map((digit, index) => (
                <motion.div
                    key={index}
                    animate={{
                        scale: focusedIndex === index ? 1.05 : 1,
                        borderColor:
                            error
                                ? "oklch(0.5835 0.2301 27.6348)"
                                : focusedIndex === index
                                    ? "oklch(0.2520 0.1668 265.3131)"
                                    : digit
                                        ? "oklch(0.7 0 0)"
                                        : "oklch(0.9220 0 0)",
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className={cn(
                        "relative flex h-14 w-14 items-center justify-center",
                        "rounded-xl border-2 bg-background",
                        "transition-shadow duration-200",
                        focusedIndex === index && "shadow-md",
                        error && "shadow-destructive/10"
                    )}
                >
                    <input
                        ref={(el) => {
                            inputRefs.current[index] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        pattern="\d*"
                        maxLength={1}
                        value={digit}
                        disabled={disabled}
                        onChange={(e) => handleChange(index, e)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onFocus={() => setFocusedIndex(index)}
                        onBlur={() => setFocusedIndex(null)}
                        onPaste={handlePaste}
                        className={cn(
                            "h-full w-full bg-transparent text-center text-xl font-semibold",
                            "outline-none caret-primary",
                            "disabled:opacity-50 disabled:cursor-not-allowed",
                            error && "text-destructive"
                        )}
                        aria-label={`Digit ${index + 1}`}
                    />
                    {!digit && focusedIndex === index && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ duration: 1.2, repeat: Infinity }}
                            className="pointer-events-none absolute inset-0 flex items-center justify-center"
                        >
                            <div className="h-6 w-[2px] rounded-full bg-primary" />
                        </motion.div>
                    )}
                </motion.div>
            ))}
        </div>
    );
}
