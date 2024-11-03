import * as path from "node:path";
import * as fse from "fs-extra";
import Visit from "../../decorators/visit.js";
import AbstractHtmlBuilder from "../htmlBuilder.js";
import type { VisitMetadata } from "./data-extractor.js";
const { outputFile } = fse;

@Visit({
  theme: "Découverte de Ook",
  step: 60,
  description: "Cette classe va générer les fichiers HTML liés aux visites",
})
export default class HtmlBuilder extends AbstractHtmlBuilder {
  async build(themeData: Map<string, VisitMetadata[]>) {
    await this.buildVisitsPages(themeData);
    await this.buildIndexPage(themeData);
  }

  private async buildVisitsPages(themeData: Map<string, VisitMetadata[]>) {
    const visitPagesPromises: Array<Promise<void>> = [];

    themeData.forEach((steps, theme) => {
      const sortedSteps = steps.sort((a, b) => a.step - b.step);

      const breadcrumb = `
        <nav>
          <a href="../index.html"><i class="fa-solid fa-house"></i>&nbsp;home</a> /
          <a href="index.html">visites</a> /
          ${theme}
        </nav>
      `;

      const htmlContent = `
        <!DOCTYPE html>
          <html lang="en" xml:lang="en">
          <head>
            <meta charset="UTF-8">
            <title>Documentation | Visites | ${theme}</title>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"></script>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@1.0.2/css/bulma.min.css">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism.min.css">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css" integrity="sha512-Kc323vGBEqzTmouAECnVceyQqyqdsSiqLQISBL29aUW4U/M7pSPA/gEUZQqv1cwx4OnYxTxve5UMg5GT6L4JJg==" crossorigin="anonymous" referrerpolicy="no-referrer" />
            <link rel="stylesheet" href="../styles.css">
          </head>
          <body>
            ${breadcrumb}
            <h1 class="title is-1">${theme}</h1>
            <div class="container">
                ${sortedSteps
                  .map((step, index) => this.buildStepSection(step, index))
                  .join("<hr/>")}
            </div>
            <script>
              function copy(id) {
                const contenu = document.getElementById(id).innerText;

                navigator.clipboard.writeText(contenu)
                  .then(() => {
                    alert("Contenu copié dans le presse-papiers !");
                  })
                  .catch(err => {
                    console.error("Erreur lors de la copie : ", err);
                  });
              }
            </script>
          </body>
        </html>
      `;

      const outputPath = path.join(
        this.configuration.target,
        "src",
        "visits",
        `${theme}.html`
      );

      visitPagesPromises.push(outputFile(outputPath, htmlContent));
    });

    await Promise.all(visitPagesPromises);
  }

  private async buildIndexPage(themeData: Map<string, VisitMetadata[]>) {
    const breadcrumb = `
      <nav>
        <a href="../index.html"><i class="fa-solid fa-house"></i>&nbsp;home</a> /
        visites
      </nav>
    `;

    const indexContent = `
        <!DOCTYPE html>
          <html lang="en" xml:lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Documentation | Visites</title>
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@1.0.2/css/bulma.min.css">
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css" integrity="sha512-Kc323vGBEqzTmouAECnVceyQqyqdsSiqLQISBL29aUW4U/M7pSPA/gEUZQqv1cwx4OnYxTxve5UMg5GT6L4JJg==" crossorigin="anonymous" referrerpolicy="no-referrer" />
          <link rel="stylesheet" href="../styles.css">
        </head>
        <body>
          ${breadcrumb}
          <h1 class="title is-1">Visites guidées du code du projet</h1>
          <ul>
            ${Array.from(themeData.keys())
              .map(
                (theme) => `
                <li><a href="${theme}.html">${theme}</a></li>
              `
              )
              .join("")}
          </ul>
        </body>
      </html>
    `;

    const outputPath = path.join(
      this.configuration.target,
      "src",
      "visits",
      "index.html"
    );

    await outputFile(outputPath, indexContent);
  }

  private buildStepSection(step: VisitMetadata, index: number) {
    return `
      <section class="section">
        <div class="step-title">
          <span class="step">#${index + 1}</span>
          <span class="title is-2"><span class="is-size-6 type">${
            step.type
          }</span>${this.getName(step)}</span>
        </div>
        <p class="relative-path"><i class="fa-solid fa-file-code"></i>&nbsp;${`<span id="copy-${
          index + 1
        }">${step.relativePath}</span>&nbsp;<i onClick="copy('copy-${
          index + 1
        }')" class="fa-solid fa-copy copy"></i>`}</p>
        ${step.description ? `<p>${step.description}</p>` : ""}
        <span class="tag"><a href="${
          step.fileLink
        }" target="_blank"><i class="fa-brands fa-github"></i>&nbsp;Voir le code&nbsp;<i class="fa-solid fa-arrow-up-right-from-square"></i></a></span>
        ${
          step.code
            ? `<details>
              <summary>Extrait</summary>
              <pre class="language-javascript"><code>${this.escapeHtml(
                step.code
              )}</pre></code>
            </details>`
            : ""
        }
      </section>
    `;
  }

  private getName({ className, name }: VisitMetadata) {
    if (!className) {
      return `<span class="is-size-3 name">${name}</span>`;
    }
    if (!name) {
      return `<span class="is-size-3 name">${className}</span>`;
    }
    return `<span><span class="is-size-5 class-name">${className}.</span><span class="is-size-3 name">${name}</span></span>`;
  }

  private escapeHtml(text: string) {
    const map = {
      "<": "&lt;",
      ">": "&gt;",
      "&": "&amp;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return text.replace(/[<>&"']/g, (char) => map[char]);
  }
}
