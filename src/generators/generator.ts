import type Configuration from "../configuration.js";

export default abstract class Generator {
  constructor(protected readonly configuration: Configuration) {}

  abstract generate(): Promise<void>;
}
