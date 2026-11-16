"use client";

import { useState } from "react";

interface ReadMoreTextProps {
  paragraphs: string[];
}

export default function ReadMoreText({ paragraphs }: ReadMoreTextProps) {
  const [expanded, setExpanded] = useState(false);
  const textClass = "text-base leading-[26px] tracking-[0.32px]";

  if (!expanded) {
    return (
      <div className={`mt-2 ${textClass}`}>
        <p className="line-clamp-2">{paragraphs[0]}</p>
        <button
          type="button"
          onClick={() => setExpanded(true)}
          aria-expanded={false}
          className="mt-0.5 text-sm font-semibold tracking-[0.28px] cursor-pointer"
        >
          Read more
        </button>
      </div>
    );
  }

  return (
    <div className={`mt-2 ${textClass}`}>
      {paragraphs.map((text, i) => (
        <p key={i} className={i > 0 ? "mt-5" : undefined}>
          {text}
          {i === paragraphs.length - 1 && (
            <>
              {" "}
              <button
                type="button"
                onClick={() => setExpanded(false)}
                aria-expanded
                className="text-sm font-semibold tracking-[0.28px] cursor-pointer"
              >
                Read less
              </button>
            </>
          )}
        </p>
      ))}
    </div>
  );
}
