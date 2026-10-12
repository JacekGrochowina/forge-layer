# Forge Input — FL-09b state and validation matrix

Source: [Notion implementation plan](https://app.notion.com/p/3c7f493bef5980e0ae56eacb2475a2d0).
Depends on the approved [FL-09a API contract](input-api.md). This is the acceptance
matrix for FL-10–12, not evidence of a working component or passing runtime tests.
Scenario IDs should be retained in future tests to make coverage traceable.

## Shared rules and test setup

Run form integration scenarios with both `[formControl]` and `formControlName`.
For submitted scenarios, put either binding inside a form with
`FormGroupDirective`; without a parent form, submitted is false.
Unless a row overrides it, use label `Email`, hint `Podaj adres kontaktowy`,
an enabled, editable control and no message overrides. `E` below is the message
selected from the message matrix; `H` is exactly `Podaj adres kontaktowy`.
“No error” means no error element, no error styling and `aria-invalid=false`.

The complete state space is defined by this rule, including combinations not
repeated in individual rows:

```text
showError = control.enabled && control.invalid
            && (control.touched || parentForm.submitted)
displayText = showError ? resolvedMessage : hint
```

Use the control's current status, not a cached error map: VALID, PENDING and
DISABLED never show errors. Dirty, empty/filled and readonly do not change this
predicate. Empty hint renders no hint element. A deliberately empty error
message keeps the error state, suppresses the hint and displays no message text;
it does not fall through to another error or source.

When showing an error, Material's error state and `aria-invalid=true` must agree
with the predicate. When showing a nonempty hint/error, Material's
`aria-describedby` must reference its existing element. Remove stale references
when switching descriptions; no reference to an absent or empty description is
required. Label always names the native input, including empty and disabled
states. Required marker and `aria-required` follow effective required independently
of error visibility. Keep generated IDs stable throughout every transition.

## Status × interaction matrix

`*` means either value. Every row applies to empty and filled values and both
readonly settings; the external validators determine status.

| ID  | Status                  | Touched | Submitted | Dirty | Expected text | Field / display condition               |
| --- | ----------------------- | ------- | --------- | ----- | ------------- | --------------------------------------- |
| S01 | VALID                   | \*      | \*        | \*    | H             | No error                                |
| S02 | INVALID                 | false   | false     | false | H             | No error before interaction             |
| S03 | INVALID                 | false   | false     | true  | H             | Dirty alone does not show error         |
| S04 | INVALID                 | true    | false     | \*    | E             | Error visible after touch               |
| S05 | INVALID                 | false   | true      | \*    | E             | Error visible after submission          |
| S06 | INVALID                 | true    | true      | \*    | E             | One error, not two                      |
| S07 | PENDING                 | \*      | \*        | \*    | H             | No error or custom pending indicator    |
| S08 | DISABLED                | \*      | \*        | \*    | H             | Disabled, no error; cannot focus/edit   |
| S09 | INVALID, no parent form | false   | N/A       | true  | H             | No submission state inferred from dirty |
| S10 | INVALID, no parent form | true    | N/A       | \*    | E             | Touch is sufficient without a form      |

## Value and validator matrix

Rows with errors use touched=true and submitted=false. Rows without errors use
the same interaction flags. None of these changes parent submitted. Programmatic
writes never call the CVA change callback; user edits call it once per input event.

| ID  | Value / action and validators                    | Native text / control value | Status and expected description                              |
| --- | ------------------------------------------------ | --------------------------- | ------------------------------------------------------------ |
| V01 | Initial null, no validators                      | `''` / null                 | VALID; H                                                     |
| V02 | Initial `''`, required                           | `''` / `''`                 | INVALID required; `Pole jest wymagane`                       |
| V03 | null, required                                   | `''` / null                 | INVALID required; `Pole jest wymagane`                       |
| V04 | `'Anna'`, required                               | `'Anna'` / `'Anna'`         | VALID; H                                                     |
| V05 | User clears `'Anna'`, required                   | `''` / `''`                 | INVALID required; `Pole jest wymagane`                       |
| V06 | User pastes `' AbC '`, required                  | `' AbC '` / `' AbC '`       | VALID; H; no trimming/case conversion                        |
| V07 | `'   '`, required only                           | `'   '` / `'   '`           | VALID; H; whitespace is not empty                            |
| V08 | `'bad'`, type=email, no validators               | `'bad'` / `'bad'`           | VALID; H; native type adds no Angular email validator        |
| V09 | `'bad'`, Validators.email                        | `'bad'` / `'bad'`           | INVALID email; `Podaj poprawny adres email`                  |
| V10 | `'a@b.com'`, Validators.email                    | `'a@b.com'` / `'a@b.com'`   | VALID; H                                                     |
| V11 | `''`, email + minlength(5), no required          | `''` / `''`                 | VALID; H; these validators allow empty values                |
| V12 | `'abc'`, minlength(5)                            | `'abc'` / `'abc'`           | INVALID minlength; `Wpisz co najmniej 5 znaków (obecnie 3)`  |
| V13 | `'abcdef'`, maxlength(5)                         | `'abcdef'` / `'abcdef'`     | INVALID maxlength; `Wpisz najwyżej 5 znaków (obecnie 6)`     |
| V14 | Programmatic setValue/patchValue(null), required | `''` / null                 | INVALID required; visible only by S02–S06, touched preserved |
| V15 | Programmatic setValue('Anna'), required, touched | `'Anna'` / `'Anna'`         | VALID; H; previous error disappears                          |

## Message selection and precedence matrix

All rows here have enabled INVALID control and touched=true, so error styling,
`aria-invalid=true` and hint suppression apply. Resolve the chosen key first,
then its message source. Object insertion order and map source do not affect key
priority. Custom keys use deterministic JavaScript string ordering (case-sensitive,
not locale-dependent). A callback receives that key's exact payload and the same
external AbstractControl, never a copy or an internal control.

| ID  | Errors / overrides                                                                       | Selected key | Exact expected text                                        |
| --- | ---------------------------------------------------------------------------------------- | ------------ | ---------------------------------------------------------- |
| M01 | required + email + minlength + maxlength + custom                                        | required     | `Pole jest wymagane`                                       |
| M02 | email + minlength + maxlength                                                            | email        | `Podaj poprawny adres email`                               |
| M03 | minlength {requiredLength:5, actualLength:3} + maxlength                                 | minlength    | `Wpisz co najmniej 5 znaków (obecnie 3)`                   |
| M04 | maxlength {requiredLength:5, actualLength:6} + custom                                    | maxlength    | `Wpisz najwyżej 5 znaków (obecnie 6)`                      |
| M05 | zeta + alpha, local alpha=`Sprawdź wartość`                                              | alpha        | `Sprawdź wartość`, even if zeta inserted first             |
| M06 | custom `{serverCode: 'secret'}`, no translation                                          | custom       | `Nieprawidłowa wartość`; never key/payload                 |
| M07 | required, local=`Email jest wymagany`, global=`Uzupełnij pole`                           | required     | `Email jest wymagany`                                      |
| M08 | required, local undefined, global=`Uzupełnij pole`                                       | required     | `Uzupełnij pole`                                           |
| M09 | required, neither map has an entry                                                       | required     | `Pole jest wymagane`                                       |
| M10 | email, local override for required only                                                  | email        | `Podaj poprawny adres email`                               |
| M11 | custom `{reason:'blocked'}`, local callback returns `Adres zablokowany` for this payload | custom       | `Adres zablokowany`; callback receives external control    |
| M12 | custom, global=`Sprawdź adres`, no local entry                                           | custom       | `Sprawdź adres`                                            |
| M13 | required, local=`''`, global has nonempty text                                           | required     | `''`; error state stays active, hint suppressed            |
| M14 | minlength payload missing length properties, no overrides                                | minlength    | `Nieprawidłowa wartość`; no undefined/technical text       |
| M15 | required + custom, only custom has local translation                                     | required     | `Pole jest wymagane`; translation does not change priority |

No errors (`errors=null`) makes the resolver return null. The component still
uses the status/interaction predicate; the resolver does not decide visibility.
String overrides are literal. Functions implement application-specific payload
handling; throwing callbacks or callbacks violating their string return type are
outside the supported contract.

## Dynamic required matrix

Each row starts with value `''`, touched=true, submitted=false and no other
validators unless specified. “Required on/off” means both the visible marker and
native `aria-required`. Revalidate after input changes; for parent validator
changes the caller must use Angular's `updateValueAndValidity()`.

| ID  | Configuration / transition                                           | External errors / status                                                  | Required state        | Expected text / field                                                  |
| --- | -------------------------------------------------------------------- | ------------------------------------------------------------------------- | --------------------- | ---------------------------------------------------------------------- |
| R01 | No parent required, input undefined or false                         | null / VALID                                                              | Off                   | H; no error                                                            |
| R02 | Parent Validators.required, input undefined                          | required / INVALID                                                        | On                    | `Pole jest wymagane`; error                                            |
| R03 | Parent Validators.required, input false                              | required / INVALID                                                        | On                    | `Pole jest wymagane`; parent rule preserved                            |
| R04 | No parent required, input false → true                               | required / INVALID                                                        | On                    | `Pole jest wymagane`; external control revalidated                     |
| R05 | Forge-only required, input true → false or undefined                 | null / VALID                                                              | Off                   | H; error removed                                                       |
| R06 | Parent + Forge required, input true → false                          | required / INVALID                                                        | On                    | `Pole jest wymagane`; parent rule preserved                            |
| R07 | Add parent Validators.required + updateValueAndValidity              | required / INVALID                                                        | On                    | `Pole jest wymagane`; update UI                                        |
| R08 | Remove parent required + updateValueAndValidity, input undefined     | null / VALID                                                              | Off                   | H; update UI                                                           |
| R09 | Remove parent required, input true                                   | required / INVALID                                                        | On                    | `Pole jest wymagane`; Forge rule preserved                             |
| R10 | Composed/wrapped parent required, input true                         | required / INVALID                                                        | On                    | `Pole jest wymagane`; explicit input supplies undetectable requirement |
| R11 | Set input true while pristine/untouched, submitted=false             | required / INVALID                                                        | On                    | H; adding a validator does not touch the control                       |
| R12 | Change required while disabled, then enable                          | DISABLED until enable; required / INVALID afterward if effective required | Follows configuration | H while disabled; required error on enable if touched/submitted        |
| R13 | Toggle Forge required off with parent email validator, value `'bad'` | email / INVALID                                                           | Off                   | `Podaj poprawny adres email`; other validators preserved               |

An arbitrary wrapped/composed validator cannot be reliably introspected for
required. Consumers must declare required=true for such requirements; do not
probe validators with fabricated controls or infer requirement from a current
error. Disabled does not remove validators or required metadata.

## Readonly, disabled, updates and reset matrix

Required validator is present unless the row states otherwise. Each row states
interaction explicitly. Both form bindings must behave consistently.

| ID  | Setup / action                                                              | Value and interaction after action                                              | Expected text / field                                         |
| --- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| T01 | Empty invalid, untouched, readonly=true, not submitted                      | Value unchanged; focus/copy allowed, editing blocked                            | H; no error                                                   |
| T02 | Empty invalid, touched, readonly=true                                       | Value retained in form; readonly still validates                                | `Pole jest wymagane`; error                                   |
| T03 | Readonly empty invalid untouched form is submitted                          | Submitted=true; value unchanged                                                 | `Pole jest wymagane`; error; focus allowed                    |
| T04 | Filled valid, readonly=true, touched                                        | Value retained in form; Tab/focus/copy work                                     | H; no error; typing/paste do not change value                 |
| T05 | Empty invalid touched → disable()                                           | DISABLED; value retained in control; touched preserved                          | H; error disappears; Tab skips input; no user change emission |
| T06 | T05 → enable()                                                              | INVALID required; touched preserved                                             | `Pole jest wymagane`; error reappears                         |
| T07 | Initially disabled empty, untouched, submitted=false → enable()             | INVALID required; untouched preserved                                           | H; no error until touch/submission                            |
| T08 | Disabled + readonly=true                                                    | Disabled takes precedence for interaction                                       | H; cannot focus/edit; no error                                |
| T09 | Valid filled touched → setErrors({server:true})                             | INVALID; value and touched unchanged                                            | `Nieprawidłowa wartość`; error updates without typing         |
| T10 | Invalid untouched → markAllAsTouched(), not submitted                       | INVALID; touched=true                                                           | E; error updates without typing                               |
| T11 | setErrors(null), no pending validation                                      | VALID; value and interaction unchanged                                          | H; error removed; future validation may restore errors        |
| T12 | Required nullable control, touched/dirty, submitted=false → control.reset() | null displayed empty; untouched/pristine; INVALID required                      | H; no error                                                   |
| T13 | Same control, submitted=true → control.reset()                              | null displayed empty; untouched/pristine; submitted remains true                | `Pole jest wymagane`; error remains due to submitted          |
| T14 | Submitted/touched/dirty form → FormGroupDirective.resetForm()               | Nullable controls reset to null; untouched/pristine; submitted=false            | H; no error even if required remains INVALID                  |
| T15 | Nonnullable initial `'Anna'` → control.reset(), submitted=false             | `'Anna'`; untouched/pristine; VALID                                             | H; no error                                                   |
| T16 | control.reset('Anna'), submitted=true                                       | `'Anna'`; untouched/pristine; VALID; submitted still true                       | H; no error                                                   |
| T17 | resetForm({email:'bad'}), Validators.email                                  | `'bad'`; untouched/pristine; INVALID email; submitted=false                     | H; no error                                                   |
| T18 | Touched invalid → async validation PENDING → INVALID                        | Touched preserved; final error from Angular                                     | H during PENDING; E after INVALID                             |
| T19 | Same transition → VALID                                                     | Touched preserved; errors cleared                                               | H throughout PENDING and VALID                                |
| T20 | updateOn='blur', user enters `'Anna'` into empty required control           | Native draft `'Anna'`; control unchanged until blur; blur commits and touches   | Predicate uses old status until blur; after blur VALID, H     |
| T21 | updateOn='submit', user enters `'Anna'` then submits parent form            | Control unchanged until submit; submit commits pending draft and sets submitted | After submit VALID, H; no transient stale required message    |
| T22 | updateOn='submit', user clears value then submits                           | Submit commits `''`; submitted=true; INVALID required                           | `Pole jest wymagane`; error                                   |
| T23 | Two fields switch hint → error → hint independently                         | IDs stay distinct and stable; no value/interaction cross-talk                   | Each input describes only its own active hint/error           |

For T05, an enabled FormGroup excludes its disabled child from `.value` and
includes it in `getRawValue()`. A fully disabled FormGroup includes all children
in `.value`, following Angular's semantics. Reset without a disabled form-state
argument preserves the disabled setting; `reset({value:null, disabled:true})`
explicitly disables and therefore shows H even if the parent stays submitted.
Programmatic reset/writes may emit Angular form events according to their options;
“no user change emission” refers to additional CVA callbacks, not those events.

## Implementation test coverage

| Task            | Acceptance scenarios                                                                                                      |
| --------------- | ------------------------------------------------------------------------------------------------------------------------- |
| FL-10a / FL-11c | Shared label/ID/description rules; T23                                                                                    |
| FL-10b          | V01–V07, V14–V15; T12–T17, T20–T22; both bindings, single CVA callbacks                                                   |
| FL-10c          | R01–R13; T01–T08; readonly copying and form value semantics                                                               |
| FL-11a          | M01–M15; resolver null on no errors; length callback payloads                                                             |
| FL-11b          | S01–S10; T09–T19; shared error state and description switching                                                            |
| FL-12a–c        | Browser flows for blur/submit/correction/reset, readonly/disabled, multiple fields; stories driven by real Reactive Forms |

Use unit/integration tests for the complete matrix and browser tests for real
editing, focus, submission, reset and accessible associations. The compile-only
FL-09a fixture does not verify these behaviors. FL-09b adds documentation only;
runtime tests and interactive Input stories follow component implementation.
