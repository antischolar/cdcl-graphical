# cdcl-graphical

## Introduction
Our project proposal is an implementation of the CDCL SAT-solving algorithm along with a graphical output to trace through execution at each step of the process. More specifically, we will build a web application that, given a DNF formula, will execute CDCL while also displaying the various decision literals, forced clauses, and conflict clauses generated. This will be in the form of a graphical interface, displaying both the current clause database as well as the generated graph. Additionally, users will be able to step through execution and fast forward/rewind the execution as needed. Potential reach target: allow users to specify which literal should be the next decision literal.

## Proposed Work
Languages  used will be Reason and TypeScript. Reason will be used for access to OCaml syntax as well as immutability of data structures, so that we can better support tracing through the CDCL algorithm. TypeScript will be used to leverage Sigma.js to display the results of our algorithm.

We plan to implement the CDCL algorithm, and deliverables will be the Reason implementation of the CDCL algorithm, as well as a graphical interface. We plan to host this on GitHub and/or Heroku.

## Proposed Schedule
Nov 01: Project Proposal
Nov 05: Environment is set up and ready to start implementation
Nov 15: CDCL algorithm implementation done
Nov 19: Graphical interface skeleton done
Nov 27: Graphical interface fully fleshed out
Nov 29: Ready to go for presentations