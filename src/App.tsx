import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { AssessmentSectionA } from "@/components/assessment/SectionA";
import { AssessmentSectionB } from "@/components/assessment/SectionB";
import { AssessmentSectionC } from "@/components/assessment/SectionC";
import { AssessmentSectionD } from "@/components/assessment/SectionD";
import { AssessmentResult } from "@/components/assessment/AssessmentResult";

type Section = "intro" | "a" | "b" | "c" | "d" | "result";

const TOTAL_SECONDS = 45 * 60;

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function App() {
  const [currentSection, setCurrentSection] = useState<Section>("intro");
  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [mcqAnswersA, setMcqAnswersA] = useState<Record<number, string>>({});
  const [mcqAnswersB, setMcqAnswersB] = useState<Record<number, string>>({});
  const [writtenAnswers, setWrittenAnswers] = useState<Record<number, string>>({});
  const [analyticalAnswers, setAnalyticalAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [timeLeft, setTimeLeft] = useState(TOTAL_SECONDS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [mediaActive, setMediaActive] = useState(false);

  const sectionOrder: Section[] = ["intro", "a", "b", "c", "d", "result"];
  const currentIndex = sectionOrder.indexOf(currentSection);
  const progressPercent = currentSection === "result" ? 100 : (currentIndex / (sectionOrder.length - 1)) * 100;

  const sectionLabels: Record<Section, string> = {
    intro: "Introduction",
    a: "Section A: Advanced MCQs",
    b: "Section B: Scenario-Based MCQs",
    c: "Section C: Written Responses",
    d: "Section D: Analytical Cases",
    result: "Results",
  };

  const startTimer = useCallback(() => {
    if (timerRef.current) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const requestMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setMediaActive(true);
      setMediaError(null);
    } catch {
      setMediaError("Camera/microphone access is required for this assessment. Please grant permissions and try again.");
    }
  }, []);

  useEffect(() => {
    return () => {
      stopTimer();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [stopTimer]);

  useEffect(() => {
    if (timeLeft === 0 && !submitted) {
      setSubmitted(true);
      setCurrentSection("result");
      stopTimer();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        setMediaActive(false);
      }
    }
  }, [timeLeft, submitted, stopTimer]);

  const canProceed = (): boolean => {
    switch (currentSection) {
      case "a": return Object.keys(mcqAnswersA).length === 10;
      case "b": return Object.keys(mcqAnswersB).length === 8;
      case "c": return Object.values(writtenAnswers).filter(v => v.trim().length > 0).length === 5;
      case "d": return Object.values(analyticalAnswers).filter(v => v.trim().length > 0).length === 2;
      default: return true;
    }
  };

  const handleBegin = async () => {
    await requestMedia();
    startTimer();
    setCurrentSection("a");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };


  const handleNext = () => {
  const idx = sectionOrder.indexOf(currentSection);

  if (idx < sectionOrder.length - 1) {
    const next = sectionOrder[idx + 1];

    if (next === "result") {
      setSubmitted(true);
      stopTimer();

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        setMediaActive(false);
      }

      // show processing dialog first
      setIsProcessing(true);

      setTimeout(() => {
        setIsProcessing(false);
        setCurrentSection("result");
      }, 3000);

      return;
    }

    setCurrentSection(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};

  // const handleNext = () => {
  //   const idx = sectionOrder.indexOf(currentSection);
  //   if (idx < sectionOrder.length - 1) {
  //     const next = sectionOrder[idx + 1];
  //     if (next === "result") {
  //       setSubmitted(true);
  //       stopTimer();
  //       if (streamRef.current) {
  //         streamRef.current.getTracks().forEach((t) => t.stop());
  //         setMediaActive(false);
  //       }
  //     }
  //     setCurrentSection(next);
  //     window.scrollTo({ top: 0, behavior: "smooth" });
  //   }
  // };

  const handlePrev = () => {
    const idx = sectionOrder.indexOf(currentSection);
    if (idx > 0) {
      setCurrentSection(sectionOrder[idx - 1]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const isTimeLow = timeLeft <= 5 * 60;
  const isTestActive = currentSection !== "intro" && currentSection !== "result";

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-foreground tracking-tight">ITNest Careers</h1>
              <p className="text-xs text-muted-foreground">Customer Service Representative — Online Assessment</p>
            </div>
            <div className="flex items-center gap-3">
              {isTestActive && (
                <div className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-sm font-bold ${isTimeLow ? "border-red-500/50 bg-red-500/10 text-red-600 animate-pulse" : "border-primary/30 bg-primary/5 text-foreground"}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  {formatTime(timeLeft)}
                </div>
              )}
              <Badge variant="outline" className="text-xs">
                45 Minutes
              </Badge>
            </div>
          </div>
          {currentSection !== "intro" && (
            <div className="mt-3 space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{sectionLabels[currentSection]}</span>
                <span>{Math.round(progressPercent)}%</span>
              </div>
              <Progress value={progressPercent} className="h-1.5" />
            </div>
          )}
        </div>
      </header>

      {isProcessing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-xl p-6 w-[320px] text-center shadow-xl border">
            <div className="flex justify-center mb-4">
              <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            </div>
            <p className="text-sm font-medium">Calculating your score...</p>
            <p className="text-xs text-muted-foreground mt-1">
              Please wait while we evaluate your responses
            </p>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-4xl px-4 py-8">
        {isTestActive && mediaActive && (
          <div className="mb-6 rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500"></span>
              </span>
              <span className="text-xs font-semibold text-red-600 uppercase tracking-wider">Recording in Progress</span>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-40 shrink-0">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full rounded-md border bg-black aspect-[4/3] object-cover"
                />
                {/*<p className="text-[10px] text-muted-foreground mt-1 text-center">Camera Feed</p>*/}
              </div>
              <div className="flex-1 space-y-2">
                <div className="rounded-md border bg-muted/30 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
                    <span className="text-xs font-medium text-foreground">Audio Monitoring Active</span>
                  </div>
                  <div className="flex gap-0.5 items-end h-6">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-1.5 bg-emerald-500/70 rounded-sm animate-pulse"
                        style={{
                          height: `${Math.random() * 100}%`,
                          animationDelay: `${i * 0.1}s`,
                          animationDuration: `${0.5 + Math.random() * 0.5}s`,
                        }}
                      />
                    ))}
                  </div>
                </div>
                {/*<p className="text-[10px] text-muted-foreground">
                  Your screen, camera, and audio are being monitored for the duration of this assessment. Any suspicious activity may result in disqualification.
                </p>*/}
              </div>
            </div>
          </div>
        )}

        {isTestActive && mediaError && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/5 p-4 text-center">
            <p className="text-sm text-red-600">{mediaError}</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={requestMedia}>
              Retry Permissions
            </Button>
          </div>
        )}

        {currentSection === "intro" && (
          <Card className="shadow-none !shadow-none border-0">
            <CardHeader>
              <CardTitle className="text-2xl">Customer Service Representative</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Online Assessment (OA)</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4 text-sm text-foreground/90">
                <p>Welcome to the ITNest Customer Service Representative assessment. This test evaluates your knowledge, judgment, and critical thinking skills relevant to a senior-level customer service role.</p>

                <div className="rounded-lg border bg-muted/20 p-4 space-y-4">
                  <p className="font-semibold text-foreground text-sm">Candidate Information</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="candidate-name">Full Name <span className="text-red-500">*</span></Label>
                      <Input
                        id="candidate-name"
                        placeholder="Enter your full name"
                        value={candidateName}
                        onChange={(e) => setCandidateName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="candidate-email">Email Address <span className="text-red-500">*</span></Label>
                      <Input
                        id="candidate-email"
                        type="email"
                        placeholder="Enter your email address"
                        value={candidateEmail}
                        onChange={(e) => setCandidateEmail(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { label: "Section A", desc: "Advanced MCQs (Single Answer)", count: "10 questions" },
                    { label: "Section B", desc: "Scenario-Based MCQs", count: "8 questions" },
                    { label: "Section C", desc: "Short Written Responses", count: "5 questions" },
                    { label: "Section D", desc: "Analytical / Prioritization Cases", count: "2 questions" },
                  ].map((s) => (
                    <div key={s.label} className="rounded-lg border bg-muted/30 p-3">
                      <p className="font-semibold text-foreground">{s.label}</p>
                      <p className="text-muted-foreground text-xs">{s.desc}</p>
                      <Badge variant="secondary" className="mt-1.5 text-[10px]">{s.count}</Badge>
                    </div>
                  ))}
                </div>

                <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
                  <p className="font-semibold text-foreground text-sm">Proctoring Notice</p>
                  <p className="text-muted-foreground text-xs mt-1">This assessment requires access to your <strong>camera</strong> and <strong>microphone</strong>. Your screen, camera feed, and audio will be recorded and monitored throughout the test. You will be prompted to grant permissions when you begin.</p>
                </div>

                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <p className="font-semibold text-foreground text-sm">Time Limit: 45 Minutes</p>
                  <p className="text-muted-foreground text-xs mt-1">Please ensure you have a stable internet connection and a quiet environment before beginning. All questions must be answered before submission. The assessment will auto-submit when time runs out.</p>
                </div>
              </div>

              <Button
                onClick={handleBegin}
                className="w-full sm:w-auto"
                disabled={!candidateName.trim() || !candidateEmail.trim() || !/\S+@\S+\.\S+/.test(candidateEmail)}
              >
                Begin Assessment
              </Button>
              {/*{(!candidateName.trim() || !candidateEmail.trim()) && (
                <p className="text-xs text-muted-foreground">Please enter your name and email to begin.</p>
              )}*/}
            </CardContent>
          </Card>
        )}

        {currentSection === "a" && (
          <AssessmentSectionA answers={mcqAnswersA} setAnswers={setMcqAnswersA} />
        )}

        {currentSection === "b" && (
          <AssessmentSectionB answers={mcqAnswersB} setAnswers={setMcqAnswersB} />
        )}

        {currentSection === "c" && (
          <AssessmentSectionC answers={writtenAnswers} setAnswers={setWrittenAnswers} />
        )}

        {currentSection === "d" && (
          <AssessmentSectionD answers={analyticalAnswers} setAnswers={setAnalyticalAnswers} />
        )}

        {currentSection === "result" && submitted && (
          <AssessmentResult candidateName={candidateName} candidateEmail={candidateEmail} />
        )}

        {isTestActive && (
          <div className="mt-8 flex items-center justify-between">
            <Button variant="outline" onClick={handlePrev}>
              ← Previous
            </Button>
            <Button onClick={handleNext} disabled={!canProceed()}>
              {currentSection === "d" ? "Submit Assessment" : "Next Section →"}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
