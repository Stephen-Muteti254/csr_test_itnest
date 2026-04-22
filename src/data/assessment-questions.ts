export interface MCQQuestion {
  id: number;
  question: string;
  options: { label: string; text: string }[];
  answer: string;
}

export interface WrittenQuestion {
  id: number;
  question: string;
  task?: string;
  expectedPoints: string[];
}

export interface AnalyticalQuestion {
  id: number;
  question: string;
  context?: string;
  task?: string;
  expectedAnswer?: string;
}

export const sectionAQuestions: MCQQuestion[] = [
  {
    id: 1,
    question: "A high-value client reports an issue that is clearly caused by their own misuse of your platform. What is the BEST response strategy?",
    options: [
      { label: "A", text: "Immediately correct them and cite policy" },
      { label: "B", text: "Apologize and offer compensation" },
      { label: "C", text: "Acknowledge their frustration, clarify facts tactfully, and guide resolution" },
      { label: "D", text: "Escalate to management" },
    ],
    answer: "C",
  },
  {
    id: 2,
    question: "Which metric BEST reflects long-term customer relationship health?",
    options: [
      { label: "A", text: "Average Handling Time (AHT)" },
      { label: "B", text: "First Response Time (FRT)" },
      { label: "C", text: "Customer Satisfaction Score (CSAT)" },
      { label: "D", text: "Customer Lifetime Value (CLV)" },
    ],
    answer: "D",
  },
  {
    id: 3,
    question: "A customer repeats the same complaint across multiple channels. This MOST likely indicates:",
    options: [
      { label: "A", text: "Lack of patience" },
      { label: "B", text: "System misuse" },
      { label: "C", text: "Breakdown in resolution ownership" },
      { label: "D", text: "Poor product design" },
    ],
    answer: "C",
  },
  {
    id: 4,
    question: "When de-escalating an irate customer, what is the MOST critical first step?",
    options: [
      { label: "A", text: "Offer a refund" },
      { label: "B", text: "Explain company policy" },
      { label: "C", text: "Acknowledge emotions" },
      { label: "D", text: "Transfer to supervisor" },
    ],
    answer: "C",
  },
  {
    id: 5,
    question: "Which of the following demonstrates proactive customer service?",
    options: [
      { label: "A", text: "Responding quickly to tickets" },
      { label: "B", text: "Following up after resolution" },
      { label: "C", text: "Waiting for escalation before action" },
      { label: "D", text: "Closing tickets immediately" },
    ],
    answer: "B",
  },
  {
    id: 6,
    question: "A customer asks for an exception to a strict policy. What should guide your decision MOST?",
    options: [
      { label: "A", text: "Personal judgment" },
      { label: "B", text: "Company policy flexibility guidelines" },
      { label: "C", text: "Customer tone" },
      { label: "D", text: "Time of request" },
    ],
    answer: "B",
  },
  {
    id: 7,
    question: "Which situation MOST justifies escalation?",
    options: [
      { label: "A", text: "Customer is slightly dissatisfied" },
      { label: "B", text: "Issue exceeds agent authority or risk threshold" },
      { label: "C", text: "Long response time" },
      { label: "D", text: "Customer asks many questions" },
    ],
    answer: "B",
  },
  {
    id: 8,
    question: "What is the BEST indicator of poor internal knowledge management?",
    options: [
      { label: "A", text: "High CSAT" },
      { label: "B", text: "Frequent agent escalations" },
      { label: "C", text: "Low ticket volume" },
      { label: "D", text: "Fast response times" },
    ],
    answer: "B",
  },
  {
    id: 9,
    question: 'A customer says: "This always happens with your service." This is an example of:',
    options: [
      { label: "A", text: "Valid data feedback" },
      { label: "B", text: "Emotional exaggeration" },
      { label: "C", text: "Product bug" },
      { label: "D", text: "Escalation trigger" },
    ],
    answer: "B",
  },
  {
    id: 10,
    question: "What is the MOST effective way to handle a vague complaint?",
    options: [
      { label: "A", text: "Provide general solutions" },
      { label: "B", text: "Ask targeted clarifying questions" },
      { label: "C", text: "Escalate immediately" },
      { label: "D", text: "Close the ticket" },
    ],
    answer: "B",
  },
];

export const sectionBQuestions: MCQQuestion[] = [
  {
    id: 11,
    question: "You discover another agent gave incorrect information to a customer earlier. What do you do?",
    options: [
      { label: "A", text: "Ignore it" },
      { label: "B", text: "Correct the customer without explanation" },
      { label: "C", text: "Acknowledge confusion, correct clearly, and rebuild trust" },
      { label: "D", text: "Blame the previous agent" },
    ],
    answer: "C",
  },
  {
    id: 12,
    question: "A customer threatens to leave your service publicly on social media. What is the BEST action?",
    options: [
      { label: "A", text: "Ignore unless they post" },
      { label: "B", text: "Offer immediate compensation" },
      { label: "C", text: "Address concern seriously and attempt resolution privately" },
      { label: "D", text: "Escalate to legal" },
    ],
    answer: "C",
  },
  {
    id: 13,
    question: "You are handling 5 simultaneous chats. One customer is idle, one is angry, three are normal. Who do you prioritize?",
    options: [
      { label: "A", text: "Idle customer" },
      { label: "B", text: "Angry customer" },
      { label: "C", text: "First customer" },
      { label: "D", text: "Random" },
    ],
    answer: "B",
  },
  {
    id: 14,
    question: "A customer requests a feature that doesn't exist. What is the BEST response?",
    options: [
      { label: "A", text: "Say no" },
      { label: "B", text: "Ignore" },
      { label: "C", text: "Acknowledge request, explain limitation, log feedback" },
      { label: "D", text: "Promise future delivery" },
    ],
    answer: "C",
  },
  {
    id: 15,
    question: "A VIP client requests a workaround that violates system integrity. What do you do?",
    options: [
      { label: "A", text: "Approve due to status" },
      { label: "B", text: "Deny bluntly" },
      { label: "C", text: "Explain risks and offer alternative solutions" },
      { label: "D", text: "Escalate immediately" },
    ],
    answer: "C",
  },
  {
    id: 16,
    question: "A customer gives a low rating but says the agent was helpful. What does this MOST likely indicate?",
    options: [
      { label: "A", text: "Agent failure" },
      { label: "B", text: "Product or policy issue" },
      { label: "C", text: "Customer bias" },
      { label: "D", text: "Random rating" },
    ],
    answer: "B",
  },
  {
    id: 17,
    question: "A colleague consistently underperforms, affecting customer experience. What is the BEST action?",
    options: [
      { label: "A", text: "Ignore" },
      { label: "B", text: "Report immediately" },
      { label: "C", text: "Offer support or guidance, then escalate if needed" },
      { label: "D", text: "Complain publicly" },
    ],
    answer: "C",
  },
  {
    id: 18,
    question: "You notice repeated complaints about the same issue. What should you do?",
    options: [
      { label: "A", text: "Handle individually" },
      { label: "B", text: "Escalate as a pattern to relevant teams" },
      { label: "C", text: "Ignore trend" },
      { label: "D", text: "Close tickets faster" },
    ],
    answer: "B",
  },
];

export const sectionCQuestions: WrittenQuestion[] = [
  {
    id: 19,
    question: 'A customer writes:\n\n"Your service wasted my time. I want a refund NOW."',
    task: "Write a response (max 120 words)",
    expectedPoints: ["Empathy", "Ownership", "Clarification or next step", "Calm tone"],
  },
  {
    id: 20,
    question: "Explain how you would handle a situation where the customer is wrong but insisting they are right.",
    expectedPoints: ["Respectful correction", "Evidence-based explanation", "Tone control", "Avoid confrontation"],
  },
  {
    id: 21,
    question: "Describe a system you would use to manage multiple high-priority tickets simultaneously.",
    expectedPoints: ["Prioritization logic", "Categorization", "Time management", "Escalation criteria"],
  },
  {
    id: 22,
    question: "How would you improve customer experience without increasing operational costs?",
    expectedPoints: ["Process improvement", "Knowledge base optimization", "Automation", "Training"],
  },
  {
    id: 23,
    question: 'What does "ownership" mean in customer service? Give a practical example.',
    expectedPoints: ["End-to-end responsibility", "Follow-through", "Accountability"],
  },
];

export const sectionDQuestions: AnalyticalQuestion[] = [
  {
    id: 24,
    question: "You receive the following tickets at the same time:",
    context: "• VIP client – system outage\n• New user – onboarding question\n• Angry customer – delayed response\n• Minor bug report\n• Payment failure (multiple users affected)",
    task: "Rank in order of priority and justify your reasoning.",
  },
  {
    id: 25,
    question: "Your team's metrics show:",
    context: "• High CSAT\n• Increasing escalations\n• Repeated complaints",
    task: "What is the MOST likely root issue and how would you fix it?",
  },
];
