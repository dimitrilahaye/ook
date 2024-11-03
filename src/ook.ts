import Configuration from "./configuration.js";
import Visit from "./decorators/visit.js";
import Deployer from "./deployer/deployer.js";
import type Generator from "./generators/generator.js";
import VisitGenerator from "./generators/visit/visit-generator.js";
import Server from "./server/server.js";

export type Generators = "visit" | "classes" | "sequence";
export type Strategies = "decorator" | "jsdoc";

export default class Ook {
  private generator: Generator;
  private readonly configuration: Configuration;
  private readonly server: Server;
  private readonly deployer: Deployer;

  constructor() {
    this.configuration = new Configuration();
    this.server = new Server(this.configuration);
    this.deployer = new Deployer(this.configuration);
  }

  setContext(generator: Generators) {
    switch (generator) {
      case "visit":
        this.generator = new VisitGenerator(this.configuration);
        break;
      default:
        throw new Error(`Unknown generator "${generator}"`);
    }
  }

  /**
   * @visit
   * @theme Découverte de Ook
   * @step 10
   * @description La méthode `generate` est chargée de générer la documentation demandée.
   */
  async generate(): Promise<void> {
    await this.generator.generate();
  }

  @Visit({
    theme: "Découverte de Ook",
    step: 11,
    description:
      "La méthode `serve` permet de lancer la documentation en local.",
  })
  async serve(): Promise<void> {
    await this.server.serve();
  }

  async deploy(): Promise<void> {
    await this.deployer.deploy();
  }
}
