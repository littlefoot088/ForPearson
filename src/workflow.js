// Proposed workflow for one person/opportunity pair; no communications or submissions.
export const careerContext = {
  id: "career-preferences",
  text: "Interest and offshore working preferences",
  title: "Interest and offshore working preferences",
  question:
    "Would you like to explore this Wind Turbine Technician opportunity? How would offshore work and the 14-days-on / 14-days-off pattern fit your plans?",
};
export const opportunityContext = {
  id: "opportunity-questions",
  text: "Questions about this opportunity",
  title: "Wind Turbine Technician opportunity",
  question:
    "What more would you like to know about the Wind Turbine Technician role before deciding whether to pursue it? We can discuss the work, offshore conditions, rota, travel and training requirements.",
};
export const officerAssessments = {
  "not-reviewed": "Not reviewed",
  "needs-clarification": "Needs clarification",
  "worth-discussing": "Worth discussing",
  "not-suitable": "Not currently suitable",
  "worth-nominating": "Worth nominating",
};
export const keeperResponses = {
  "not-discussed": "Not yet discussed",
  interested: "Interested",
  "not-interested": "Not interested",
  "more-information": "Wants more information",
};
export const initialOpportunity = {
  suggested: false,
  interest: "not-discussed",
  responseOrigin: null,
  assessment: "not-reviewed",
  nominationDecision: null,
  employerProgression: "not-submitted",
};
export function interestLabel(state) {
  return state.interest === "not-discussed" && state.suggested
    ? "Suggested to Eimhin · awaiting response"
    : keeperResponses[state.interest];
}
export function opportunityReducer(state, action) {
  switch (action.type) {
    case "suggest":
      // Recommending an opportunity never creates a keeper response.
      return state.assessment === "not-suitable"
        ? state
        : { ...state, suggested: true };
    case "response": {
      if (!(action.value in keeperResponses)) return state;
      const changed = action.value !== state.interest;
      return {
        ...state,
        interest: action.value,
        responseOrigin:
          action.value === "not-discussed" ? null : "manually-recorded",
        nominationDecision: changed ? null : state.nominationDecision,
        assessment:
          changed && state.assessment === "worth-nominating"
            ? "not-reviewed"
            : state.assessment,
      };
    }
    case "assessment":
      if (
        !(action.value in officerAssessments) ||
        action.value === "worth-nominating"
      )
        return state;
      return { ...state, assessment: action.value, nominationDecision: null };
    case "nomination": {
      if (state.interest !== "interested" || !action.rationale?.trim())
        return state;
      if (!["recommend", "defer"].includes(action.decision)) return state;
      if (action.decision === "recommend" && !action.acknowledged) return state;
      return {
        ...state,
        assessment:
          action.decision === "recommend"
            ? "worth-nominating"
            : "needs-clarification",
        nominationDecision: {
          decision: action.decision,
          rationale: action.rationale.trim(),
          acknowledged: Boolean(action.acknowledged),
        },
        // A local decision is not an employer submission or an invitation.
        employerProgression: "not-submitted",
      };
    }
    default:
      return state;
  }
}

export const certificateContext = {
  id: "existing-certificates",
  text: "Existing offshore safety certificates",
  title: "Existing offshore safety certificates",
  question:
    "Do you already hold offshore safety certificates covering sea survival, fire, first aid and working at height? Please share any current certificates and expiry dates.",
};
export const discussionTopics = [careerContext, certificateContext];
