import { createSignal } from "solid-js";
import programme from "./programme.json";

type Block = (typeof programme)[number];

const getTimeY = (time: string) => {
  const [h, m] = time.split(":").map((s) => parseInt(s, 10));
  return h + m / 60;
};

const minStartTimeY = Math.min(...programme.map((b) => b.start).map(getTimeY));
const maxEndTimeY = Math.max(...programme.map((b) => b.end).map(getTimeY));

const cols: Array<{ date: string; blocks: Block[] }> = [];

function overlap(start1: number, end1: number, start2: number, end2: number) {
  return !(end1 <= start2 || end2 <= start1);
}

for (const block of programme) {
  const available = cols.find((c) => {
    return (
      c.date === block.date &&
      !c.blocks.find((b) => {
        const [start1, end1] = [b.start, b.end].map(getTimeY);
        const [start2, end2] = [block.start, block.end].map(getTimeY);
        return overlap(start1, end1, start2, end2);
      })
    );
  });

  if (available) {
    available.blocks.push(block);
  } else {
    cols.push({ date: block.date, blocks: [block] });
  }
}

export function App() {
  return (
    <div class="fixed inset-8">
      <Programme />
    </div>
  );
}

const getYPercent = (time: string) => {
  const y = getTimeY(time);
  return ((y - minStartTimeY) * 100) / (maxEndTimeY - minStartTimeY);
};

function Programme() {
  const numCols = cols.length;
  const colWidthPercent = 100 / numCols;

  return (
    <>
      {cols.map((col, i) => {
        return (
          <>
            {col.blocks.map((block) => {
              const titleWords = block.title.split(" ");
              const splitAt = Math.floor(titleWords.length / 2);
              const titleLineA = titleWords.slice(0, splitAt).join(" ");
              const titleLineB = titleWords.slice(splitAt).join(" ");

              return (
                <div
                  style={{
                    left: `${i * colWidthPercent}%`,
                    width: `${colWidthPercent}%`,
                    top: `${getYPercent(block.start)}%`,
                    height: `${
                      ((getTimeY(block.end) - getTimeY(block.start)) * 100) /
                      (maxEndTimeY - minStartTimeY)
                    }%`,
                  }}
                  class="absolute"
                >
                  <div class="absolute inset-[1px] bg-amber-400">
                    <img src={block.imageUrl} class="w-full h-auto" />
                    <div class="absolute top-full text-[8px] leading-[9px] font-bold transform-gpu origin-top-left -rotate-90">
                      <div class="whitespace-nowrap">{titleLineA}</div>
                      <div class="whitespace-nowrap">{titleLineB}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        );
      })}
    </>
  );
}
