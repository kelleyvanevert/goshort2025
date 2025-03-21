import fs from "fs";
import sharp from "sharp";

import programme from "../src/programme.json" with { type: "json" };

for (const block of programme) {
  console.log("image...");
  const image = await fetch(block.imageUrl);
  const imageBuffer = await image.arrayBuffer();
  const imageSharpBuf = await sharp(imageBuffer).resize({
    height: 100,
  }).webp({}).toBuffer();

  block.imageUrlBase64 = `data:image/png;base64,${imageSharpBuf.toString('base64')}`;
}

fs.writeFileSync("./programme2.json",JSON.stringify(programme, null,2), "utf-8")
