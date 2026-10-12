# Input public API compile check

Build with `npx nx build angular`, then run `npm run test:input-api` from the repository root.
This checks the documented formControl and formControlName templates under
Angular's strict template settings, using the real built package declarations.
The path alias is isolated to this fixture. Nothing is emitted
or included in the library, demo or Storybook runtime.

Runtime CVA and required behavior are tested in `input.spec.ts`. Resolver,
error visibility and full tarball consumer verification follow in FL-11–12.
