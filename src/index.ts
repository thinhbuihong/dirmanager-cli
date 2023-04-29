#! /usr/bin/env node

import { Command } from "commander";
import { resolve } from "path";
import { readdir, lstat } from "fs/promises";
import { textSync } from "figlet";
import { existsSync, mkdirSync, openSync } from "fs";

console.log(textSync("Dir Manager"));

const program = new Command();

program
  .version("1.0.0")
  .description("An example CLI for managing a directory")
  .option("-l, --ls [value]", "List directory contents")
  .option("-m, --mkdir <value>", "Create a directory")
  .option("-t, --touch <value>", "Create a file")
  .parse(process.argv);

const options = program.opts();

async function listDirContents(filepath: string) {
  try {
    const files = await readdir(filepath);
    const detailedFilesPromises = files.map(async (file: string) => {
      let fileDetails = await lstat(resolve(filepath, file));
      const { size, birthtime } = fileDetails;
      return { filename: file, "size(KB)": size, created_at: birthtime };
    });

    const detailedFiles = await Promise.all(detailedFilesPromises);
    console.table(detailedFiles);
  } catch (error) {
    console.error("Error occurred while reading the directory!", error);
  }
}

function createDir(filepath: string) {
  if (!existsSync(filepath)) {
    mkdirSync(filepath);
    console.log("The directory has been created successfully");
  }
}

function createFile(filepath: string) {
  openSync(filepath, "w");
  console.log("An empty file has been created");
}

if (options.ls) {
  const filepath = typeof options.ls === "string" ? options.ls : __dirname;
  listDirContents(filepath);
}

if (options.mkdir) {
  createDir(resolve(__dirname, options.mkdir));
}
if (options.touch) {
  createFile(resolve(__dirname, options.touch));
}

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
