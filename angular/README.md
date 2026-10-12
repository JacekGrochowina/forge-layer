# Forge Layer for Angular

Application-ready UI components built on Angular Material.

## Installation

```sh
npm install @forge-layer/angular @angular/material@^22.1.4
```

Use Angular 22. The library directly imports `@angular/core` and Material's
button, icon and progress-spinner entry points. These are its peer dependencies;
`ng-packagr` adds `tslib` as a runtime dependency. CDK is not imported directly
by Forge Layer and is not an additional Forge Layer peer. Angular Material
requires CDK at its own matching version, plus Angular common, forms,
platform-browser and RxJS. Keep those dependencies compatible with Material;
npm's normal peer resolution installs missing peers.

The minimum Material version is the verified baseline, 22.1.4. Angular 23 is
not yet supported by Forge Layer's manifest.

## Button

```ts
import { Component } from '@angular/core';
import { ForgeButton } from '@forge-layer/angular';
import type { ForgeButtonVariant } from '@forge-layer/angular';

@Component({
  selector: 'app-example',
  imports: [ForgeButton],
  template: '<forge-button [variant]="variant" icon="save">Save</forge-button>',
})
export class Example {
  variant: ForgeButtonVariant = 'filled';
}
```

The package also exports `ForgeButtonColor`, `ForgeButtonSize`,
`ForgeButtonIconPosition` and `ForgeButtonType`.

## Theme and icons

Configure a Material theme in the application's global SCSS:

```scss
@use '@angular/material' as mat;

html {
  @include mat.theme(
    (
      color: mat.$violet-palette,
      typography: Arial,
      density: 0,
    )
  );
}
```

Forge Button's styles are included in the compiled component. Its semantic
colors use the consuming application's Material theme tokens; no separate
Forge stylesheet or source alias is needed.

The `icon` input uses Material Icons ligature names. Load the font in your
application's HTML, or self-host the equivalent font and CSS:

```html
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/icon?family=Material+Icons"
/>
```

The library does not bundle an icon font or download it automatically.

## License

MIT, chosen by the project owner. See the packaged `LICENSE` file.
