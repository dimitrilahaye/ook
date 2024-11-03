import * as path from "node:path";
import {
  type ClassDeclaration,
  type FunctionDeclaration,
  type MethodDeclaration,
  Project,
  type PropertyDeclaration,
} from "ts-morph";
import type Configuration from "../../configuration.js";

export interface VisitMetadata {
  theme: string;
  step: number;
  name: string;
  className: string;
  type: string;
  description: string;
  code: string;
  fileLink: string;
  relativePath: string;
}

export type BuiltData = {
  theme: string;
  data: VisitMetadata | null;
};

export type Lines = { start: number; end: number };

export type MetadataOptions = { lines: Lines; relativePath: string };

export type BuildOptions = {
  relativePath: string;
  theme: string;
  step: number;
  description: string;
  type: string;
  lines: Lines;
  code: string;
  className: string;
  name?: string;
};

export default abstract class DataExtractor {
  protected readonly themeData = new Map<string, VisitMetadata[]>();

  constructor(public readonly configuration: Configuration) {}

  abstract getClasseMetadata(
    cls: ClassDeclaration,
    { lines, relativePath }: MetadataOptions
  ): BuiltData | null;
  abstract getMethodMetadata(
    method: MethodDeclaration,
    className: string,
    { lines, relativePath }: MetadataOptions
  ): BuiltData | null;
  abstract getPropertyMetadata(
    propertie: PropertyDeclaration,
    className: string,
    { lines, relativePath }: MetadataOptions
  ): BuiltData | null;
  abstract getFunctionMetadata(
    func: FunctionDeclaration,
    { lines, relativePath }: MetadataOptions
  ): BuiltData | null;

  async extract(): Promise<Map<string, VisitMetadata[]>> {
    const project = new Project();
    project.addSourceFilesAtPaths(`${this.configuration.source}/**/*.ts`);

    for (const file of project.getSourceFiles()) {
      const relativePath = path
        .relative(process.cwd(), file.getFilePath())
        .replace(/\\/g, "/");

      for (const func of file.getFunctions()) {
        const lines = {
          start: func.getStartLineNumber(),
          end: func.getEndLineNumber(),
        };
        const classMetadata = this.getFunctionMetadata(func, {
          lines,
          relativePath,
        });
        if (classMetadata) {
          const { theme, data } = classMetadata;
          if (!this.themeData.has(theme)) {
            this.themeData.set(theme, [data]);
          } else {
            this.themeData.get(theme).push(data);
          }
        }
      }

      for (const cls of file.getClasses()) {
        const lines = {
          start: cls.getStartLineNumber(),
          end: cls.getEndLineNumber(),
        };
        const classMetadata = this.getClasseMetadata(cls, {
          lines,
          relativePath,
        });
        if (classMetadata) {
          const { theme, data } = classMetadata;
          if (!this.themeData.has(theme)) {
            this.themeData.set(theme, [data]);
          } else {
            this.themeData.get(theme).push(data);
          }
        }

        for (const method of cls.getMethods()) {
          const lines = {
            start: method.getStartLineNumber(),
            end: method.getEndLineNumber(),
          };
          const methodMetadata = this.getMethodMetadata(method, cls.getName(), {
            lines,
            relativePath,
          });
          if (methodMetadata) {
            const { theme, data } = methodMetadata;
            if (!this.themeData.has(theme)) {
              this.themeData.set(theme, [data]);
            } else {
              this.themeData.get(theme).push(data);
            }
          }
        }

        for (const property of cls.getProperties()) {
          const lines = {
            start: property.getStartLineNumber(),
            end: property.getEndLineNumber(),
          };
          const propertyMetadata = this.getPropertyMetadata(
            property,
            cls.getName(),
            {
              lines,
              relativePath,
            }
          );
          if (propertyMetadata) {
            const { theme, data } = propertyMetadata;
            if (!this.themeData.has(theme)) {
              this.themeData.set(theme, [data]);
            } else {
              this.themeData.get(theme).push(data);
            }
          }
        }
      }
    }

    return this.themeData;
  }

  protected getBuildData({
    relativePath,
    type,
    lines,
    code,
    className,
    theme,
    step,
    description,
    name,
  }: BuildOptions): BuiltData {
    const linesAnchor = `#L${lines.start}${
      lines.start !== lines.end ? `-L${lines.end}` : ""
    }`;
    const fileLink = `${this.configuration.repository}/blob/${this.configuration.branch}/${relativePath}${linesAnchor}`;
    // permalink : https://github.com/username/repository/blob/3f1e2c3/path/to/file.ts
    return {
      theme,
      data: {
        theme,
        step,
        type,
        className,
        name,
        description: description ?? "Pas de description disponible",
        code,
        fileLink,
        relativePath,
      },
    };
  }
}
