const { readdir } = require("fs/promises");
const { exec } = require("child_process");
const { basename } = require("path");

const mermaidDirectory = "./src/mermaid/";

const removeFileExtension = (fileNameWithExtension) =>
  basename(fileNameWithExtension, ".mmd");

const generateSVGFromFileName = (fileNameWithoutExtension) => {
  const inputPath = `${mermaidDirectory}${fileNameWithoutExtension}.mmd`;
  const outputPath = `static/${fileNameWithoutExtension}.svg`;

  exec(
    `"./node_modules/.bin/mmdc" -i ${inputPath} -o ${outputPath}`,
    (error) => {
      if (error) {
        console.log(`Error: ${error}`);
      }
    }
  );
};

readdir(mermaidDirectory)
  .then((files) =>
    files.map(removeFileExtension).forEach(generateSVGFromFileName)
  )
  .catch((err) => console.log(err));
