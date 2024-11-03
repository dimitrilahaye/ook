import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as fse from "fs-extra";
import type Configuration from "../configuration.js";
const { outputFile } = fse;

export default abstract class HtmlBuilder {
  constructor(protected readonly configuration: Configuration) {}

  async buildMainFor(section: "visits") {
    await this.buildRootIndexPage(section);
    await this.buildCssFile();
  }

  private async buildCssFile() {
    const cssFilePath = path.join(
      this.configuration.target,
      "src",
      "styles.css"
    );

    const content = `
  a {
    color: #cf81db;
  }
  .copy, details {
    cursor: pointer;
  }
  .container {
    margin-left: 20px;
    border-left: #cf81db 5px solid;
  }
  .section {
    padding-top: 10px;
    padding-bottom: 10px;
    padding-left: 30px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
  .container .section:first-child {
    padding-top: 0px;
  }
  .step-title {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
  }
  .title.is-2 {
    display: flex;
    align-items: flex-start;
    flex-direction: column;
  }
  .relative-path {
    color: grey;
    font-style: italic;
    font-size: 0.9rem;
  }
  .type {
    color: grey;
    font-weight: normal;
    font-style: italic;
  }
  .class-name {
    font-weight: normal;
    font-style: italic;
    color: #e79b9b;
  }
  .name {
    color: #cf81db;
  }
  .step {
    border: 5px solid #cf81db;
    border-radius: 50%;
    font-size: 15px;
    width: 40px;
    height: 40px;
    display: flex;
    color: #e79b9b;
    justify-content: center;
    align-items: center;
    position: absolute;
    left: -24px;
    background: white;
    padding: 18px;
  }
      `;

    await outputFile(cssFilePath, content);
  }

  private async buildRootIndexPage(section: "visits") {
    const rootIndexPath = path.join(
      this.configuration.target,
      "src",
      "index.html"
    );

    let content = `
        <!DOCTYPE html>
          <html lang="en" xml:lang="en">
          <head>
            <meta charset="UTF-8">
            <title>Documentation</title>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@1.0.2/css/bulma.min.css">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css" integrity="sha512-Kc323vGBEqzTmouAECnVceyQqyqdsSiqLQISBL29aUW4U/M7pSPA/gEUZQqv1cwx4OnYxTxve5UMg5GT6L4JJg==" crossorigin="anonymous" referrerpolicy="no-referrer" />
            <link rel="stylesheet" href="styles.css">
          </head>
          <body>
            <h1 class="title is-1">Documentation</h1>
            <ul>
            </ul>
          </body>
        </html>
      `;

    if (await fse.pathExists(rootIndexPath)) {
      content = await fs.readFile(rootIndexPath, "utf-8");
    }

    const linkToAdd = `<li><a href="${section}/index.html">${section}</a></li>`;
    if (!content.includes(linkToAdd)) {
      content = content.replace("<ul>", `<ul>${linkToAdd}`);

      await outputFile(rootIndexPath, content);
    }
  }
}
