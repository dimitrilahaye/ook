import type {
  ClassDeclaration,
  FunctionDeclaration,
  MethodDeclaration,
  PropertyDeclaration,
} from "ts-morph";
import DataExtractor, {
  type MetadataOptions,
  type BuiltData,
} from "../data-extractor.js";

export default class DecoratorExtractor extends DataExtractor {
  getClasseMetadata(
    cls: ClassDeclaration,
    { lines, relativePath }: MetadataOptions
  ): BuiltData | null {
    const visitDecorator = cls.getDecorator("Visit");
    if (visitDecorator) {
      const metadata = visitDecorator.getArguments()[0].getText();
      const validJSON = this.convertToValidJSON(metadata);
      const {
        theme: themeValue,
        step: stepValue,
        description: descriptionValue,
      } = JSON.parse(validJSON);
      const code = this.getFullCode(cls);

      const { theme, data } = this.getBuildData({
        relativePath,
        type: "class",
        lines,
        code,
        className: cls.getName(),
        theme: themeValue,
        step: stepValue,
        description: descriptionValue,
      });
      return { theme, data };
    }
    return null;
  }

  getMethodMetadata(
    method: MethodDeclaration,
    className: string,
    { lines, relativePath }: MetadataOptions
  ): BuiltData | null {
    const visitDecorator = method.getDecorator("Visit");
    if (visitDecorator) {
      const metadata = visitDecorator.getArguments()[0].getText();
      const validJSON = this.convertToValidJSON(metadata);
      const {
        theme: themeValue,
        step: stepValue,
        description: descriptionValue,
      } = JSON.parse(validJSON);
      const code = this.getFullCode(method);

      const { theme, data } = this.getBuildData({
        relativePath,
        type: "method",
        lines,
        code,
        className,
        theme: themeValue,
        step: stepValue,
        description: descriptionValue,
        name: method.getName(),
      });
      return { theme, data };
    }
    return null;
  }

  getPropertyMetadata(
    property: PropertyDeclaration,
    className: string,
    { lines, relativePath }: MetadataOptions
  ): BuiltData | null {
    const visitDecorator = property.getDecorator("Visit");
    if (visitDecorator) {
      const metadata = visitDecorator.getArguments()[0].getText();
      const validJSON = this.convertToValidJSON(metadata);
      const {
        theme: themeValue,
        step: stepValue,
        description: descriptionValue,
      } = JSON.parse(validJSON);
      const code = this.getFullCode(property);

      const { theme, data } = this.getBuildData({
        relativePath,
        type: "property",
        lines,
        code,
        className,
        theme: themeValue,
        step: stepValue,
        description: descriptionValue,
        name: property.getName(),
      });
      return { theme, data };
    }
    return null;
  }

  getFunctionMetadata(
    _func: FunctionDeclaration,
    _options: MetadataOptions
  ): BuiltData | null {
    return null;
  }

  private getFullCode(
    node: ClassDeclaration | MethodDeclaration | PropertyDeclaration
  ) {
    return node
      .getFullText()
      .replace(node.getDecorator("Visit").getFullText(), "");
  }

  private convertToValidJSON(text: string): string {
    return text
      .replace(/([a-zA-Z_]\w*)(?=\s*:)/g, '"$1"')
      .replace(/,\s*}/g, "}")
      .replace(/,\s*]/g, "]");
  }
}
