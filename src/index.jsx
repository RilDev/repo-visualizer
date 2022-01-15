import React from "react";
import ReactDOMServer from "react-dom/server";
import fs from "fs";

import { processDir } from "./process-dir.js";
import { Tree } from "./Tree.tsx";

const main = async () => {
  const rootPath = ""; // Micro and minimatch do not support paths starting with ./
  const maxDepth = 9;
  const colorEncoding = "type";
  // const commitMessage = core.getInput("commit_message") || "Repo visualizer: updated diagram"
  const excludedPathsString =
    "node_modules,bower_components,dist,out,build,eject,.next,.netlify,.yarn,.git,.vscode,package-lock.json,yarn.lock";
  const excludedPaths = excludedPathsString.split(",").map((str) => str.trim());

  // Split on semicolons instead of commas since ',' are allowed in globs, but ';' are not + are not permitted in file/folder names.
  const excludedGlobsString = "";
  const excludedGlobs = excludedGlobsString.split(";");

  const data = await processDir(rootPath, excludedPaths, excludedGlobs);

  const componentCodeString = ReactDOMServer.renderToStaticMarkup(
    <Tree data={data} maxDepth={+maxDepth} colorEncoding={colorEncoding} />
  );

  const outputFile = "./diagram.svg";

  await fs.writeFileSync(outputFile, componentCodeString);
}

main().catch((e) => {
  core.setFailed(e)
})

function execWithOutput(command, args) {
  return new Promise((resolve, reject) => {
    try {
      exec(command, args, {
        listeners: {
          stdout: function(res) {
            core.info(res.toString())
            resolve(res.toString())
          },
          stderr: function(res) {
            core.info(res.toString())
            reject(res.toString())
          }
        }
      })
    } catch (e) {
      reject(e)
    }
  })
};
