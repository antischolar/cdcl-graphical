# cdcl-graphical

## Introduction
Our project proposal is an implementation of the CDCL SAT-solving algorithm along with a graphical output to trace through execution at each step of the process. More specifically, we will build a web application that, given a DNF formula, will execute CDCL while also displaying the various decision literals, forced clauses, and conflict clauses generated. This will be in the form of a graphical interface, displaying both the current clause database as well as the generated graph. Additionally, users will be able to step through execution and fast forward/rewind the execution as needed. Potential reach target: allow users to specify which literal should be the next decision literal.

## Proposed Work
Languages  used will be Reason and TypeScript. Reason will be used for access to OCaml syntax as well as immutability of data structures, so that we can better support tracing through the CDCL algorithm. TypeScript will be used to leverage Sigma.js to display the results of our algorithm.

We plan to implement the CDCL algorithm, and deliverables will be the Reason implementation of the CDCL algorithm, as well as a graphical interface. We plan to host this on GitHub and/or Heroku.

## Goals
### Within Scope
- Basic CDCL algorithm implementation
  - Outputs a satisfying assignment or a value representing that the formula is unsatisfiable
  - Finds the cut based on the first UIP of the graph
  - Returns the clause database at the time of termination
- Graphical support to draw the CDCL graph in real-time
  - Support for different node shapes to signal a decision literal or a forced literal
  - Ability to step through each stage of the algorithm
- Historical Record
  - Keep track of the state of each data structure at each step of the algorithm

### Stretch Goals
- Support for users to choose which literal to decide at each point in time
- Graphical support to illustrate other UIP cuts

## Proposed Schedule
Nov 01: Project Proposal

Nov 05: Environment is set up and ready to start implementation

Nov 15: CDCL algorithm implementation done

Nov 19: Graphical interface skeleton done

Nov 27: Graphical interface fully fleshed out

Nov 29: Ready to go for presentations