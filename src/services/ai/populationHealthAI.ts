export const summarizeCohorts = (count: number) => ({
  overdue: count * 17,
  noShow: count * 8,
  careGaps: count * 23,
  message: `${count * 17} synthetic patients may require operational follow-up.`,
});
