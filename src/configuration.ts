import * as fs from "node:fs";
import * as path from "node:path";
import type { Generators, Strategies } from "./ook.js";

export default class Configuration {
  readonly source: string;
  readonly target: string;
  readonly port: string;
  readonly repository: string;
  readonly branch: string;
  readonly pagesBranch: string;
  readonly strategies: {
    [key in Generators]: Strategies;
  }[];

  constructor() {
    const configPath = path.resolve("ook.config.json");
    const configExists = fs.existsSync(configPath);
    if (!configExists) {
      throw new Error("Fichier ook.config.json introuvable.");
    }

    const configFile = fs.readFileSync(configPath, { encoding: "utf-8" });
    const config = JSON.parse(configFile);
    this.source = config.source;
    this.target = config.target;
    this.port = config.port;
    this.repository = config.repository;
    this.branch = config.branch;
    this.pagesBranch = config.pagesBranch;
    this.strategies = config.strategies;
  }

  getStrategyFor(generator: Generators): Strategies {
    return this.strategies.find((s) => generator in s)[generator];
  }
}
