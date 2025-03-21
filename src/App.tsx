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

const pad = 8;
const hourWidth = 130;
const colHeight = 72;

const colWidth = (maxEndTimeY - minStartTimeY) * hourWidth + 340;

export function App() {
  let atDate: string;

  return (
    <div>
      <div
        class="h-screen w-screen overflow-scroll"
        style={{ padding: `${pad}px` }}
      >
        <div class="sticky top-0 h-0 z-[5]">
          {Array.from({ length: 24 }).map((_, i) => {
            return (
              <div
                class="absolute top-[-8px] h-screen z-0 w-[1px] bg-black/50"
                style={{
                  left: `${hourWidth * (i - minStartTimeY)}px`,
                }}
              />
            );
          })}
        </div>

        <div
          class="p-4 pb-8 text-5xl font-black sticky left-0 z-[10]"
          style={{
            "text-shadow": "2px 2px 0 black, 4px 4px 0 #26ddb5",
          }}
        >
          GO SHORT 2025
        </div>

        <div class="sticky top-0 h-0 z-[20]">
          {Array.from({ length: 24 }).map((_, i) => {
            return (
              <div
                class="absolute top-0 text-[11px] bg-purple-900 px-[1px]"
                style={{
                  left: `${hourWidth * (i - minStartTimeY) + 2}px`,
                }}
              >
                {i < 10 && "0"}
                {i}:00
              </div>
            );
          })}
        </div>

        {cols.map((col, i) => {
          const isNewDate = col.date !== atDate;
          atDate = col.date;

          return (
            <>
              {isNewDate && (
                <div class="px-4 flex items-center h-[100px] font-bold text-2xl sticky left-0 z-[10]">
                  {format(col.date, "EEEE d LLLL", { locale: nl })}
                </div>
              )}

              <div
                class="relative z-[10]"
                style={{
                  height: `${colHeight}px`,
                  width: `${colWidth}px`,
                }}
              >
                {col.blocks.map((block) => {
                  return (
                    <a
                      href={block.url}
                      target="_blank"
                      class="absolute transition-all hover:scale-105 hover:shadow-2xl hover:z-[10] hover:outline-offset-1 hover:outline-white hover:outline-2 origin-left hover:!min-w-[340px]"
                      style={{
                        top: 0,
                        left: `${
                          (getTimeY(block.start) - minStartTimeY) * hourWidth
                        }px`,
                        width: `${
                          (getTimeY(block.end) - getTimeY(block.start)) *
                          hourWidth
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
                    </a>
                  );
                })}
              </div>
            </>
          );
        })}
      </div>
    </div>
  );
}
