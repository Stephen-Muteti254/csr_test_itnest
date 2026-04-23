import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { sectionDQuestions } from "@/data/assessment-questions";

interface Props {
  answers: Record<number, string>;
  setAnswers: (answers: Record<number, string>) => void;
}

export function AssessmentSectionD({ answers, setAnswers }: Props) {
  const handleChange = (questionId: number, value: string) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const answeredCount = Object.values(answers).filter(v => v.trim().length > 0).length;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Badge className="text-xs">Section D</Badge>
          <span className="text-xs text-muted-foreground">{answeredCount}/2 answered</span>
        </div>
        <h2 className="text-xl font-bold text-foreground">Analytical & Prioritization</h2>
        {/*<p className="text-sm text-muted-foreground">Demonstrate elite-level analytical thinking and prioritization skills.</p>*/}
      </div>

      {sectionDQuestions.map((q) => (
        <Card key={q.id} className="shadow-none !shadow-none border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold leading-relaxed">
              <span className="text-muted-foreground mr-2">Q{q.id}.</span>
              {q.question}
            </CardTitle>
            {q.context && (
              <pre className="mt-2 whitespace-pre-wrap text-xs text-muted-foreground font-sans bg-muted/50 rounded-md p-3">
                {q.context}
              </pre>
            )}
            {q.task && (
              <p className="text-xs text-primary font-medium mt-2">Task: {q.task}</p>
            )}
          </CardHeader>
          <CardContent>
            <textarea
              value={answers[q.id] || ""}
              onChange={(e) => handleChange(q.id, e.target.value)}
              rows={8}
              placeholder="Type your detailed response here..."
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-y"
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
