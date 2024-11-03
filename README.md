# Ook

Experimental repo for living documentation tools

<img style="display: block; margin: 0 auto;" src="./logo.png" width="50%" alt=""/>

## Living Documentation

Take a look at the book "Living Documentation" by Cyrille Martraire.

[Sources on Github](https://github.com/cyriux/livingdocumentation-thebook)

[Buy it for real](https://www.eyrolles.com/Informatique/Livre/living-documentation-9780134689326/)

## Current work

### Ook configuration

`ook.config.json` file configures how the documentation will be built.

```json
{
 "source": "./src", // files to parse
 "target": "./docs", // target directory for the built documentation
 "port": 4000, // port for the local preview
 "repository": "https://github.com/username/repo-name", // github project url
 "branch": "main", // github branch for links in documentation
 "pagesBranch": "gh-pages", // github branch for github pages
 "strategies": [
  {
   "visit": "decorator" // by running `ook generate visit`, ook will use @Visit decorator to parse files
  }
 ]
}
```

### Guided tour

A guided tour is a way to onboard new devs with documentation that guides them in discovering the code through targeted themes.

I am working on a command line `ook generate visit` which generates the guided tour documentation.
The used data is parsed thanks to `@Visit` decorator or jsdoc with specific tags.

#### @Visit decorator

```typescript
@Visit({
    theme: "Découverte de Ook",
    step: 11,
    description:
        "La méthode `serve` permet de lancer la documentation en local.",
})
async serve(): Promise<void> {
    //...
}
```

#### jsdoc

```typescript
/**
 * @visit
 * @theme Découverte de Ook
 * @step 55
 * @description Le decorator `@Visit` si vous voulez générer votre visite guidée avec des decorators
 */
export default function Visit(options: VisitOptions) {
    //...
}
```

### Preview

Command `ook serve` launches locally the documentation thanks to `Vite`.

### Deploy

I am working on the deployment to github pages with the command `ook deploy`.

## TODO

### General

- [ ] Finish deploy command
- [ ] Explore sequences and classes diagrams
- [ ] Explore jest | mocha wrapper in order to generate documentation with logs

### Guided tours

- [ ] Add commit information in order to generate permalinks
- [ ] Add prefixes for jsdoc in order to avoid collisions with existing tags
- [ ] Have a real dynamic frontend for documentation with data into a local json
