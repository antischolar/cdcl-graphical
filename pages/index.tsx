import type { NextPage } from "next";
import Head from "next/head";

import { useCallback, useEffect, useState } from "react";

import CDCL from "../lib/CDCL";
import Literal from "../lib/Literal";
import Graph from "../components/Graph";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import Snapshot from "../lib/Snapshot";
import Assignment from "../components/Assignment";
import ClauseDatabase from "../components/ClauseDatabase";
import Formula from "../components/Formula";

const Home: NextPage = () => {
  const [history, setHistory] = useState<{
    snapshots: Array<Snapshot>;
    idx: number;
    sat: boolean;
  } | null>(null);

  const [formula, setFormula] = useState<Array<Array<Literal>>>(defaultFormula);

  const solveNewFormula = useCallback((formula) => {
    setFormula(formula);
  }, []);

  useEffect(() => {
    const cdcl = new CDCL(formula);
    const assignment = cdcl.solve();

    setHistory({
      snapshots: cdcl.history,
      idx: 0,
      sat: assignment.size > 0,
    });
  }, [formula]);

  const onPreviousClick = useCallback(() => {
    setHistory((history) => {
      if (history == null) return null;

      const { idx: prevIdx, ...rest } = history;
      return {
        ...rest,
        idx: prevIdx > 0 ? prevIdx - 1 : prevIdx,
      };
    });
  }, []);

  const onNextClick = useCallback(() => {
    setHistory((history) => {
      if (history == null) return null;

      const { idx: prevIdx, ...rest } = history;
      return {
        ...rest,
        idx: prevIdx < history.snapshots.length - 1 ? prevIdx + 1 : prevIdx,
      };
    });
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <Head>
        <title>CDCL</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex-initial">
        <NavBar solveNewFormula={solveNewFormula} />
      </div>

      <div className="flex-auto w-full">
        <div className="flex flex-row h-full">
          <div
            className="flex-initial flex flex-col"
            style={{ minWidth: "20em" }}
          >
            <div className="flex-auto p-6 border">
              {history && (
                <ClauseDatabase snapshot={history.snapshots[history.idx]} />
              )}
            </div>
            <div className="flex-auto p-6 border">
              {history && (
                <Assignment snapshot={history.snapshots[history.idx]} />
              )}
            </div>
          </div>

          <div className="flex flex-col flex-auto h-full">
            <div className="flex-initial p-6 border">
              <Formula formula={formula} isSat={history?.sat} />
            </div>
            <div className="flex-auto border">
              {history && <Graph snapshot={history.snapshots[history.idx]} />}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-initial">
        {history && (
          <Footer
            onPreviousClick={onPreviousClick}
            onNextClick={onNextClick}
            previousDisabled={history.idx === 0}
            nextDisabled={history.idx === history.snapshots.length - 1}
          />
        )}
      </div>
    </div>
  );
};

export default Home;

const defaultFormula = [
  [new Literal(false, "p1"), new Literal(true, "p2"), new Literal(false, "p4")],
  [new Literal(false, "p1"), new Literal(false, "p2"), new Literal(true, "p3")],
  [new Literal(false, "p3"), new Literal(false, "p4")],
  [new Literal(true, "p4"), new Literal(true, "p5"), new Literal(true, "p6")],
  [new Literal(false, "p5"), new Literal(true, "p7")],
  [new Literal(false, "p6"), new Literal(true, "p7"), new Literal(false, "p8")],
  [
    new Literal(false, "p2"),
    new Literal(false, "p7"),
    new Literal(false, "p6"),
    new Literal(false, "p5"),
    new Literal(false, "p3"),
    new Literal(true, "p4"),
  ],
  [
    new Literal(false, "p1"),
    new Literal(false, "p8"),
    new Literal(false, "p6"),
    new Literal(false, "p5"),
    new Literal(false, "p3"),
    new Literal(true, "p4"),
  ],
  [
    new Literal(false, "p1"),
    new Literal(false, "p8"),
    new Literal(true, "p2"),
    new Literal(false, "p7"),
    new Literal(true, "p3"),
    new Literal(true, "p4"),
  ],
  [
    new Literal(false, "p1"),
    new Literal(false, "p8"),
    new Literal(false, "p2"),
    new Literal(false, "p7"),
    new Literal(false, "p6"),
    new Literal(true, "p5"),
  ],
  [
    new Literal(false, "p2"),
    new Literal(false, "p7"),
    new Literal(false, "p6"),
    new Literal(false, "p5"),
    new Literal(false, "p3"),
    new Literal(false, "p4"),
  ],
];
