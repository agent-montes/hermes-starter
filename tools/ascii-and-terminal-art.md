# ASCII and Terminal Art Tools

Purpose: create lightweight terminal art, banners, diagrams, and decorative text for public-safe docs or demos.

## Tools and credits

### pyfiglet

- Source/credit: Peter Waller / pyfiglet project
- Repository: https://github.com/pwaller/pyfiglet
- Package: https://pypi.org/project/pyfiglet/
- License: MIT, per PyPI and project README
- Purpose: render text as FIGlet-style ASCII art.
- Provenance note: pyfiglet is a Python port of FIGlet.

### cowsay

- Source/credit: npm `cowsay` package by Fabio Crisci, based on Tony Monroe's original cowsay
- Package: https://www.npmjs.com/package/cowsay
- Repository: https://github.com/piuccio/cowsay
- Purpose: terminal talking cow and related ASCII output.

### boxes

- Source/credit: ascii-boxes project
- Website: https://boxes.thomasjensen.com/
- Repository: https://github.com/ascii-boxes/boxes
- License: GPL-3.0, per repository metadata
- Purpose: draw ASCII boxes around text.

## Public-safe usage policy

ASCII outputs are usually safe, but do not include private names, phone numbers, channel IDs, or secret values in banners or demos.

## Safe smoke tests

```bash
pyfiglet Hermes
cowsay Hermes
printf 'Hermes Starter' | boxes
```

Only run commands that are installed locally.
