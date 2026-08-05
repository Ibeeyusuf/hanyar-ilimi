# Sound files

Four cues ship with the app and are required by `lib/feedback.ts`:

  tap.wav       - short soft click (button taps)
  correct.wav   - rising two-note chime (right answer)
  wrong.wav     - gentle falling boop (wrong answer)
  success.wav   - short celebration arpeggio (lesson complete)

They are synthesised from pure tones, so they carry no third-party licence and
can be redistributed with the app. `tools/gen_sounds.py` regenerates them.

## Replacing them
Keep the same filenames and extensions, or update the `SOURCES` map in
`lib/feedback.ts`. Metro resolves `require()` at bundle time: if a file named
here is missing, the bundle fails to build — it does not silently degrade.
Keep clips short (under ~1s) and small.
