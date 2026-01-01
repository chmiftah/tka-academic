"use client";

import React from "react";
import "katex/dist/katex.min.css";
import Latex from "react-latex-next";

interface MathRendererProps {
    text: string;
    block?: boolean;
    className?: string; // Allow passing Tailwind classes
}

/**
 * Renders text containing LaTeX math.
 * Standard delimiters:
 * - Inline: $...$
 * - Block: $$...$$
 */
export default function MathRenderer({ text, block = false, className = "" }: MathRendererProps) {
    if (!text) return null;

    return (
        <div className={`math-renderer ${className}`}>
            <Latex>{text}</Latex>
        </div>
    );
}
