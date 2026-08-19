# paintroom

A single-file C++ console program (`main.cpp`) that estimates the cost of painting a
room, accounting for ceiling, walls, windows, and doors. Input is read interactively
from stdin.

## Cursor Cloud specific instructions

- Toolchain is preinstalled in the base image: `g++` 13.3.0, `clang++` 18.1.3, `make`,
  and `cmake`. There are no third-party libraries or package manager, so there is
  nothing to install to develop this project.
- Build (development, warnings on): `g++ -std=c++17 -Wall -Wextra -g main.cpp -o paintroom`
- Lint: there is no linter configured. The compiler warning flags above (`-Wall
  -Wextra`) are the de facto lint check. Building currently emits one pre-existing,
  harmless `-Wunused-parameter` warning for `width` in `WallPaintCost`.
- Tests: there is no automated test suite.
- Run: `./paintroom`. It is an interactive program that prompts for room dimensions,
  paint choices, window/door counts, and sizes. Feed answers on stdin, e.g.:
  `printf '12 0\n10 0\n8 0\nwhite\nwhite\n3 0\n2\nwhite\n7 0\n1\nwhite\nn\n' | ./paintroom`
  The final prompt asks whether to recalculate; answer `n` to exit (any value other
  than `y` ends the loop).
- The compiled `paintroom` binary is a build artifact and should not be committed.
