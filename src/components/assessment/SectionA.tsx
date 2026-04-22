import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { sectionAQuestions } from "@/data/assessment-questions";

interface Props {
  answers: Record<number, string>;
  setAnswers: (answers: Record<number, string>) => void;
}

export function AssessmentSectionA({ answers, setAnswers }: Props) {
  const handleSelect = (questionId: number, label: string) => {
    setAnswers({ ...answers, [questionId]: label });
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Badge className="text-xs">Section A</Badge>
          <span className="text-xs text-muted-foreground">{Object.keys(answers).length}/10 answered</span>
        </div>
        <h2 className="text-xl font-bold text-foreground">Advanced Knowledge & Judgment</h2>
        {/*<p className="text-sm text-muted-foreground">Select the single best answer for each question.</p>*/}
      </div>

      {sectionAQuestions.map((q, idx) => (
        <Card
          key={q.id}
          className={`${answers[q.id] ? "border-primary/30" : ""} shadow-none !shadow-none border-0`}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold leading-relaxed">
              <span className="text-muted-foreground mr-2">Q{q.id}.</span>
              {q.question}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {q.options.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => handleSelect(q.id, opt.label)}
                  className={`flex items-start gap-3 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent/50 ${
                    answers[q.id] === opt.label
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                      : "border-border"
                  }`}
                >
                  <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
                    answers[q.id] === opt.label
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground/30 text-muted-foreground"
                  }`}>
                    {opt.label}
                  </span>
                  <span className="text-foreground/90">{opt.text}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
