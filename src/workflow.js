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
    ? "Suggested to keeper · awaiting response"
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
        responseOrigin: action.value === "not-discussed" ? null : "simulated",
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

export function nextRecommendation(state) {
  if (state.assessment === "not-suitable")
    return {
      action: "assessment",
      label: "Update officer assessment",
      guidance: "This opportunity is on hold following your assessment.",
    };
  if (state.interest === "not-interested")
    return {
      action: "response",
      label: "Review keeper response",
      guidance: "Keeper declined · no nomination",
      detail:
        "Respect Eimhin’s decision. Revisit this opportunity only if his interest changes.",
    };
  if (state.interest === "more-information")
    return {
      action: "clarify",
      label: "Prepare follow-up discussion",
      guidance:
        "Prepare the information Eimhin needs before he decides whether to pursue the role.",
    };
  if (state.interest === "interested") {
    if (state.nominationDecision)
      return {
        action: "nomination",
        label: "Review nomination decision",
        guidance:
          state.nominationDecision.decision === "recommend"
            ? "Nomination decision recorded · not submitted"
            : "Nomination deferred · resolve outstanding questions",
        detail:
          state.nominationDecision.decision === "recommend"
            ? "Review the recorded gaps and rationale before any employer referral."
            : "Follow up the recorded questions before reconsidering nomination.",
      };
    return {
      action: "nomination",
      label: "Consider for nomination",
      guidance:
        "Eimhin’s interest is recorded. Review his responsibilities and qualification gaps before deciding whether to put him forward.",
      detail:
        "Safety certification must be in place before mobilisation; the vacancy does not make certificate verification an interview condition. Medical fitness is essential, with no verification stage specified.",
    };
  }
  if (state.suggested)
    return {
      action: "response",
      label: "Record keeper response",
      guidance: "Awaiting keeper response",
      detail:
        "Discuss the opportunity with Eimhin and record whether he wants to pursue it.",
    };
  return {
    action: "discussion",
    label: "Prepare discussion",
    guidance: "Discuss the role and Eimhin’s existing safety certificates.",
    detail:
      "Prepare editable questions for your conversation; saving them does not record a suggestion or response.",
  };
}
