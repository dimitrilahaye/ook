import { exec } from "node:child_process";
import { promisify } from "node:util";
import * as path from "node:path";
import * as fse from "fs-extra";
import type Configuration from "../configuration.js";
const { outputFile } = fse;

export default class Server {
  constructor(protected readonly configuration: Configuration) {}

  async serve(): Promise<void> {
    await this.createViteConfigFiles();

    const docsPath = path.join(process.cwd(), this.configuration.target);

    await this.runCommand("npm install", { cwd: docsPath });
    await this.runCommand("npm run build", { cwd: docsPath });
    await this.runCommand("npm run serve", { cwd: docsPath });
  }

  private async runCommand(command, options) {
    const execAsync = promisify(exec);
    try {
      const { stdout, stderr } = await execAsync(command, options);
      if (stdout) console.log(stdout);
      if (stderr) console.error(stderr);
    } catch (error) {
      console.error(
        `Erreur lors de l'exécution de la commande: ${command}`,
        error
      );
    }
  }

  private async createViteConfigFiles() {
    const packageJsonContent = JSON.stringify(
      {
        name: "docs",
        version: "1.0.0",
        type: "module",
        scripts: {
          build: "vite build",
          serve: "vite",
        },
        devDependencies: {
          vite: "latest",
          "vite-plugin-static-copy": "latest",
        },
      },
      null,
      2
    );

    const docsPath = path.join(this.configuration.target);
    await outputFile(path.join(docsPath, "package.json"), packageJsonContent);

    const viteConfigContent = `
import { defineConfig } from 'vite';
import path from 'node:path';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
    root: path.resolve(__dirname, 'src'),
    build: {
        outDir: path.resolve(__dirname, 'dist'),
        emptyOutDir: true,
    },
    server: {
        open: true,
        port: ${this.configuration.port},
    },
  plugins: [
    viteStaticCopy({
      targets: [
        { src: 'visits/**/*', dest: 'visits' }
      ]
    })
  ]
});
        `.trim();

    await outputFile(path.join(docsPath, "vite.config.js"), viteConfigContent);
  }
}
