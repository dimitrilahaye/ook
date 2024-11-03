import type {
  ClassDeclaration,
  MethodDeclaration,
  PropertyDeclaration,
  JSDoc,
  FunctionDeclaration,
} from "ts-morph";
import DataExtractor, {
  type MetadataOptions,
  type BuiltData,
} from "../data-extractor.js";

export default class JsDocExtractor extends DataExtractor {
  getClasseMetadata(
    cls: ClassDeclaration,
    { lines, relativePath }: MetadataOptions
  ): BuiltData | null {
    const jsDoc = this.getVisitJsDoc(cls);
    if (jsDoc) {
      const { theme, step, description } = this.extractJsDocTags(jsDoc);

      const code = this.getFullCode(cls);
      const { theme: themeValue, data } = this.getBuildData({
        relativePath,
        type: "class",
        lines,
        code,
        className: cls.getName(),
        theme: theme as string,
        step,
        description: description as string,
      });

      return { theme: themeValue, data };
    }
    return null;
  }

  getMethodMetadata(
    method: MethodDeclaration,
    className: string,
    { lines, relativePath }: MetadataOptions
  ): BuiltData | null {
    const jsDoc = this.getVisitJsDoc(method);
    if (jsDoc) {
      const { theme, step, description } = this.extractJsDocTags(jsDoc);

      const code = this.getFullCode(method);
      const { theme: themeValue, data } = this.getBuildData({
        relativePath,
        type: "method",
        lines,
        code,
        className,
        theme: theme as string,
        step,
        description: description as string,
        name: method.getName(),
      });

      return { theme: themeValue, data };
    }
    return null;
  }

  getPropertyMetadata(
    property: PropertyDeclaration,
    className: string,
    { lines, relativePath }: MetadataOptions
  ): BuiltData | null {
    const jsDoc = this.getVisitJsDoc(property);
    if (jsDoc) {
      const { theme, step, description } = this.extractJsDocTags(jsDoc);

      const code = this.getFullCode(property);
      const { theme: themeValue, data } = this.getBuildData({
        relativePath,
        type: "property",
        lines,
        code,
        className,
        theme: theme as string,
        step,
        description: description as string,
        name: property.getName(),
      });

      return { theme: themeValue, data };
    }
    return null;
  }

  getFunctionMetadata(
    func: FunctionDeclaration,
    { lines, relativePath }: MetadataOptions
  ): BuiltData | null {
    const jsDoc = this.getVisitJsDoc(func);
    if (jsDoc) {
      const { theme, step, description } = this.extractJsDocTags(jsDoc);

      const code = this.getFullCode(func);
      const { theme: themeValue, data } = this.getBuildData({
        relativePath,
        type: "function",
        lines,
        code,
        className: undefined,
        theme: theme as string,
        step,
        description: description as string,
        name: func.getName(),
      });

      return { theme: themeValue, data };
    }
    return null;
  }

  private getVisitJsDoc(
    node:
      | ClassDeclaration
      | MethodDeclaration
      | PropertyDeclaration
      | FunctionDeclaration
  ): JSDoc | null {
    const jsDocs = node.getJsDocs();
    return (
      jsDocs.find((jsDoc) =>
        jsDoc.getTags().some((tag) => tag.getTagName() === "visit")
      ) || null
    );
  }

  private extractJsDocTags(jsDoc: JSDoc) {
    const tags = jsDoc.getTags();
    const theme =
      tags.find((tag) => tag.getTagName() === "theme")?.getComment() || "";
    const step = Number.parseInt(
      (tags
        .find((tag) => tag.getTagName() === "step")
        ?.getComment() as string) || "0",
      10
    );
    const description =
      tags.find((tag) => tag.getTagName() === "description")?.getComment() ||
      "";

    return { theme, step, description };
  }

  private getFullCode(
    node:
      | ClassDeclaration
      | MethodDeclaration
      | PropertyDeclaration
      | FunctionDeclaration
  ): string {
    const jsDoc = node
      .getJsDocs()
      .map((jsDoc) => jsDoc.getText())
      .join("\n");
    return node.getFullText().replace(jsDoc, "").trim();
  }
}
