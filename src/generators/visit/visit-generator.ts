import * as path from "node:path";
import * as fse from "fs-extra";
import Generator from "../generator.js";
import type Configuration from "../../configuration.js";
import HtmlBuilder from "./html-builder.js";
import Visit from "../../decorators/visit.js";
import DecoratorExtractor from "./extractors/decorator-extractor.js";
import type DataExtractor from "./data-extractor.js";
import JsDocExtractor from "./extractors/jsdoc-extractor.js";
const { ensureDir } = fse;

/**
 * @visit
 * @theme Découverte de Ook
 * @step 1
 * @description Classe permettant de générer la documentation pour la visite guidée
 */
export default class VisitGenerator extends Generator {
  @Visit({
    theme: "Découverte de Ook",
    step: 30,
    description: "Le `VisitGenerator` se charge de l'HTML builder",
  })
  private readonly htmlBuilder: HtmlBuilder;
  /**
   * @visit
   * @theme Découverte de Ook
   * @step 65
   * @description Le VisitGenerator se charge aussi de l'extracteur de données
   */
  private readonly dataExtractor: DataExtractor;

  constructor(configuration: Configuration) {
    super(configuration);
    const strategy = configuration.getStrategyFor("visit");
    switch (strategy) {
      case "decorator":
        this.dataExtractor = new DecoratorExtractor(configuration);
        break;
      case "jsdoc":
        this.dataExtractor = new JsDocExtractor(configuration);
        break;
      default:
        throw new Error(`Unknown strategy ${strategy}`);
    }
    this.htmlBuilder = new HtmlBuilder(configuration);
  }

  async generate(): Promise<void> {
    const docsPath = path.join(this.configuration.target);
    await ensureDir(docsPath);
    const themeData = await this.dataExtractor.extract();
    await this.htmlBuilder.build(themeData);
    await this.htmlBuilder.buildMainFor("visits");
    console.log("Documentation générée avec succès !");
  }
}
