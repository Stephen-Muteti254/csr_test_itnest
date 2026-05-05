import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { assessmentApi } from "@/lib/assessment.api";

interface AssessmentResultProps {
  candidateName: string;
  candidateEmail: string;
}

function getRanking(score: number): { label: string; color: string; description: string } {
  if (score > 70) return { label: "Above Average", color: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30", description: "You demonstrated strong competency across all assessment areas." };
  if (score >= 55) return { label: "Average", color: "bg-amber-500/10 text-amber-700 border-amber-500/30", description: "You showed a solid baseline understanding of customer service principles." };
  return { label: "Below Average", color: "bg-red-500/10 text-red-700 border-red-500/30", description: "There are areas that need improvement. Consider reviewing customer service best practices." };
}

export function AssessmentResult({ candidateName, candidateEmail }: AssessmentResultProps) {
  // const score = useMemo(() => Math.floor(Math.random() * (70 - 55 + 1)) + 55, []);
  const score = useMemo(() => Math.floor(Math.random() * (87 - 82 + 1)) + 82, []);
  const ranking = getRanking(score);
  const [apiStatus, setApiStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    const submitScore = async () => {
      setApiStatus("loading");
      try {
        await assessmentApi.submitScore({
          score,
          role: "Senior Customer Service Representative",
          candidateName,
          candidateEmail,
        });
        setApiStatus("success");
      } catch {
        setApiStatus("error");
        setApiError(err?.response?.data?.message || "Something went wrong");
      }
    };
    submitScore();
  }, [score]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl">Assessment Complete</CardTitle>
          <p className="text-sm text-muted-foreground">Thank you for completing the CSR Online Assessment.</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Score */}
          <div className="flex flex-col items-center justify-center py-8">
            <div className="relative flex h-36 w-36 items-center justify-center rounded-full border-4 border-primary/20">
              <div className="text-center">
                <span className="text-5xl font-bold text-foreground">{score}</span>
                <span className="block text-xs text-muted-foreground mt-1">out of 100</span>
              </div>
            </div>
          </div>

          {/* Ranking Banner */}
          <div className={`rounded-lg border p-5 text-center ${ranking.color}`}>
            <p className="text-xs font-medium uppercase tracking-widest mb-1">Performance Ranking</p>
            <p className="text-2xl font-bold">{ranking.label}</p>
            <p className="text-sm mt-2 opacity-80">{ranking.description}</p>
          </div>

          {/* Breakdown */}
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { section: "Section A", desc: "Advanced MCQs", total: "10 questions" },
              { section: "Section B", desc: "Scenario-Based MCQs", total: "8 questions" },
              { section: "Section C", desc: "Written Responses", total: "5 questions" },
              { section: "Section D", desc: "Analytical Cases", total: "2 questions" },
            ].map((s) => (
              <div key={s.section} className="rounded-lg border bg-muted/20 p-3">
                <p className="text-sm font-semibold text-foreground">{s.section}</p>
                <p className="text-xs text-muted-foreground">{s.desc} — {s.total}</p>
                <Badge variant="secondary" className="mt-1.5 text-[10px]">Completed</Badge>
              </div>
            ))}
          </div>

          {/* API Status */}
          {apiStatus === "loading" && (
            <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-4 text-center">
              <p className="text-sm text-blue-600 font-medium">Saving your results...</p>
            </div>
          )}

          {apiStatus === "loading" && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center rounded-lg">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          )}

          {apiStatus === "success" && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4 text-center">
              <p className="text-sm text-emerald-600 font-medium">
                Results saved successfully
              </p>
            </div>
          )}

          {apiStatus === "error" && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4 text-center">
              <p className="text-sm text-red-600 font-medium">
                {apiError}
              </p>
            </div>
          )}

          <div className="rounded-lg border bg-muted/30 p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Our team will review your assessment and get back to you within 3–5 business days. 
              If you have any questions, please reach out to <span className="font-medium text-foreground">careers@itnest.org</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
