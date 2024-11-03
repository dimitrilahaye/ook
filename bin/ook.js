#!/usr/bin/env node
import Ook from "../dist/ook.js";

const [, , command, option] = process.argv;

let ook = null;

if (["generate", "g"].includes(command)) {
  ook = new Ook();
  ook.setContext(option);
  await ook.generate();
}

if (["serve", "s"].includes(command)) {
  ook = new Ook();
  await ook.serve();
}

if (["deploy", "d"].includes(command)) {
  ook = new Ook();
  await ook.deploy();
}
