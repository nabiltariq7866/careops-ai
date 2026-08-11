export const summarizeCohorts = (metrics: {
  overdue: number;
  noShow: number;
  careGaps: number;
}) => ({
  ...metrics,
  message: `${metrics.overdue} synthetic patient${metrics.overdue === 1 ? "" : "s"} may require operational follow-up; ${metrics.careGaps} open care gap${metrics.careGaps === 1 ? "" : "s"} are recorded.`,
});
