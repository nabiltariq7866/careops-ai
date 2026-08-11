export const policyAnswer = (id: string) =>
  id === "policy-discharge"
    ? {
        body: "All applicable discharge dependencies require completion or an explicit not-required decision before bed release.",
        sources: ["Discharge Coordination SOP · Demo revision 3.2"],
      }
    : {
        body: "Medication events require prompt reporting, authorized review, human classification and corrective actions for validated patterns.",
        sources: ["Medication Incident Policy · Demo revision 4.1"],
      };
