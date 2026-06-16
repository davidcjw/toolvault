export type DiffOp = { type: "eq" | "add" | "del"; text: string };

/** Line-level diff via an LCS table. Pure + testable. */
export function lineDiff(a: string, b: string): DiffOp[] {
  const aL = a.split("\n");
  const bL = b.split("\n");
  const n = aL.length;
  const m = bL.length;

  const dp: number[][] = Array.from({ length: n + 1 }, () =>
    new Array(m + 1).fill(0)
  );
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] =
        aL[i] === bL[j]
          ? dp[i + 1][j + 1] + 1
          : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const ops: DiffOp[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (aL[i] === bL[j]) {
      ops.push({ type: "eq", text: aL[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      ops.push({ type: "del", text: aL[i] });
      i++;
    } else {
      ops.push({ type: "add", text: bL[j] });
      j++;
    }
  }
  while (i < n) ops.push({ type: "del", text: aL[i++] });
  while (j < m) ops.push({ type: "add", text: bL[j++] });
  return ops;
}
