import { exec } from "node:child_process";
import { promisify } from "node:util";
import * as path from "node:path";
import * as fse from "fs-extra";
import type Configuration from "../configuration.js";
const { outputFile } = fse;

export default class Deployer {
  constructor(protected readonly configuration: Configuration) {}

  async deploy(): Promise<void> {
    const docsPath = path.join(process.cwd(), this.configuration.target);
    const distPath = path.join(docsPath, "dist");
    const pagesBranch = this.configuration.pagesBranch;
    const main = this.configuration.branch;

    await this.createGitignoreFile();

    if (!(await fse.pathExists(distPath))) {
      throw new Error(
        "Le dossier de sortie (dist) n'existe pas. Exécutez d'abord le build."
      );
    }

    try {
      if (!(await fse.pathExists(path.join(distPath, ".git")))) {
        await this.runCommand("git init", { cwd: distPath });
        await this.runCommand(
          `git remote add origin ${this.configuration.repository}`,
          { cwd: distPath }
        );
      }

      await this.runCommand("git add .", { cwd: distPath });
      await this.runCommand(`git commit -m "Déploiement vers GitHub Pages"`, {
        cwd: distPath,
      });

      const pushCommand = await this.pushCommandOptions(
        distPath,
        pagesBranch,
        main
      );
      await this.runCommand(`git push ${pushCommand}`, { cwd: distPath });

      console.log(
        `Déploiement réussi vers la branche ${pagesBranch} sur GitHub Pages !`
      );
    } catch (error) {
      console.error("Erreur lors du déploiement vers GitHub Pages :", error);
    }
  }

  private async createGitignoreFile() {
    const gitignoreContent = `
node_modules
.DS_Store
        `.trim();

    const docsPath = path.join(this.configuration.target);
    await outputFile(path.join(docsPath, ".gitignore"), gitignoreContent);
  }

  private async pushCommandOptions(
    distPath: string,
    branch: string,
    main: string
  ): Promise<string> {
    const remoteExists = await this.runCommand("git remote", { cwd: distPath });
    return remoteExists.includes("origin")
      ? `origin ${main}:${branch}`
      : `-f origin ${main}:${branch}`;
  }

  private async runCommand(command, options) {
    const execAsync = promisify(exec);
    try {
      const { stdout, stderr } = await execAsync(command, options);
      if (stdout) console.log(stdout);
      if (stderr) console.error(stderr);
      return stdout;
    } catch (error) {
      console.error(
        `Erreur lors de l'exécution de la commande: ${command}`,
        error
      );
      return null;
    }
  }
}
