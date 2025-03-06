import { useEffect, useState } from "react";
import { cn } from "../../../utils/cn";

export const TextGenerateEffect = ({
  words,
  className,
}: {
  words: string;
  className?: string;
}) => {
  const [wordArray, setWordArray] = useState<string[]>([]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setWordArray(words.split(" "));
    }, 0);

    return () => clearTimeout(timeout);
  }, [words]);

  return (
    <div className={cn("font-bold", className)}>
      {wordArray.map((word, idx) => {
        return (
          <div
            key={`${word}-${idx}`}
            className="inline-block"
          >
            {word.split("").map((char, index) => {
              return (
                <span
                  key={`${char}-${index}`}
                  className="animate-text-reveal inline-block opacity-0"
                  style={{
                    animationDelay: `${index * 0.05 + idx * 0.1}s`,
                    animationFillMode: "forwards",
                  }}
                >
                  {char}
                </span>
              );
            })}
            <span className="inline-block">&nbsp;</span>
          </div>
        );
      })}
    </div>
  );
};