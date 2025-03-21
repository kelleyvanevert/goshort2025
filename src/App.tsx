import { nl } from "date-fns/locale/nl";
import { format } from "date-fns";

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
  const m = 130;
  const colHeight = 72;

  let atDate: string;

  return (
    <div
      class="p-4"
      style={{
        width: `${(maxEndTimeY - minStartTimeY) * m + 500}px`,
      }}
    >
      <div
        class="p-4 text-5xl font-black"
        style={{
          "text-shadow": "2px 2px 0 black, 4px 4px 0 #26ddb5",
        }}
      >
        GO SHORT 2025
      </div>

      {cols.map((col, i) => {
        const isNewDate = col.date !== atDate;
        atDate = col.date;

        return (
          <>
            {isNewDate && (
              <div class="p-4 font-bold text-xl">
                {format(col.date, "EEEE d LLLL", { locale: nl })}
              </div>
            )}

            <div class="relative" style={{ height: `${colHeight}px` }}>
              {col.blocks.map((block, j) => {
                return (
                  <div
                    class="absolute transition-all hover:scale-105 hover:shadow-2xl hover:z-[10] hover:outline-offset-1 hover:outline-white hover:outline-2 origin-left hover:!min-w-[340px]"
                    style={{
                      top: 0,
                      left: `${(getTimeY(block.start) - minStartTimeY) * m}px`,
                      width: `${
                        (getTimeY(block.end) - getTimeY(block.start)) * m
                      }px`,
                      height: `${colHeight}px`,
                    }}
                  >
                    <div class="absolute inset-[2px] flex gap-[4px] bg-[#00bb84]/90 shadow overflow-hiddn">
                      <div
                        class="h-full aspect-[8/7] bg-cover bg-center"
                        style={{
                          "background-image": `url("${block.imageUrlBase64}")`,
                        }}
                      ></div>
                      <div class="grow text-[12px] leading-[14px] font-semibold text-balance">
                        <div class="pt-[2px] whitespace-nowrap text-[11px] font-medium">
                          {block.start}—{block.end}
                        </div>
                        <div class="mt-[2px] text-balance">{block.title}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        );
      })}
    </div>
  );
}
