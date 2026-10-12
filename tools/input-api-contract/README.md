# FL-09a compile-only contract check

Run `npx ngc -p tools/input-api-contract/tsconfig.json` from the repository root.
This checks the documented formControl and formControlName templates under
Angular's strict template settings, using a declaration-only stand-in for the
future component. The path alias is isolated to this fixture. Nothing is emitted
or included in the library, demo or Storybook runtime.

The fixture does not implement CVA, validation, error messages or Material UI and
must never be used as a runnable component. FL-10 will replace its API stand-in
with the real package entry; FL-10–12 must test runtime forms and packaged imports.
