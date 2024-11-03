import "reflect-metadata";

type VisitOptions = {
    theme: string;
    step: number;
    description: string;
};

/**
 * @visit
 * @theme Découverte de Ook
 * @step 55
 * @description Le decorator `@Visit` si vous voulez générer votre visite guidée avec des decorators
 */
export default function Visit(options: VisitOptions) {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    return (target: any, propertyKey?: string) => {
        Reflect.defineMetadata("visit", options, target, propertyKey);
    };
}