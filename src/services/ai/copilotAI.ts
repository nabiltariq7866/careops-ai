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

export type CopilotPromptInput = {
  prompt: string;
  context: string;
  subject: string;
  summary: string;
  outstanding: string[];
  sources: string[];
};

export const detectCopilotIntent = (prompt: string) => {
  const normalized = prompt.toLowerCase();
  if (/discharge.*(letter|summary)|draft.*discharge/.test(normalized))
    return "discharge-letter" as const;
  if (/patient.*(communication|message|letter)|write.*patient/.test(normalized))
    return "patient-communication" as const;
  if (/handover|hand-off/.test(normalized)) return "handover" as const;
  if (/outstanding|action|task|next step|pending/.test(normalized))
    return "outstanding" as const;
  if (/source|fact|evidence|ground/.test(normalized))
    return "source-facts" as const;
  return "summary" as const;
};

export const answerCopilotPrompt = (input: CopilotPromptInput) => {
  const intent = detectCopilotIntent(input.prompt);
  const actions = input.outstanding.length
    ? input.outstanding.map((item, index) => `${index + 1}. ${item}`).join(" ")
    : "No outstanding actions are recorded.";
  const body =
    intent === "outstanding"
      ? `Outstanding actions for ${input.subject}: ${actions}`
      : intent === "discharge-letter"
        ? `Draft discharge letter â€” ${input.subject}: ${input.summary} Before discharge, confirm: ${actions} This draft must be reviewed and signed by an authorized clinician.`
        : intent === "patient-communication"
          ? `Draft patient communication: Dear patient, we are writing with an update regarding ${input.subject}. ${input.summary} Our teamâ€™s next steps are: ${actions} Please contact your care team if you have questions.`
          : intent === "handover"
            ? `Handover â€” ${input.subject}. Situation: ${input.summary} Required follow-up: ${actions}`
            : intent === "source-facts"
              ? `Source-backed facts for ${input.subject}: ${input.summary} No facts beyond the listed CareOps sources have been inferred.`
              : input.summary;
  return { body, sources: input.sources, intent };
};
