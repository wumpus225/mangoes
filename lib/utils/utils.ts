import fs from "fs-extra";
import os from "os";
import path from "path";
import crypto from "crypto";
import imageSize from "image-size";
import PDFDocument from "pdfkit";

export async function generateTempDirectory() {
  const parentDirname = path.join(os.tmpdir(), "mango-cli");

  await fs.mkdirs(parentDirname);

  const tempId = "mango-".concat(crypto.randomUUID());
  const tempDirname = path.join(parentDirname, tempId);

  await fs.mkdirs(tempDirname);

  return tempDirname;
}

export function convertFolderToPDF(folder: string, outputPath: string): void {
  let document = new PDFDocument();

  fs.readdir(folder, (_, files) => {
    const sorted = naturalIntegerSort(files);

    sorted.forEach((file) => {
      const filePath = `${folder}/${file}`;
      try {
        const size = imageSize(filePath);

        document.addPage({ size: [size.width!, size.height!] });

        document.image(filePath, 0, 0, {
          width: size.width,
          height: size.height,
        });
      } catch (e) {
        console.log("Error: " + e);
      }
    });

    document.pipe(fs.createWriteStream(outputPath));
    document.end();
  });
}

function naturalIntegerSort(array: string[]) {
  const { compare } = new Intl.Collator(undefined, {
    numeric: true,
    sensitivity: "base",
  });

  return array.sort(compare);
}
