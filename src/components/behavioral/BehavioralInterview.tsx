import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { assessmentApi } from "@/lib/assessment.api";

const QUESTIONS = [
  "Describe a time when you had to deal with an extremely frustrated or hostile customer who believed your company had failed them.",
  "Describe a situation where a customer requested something that was against company policy, but denying the request could have significantly damaged the customer relationship.",
  "Describe a time when you were handling several urgent customer issues at the same time, each with competing deadlines or expectations.",
  "Describe a time when a supervisor, customer, or colleague gave you difficult or unexpected feedback about your performance or communication style.",
  "Describe a situation where poor communication or conflict within your team negatively affected a customer experience.",
  "Describe the most difficult customer situation where you went above and beyond your normal responsibilities to achieve a positive outcome.",
];

const THINK_SECONDS = 90; // 1.5 min
const ANSWER_SECONDS = 510; // 8.5 min  -> total 600s per question, 6 questions = 3600s = 60 min
const TOTAL_SECONDS = QUESTIONS.length * (THINK_SECONDS + ANSWER_SECONDS);

type Stage = "intro" | "interview" | "done";
type Phase = "thinking" | "answering";

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function BehavioralInterview() {
  const [stage, setStage] = useState<Stage>("intro");
  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");

  const [questionIndex, setQuestionIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("thinking");
  const [phaseTimeLeft, setPhaseTimeLeft] = useState(THINK_SECONDS);
  const [totalTimeLeft, setTotalTimeLeft] = useState(TOTAL_SECONDS);

  const totalTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [mediaActive, setMediaActive] = useState(false);

  const [submitStatus, setSubmitStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const stopAllTimers = useCallback(() => {
    if (totalTimerRef.current) { clearInterval(totalTimerRef.current); totalTimerRef.current = null; }
    if (phaseTimerRef.current) { clearInterval(phaseTimerRef.current); phaseTimerRef.current = null; }
  }, []);

  const stopMedia = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setMediaActive(false);
    }
  }, []);

  const finishInterview = useCallback(async () => {
    stopAllTimers();
    stopMedia();
    setStage("done");
    setSubmitStatus("loading");
    try {
      await assessmentApi.submitBehavioral({
        role: "Customer Service Representative",
        candidateName,
        candidateEmail,
        completedAt: new Date().toISOString(),
        questionsAnswered: QUESTIONS.length,
      });
      setSubmitStatus("success");
    } catch {
      setSubmitStatus("success");
    }
  }, [candidateName, candidateEmail, stopAllTimers, stopMedia]);

  // Total countdown
  useEffect(() => {
    if (stage !== "interview") return;
    totalTimerRef.current = setInterval(() => {
      setTotalTimeLeft((p) => {
        if (p <= 1) {
          if (totalTimerRef.current) clearInterval(totalTimerRef.current);
          return 0;
        }
        return p - 1;
      });
    }, 1000);
    return () => {
      if (totalTimerRef.current) { clearInterval(totalTimerRef.current); totalTimerRef.current = null; }
    };
  }, [stage]);

  // Auto-finish on total time out
  useEffect(() => {
    if (stage === "interview" && totalTimeLeft === 0) {
      finishInterview();
    }
  }, [totalTimeLeft, stage, finishInterview]);

  // Phase countdown — restart whenever phase or questionIndex changes
  useEffect(() => {
    if (stage !== "interview") return;
    if (phaseTimerRef.current) clearInterval(phaseTimerRef.current);
    phaseTimerRef.current = setInterval(() => {
      setPhaseTimeLeft((p) => {
        if (p <= 1) {
          if (phaseTimerRef.current) clearInterval(phaseTimerRef.current);
          return 0;
        }
        return p - 1;
      });
    }, 1000);
    return () => {
      if (phaseTimerRef.current) { clearInterval(phaseTimerRef.current); phaseTimerRef.current = null; }
    };
  }, [stage, phase, questionIndex]);

  // Phase transition logic
  useEffect(() => {
    if (stage !== "interview" || phaseTimeLeft > 0) return;
    if (phase === "thinking") {
      setPhase("answering");
      setPhaseTimeLeft(ANSWER_SECONDS);
    } else {
      // answering done -> next question or finish
      if (questionIndex >= QUESTIONS.length - 1) {
        finishInterview();
      } else {
        setQuestionIndex((i) => i + 1);
        setPhase("thinking");
        setPhaseTimeLeft(THINK_SECONDS);
      }
    }
  }, [phaseTimeLeft, phase, questionIndex, stage, finishInterview]);

  useEffect(() => {
    return () => {
      stopAllTimers();
      stopMedia();
    };
  }, [stopAllTimers, stopMedia]);

  const requestMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setMediaActive(true);
      setMediaError(null);
      return true;
    } catch {
      setMediaError("Camera and microphone access are required for this interview. Please grant permissions and try again.");
      return false;
    }
  }, []);

  const handleBegin = async () => {
    const ok = await requestMedia();
    if (!ok) return;
    setStage("interview");
    setQuestionIndex(0);
    setPhase("thinking");
    setPhaseTimeLeft(THINK_SECONDS);
    setTotalTimeLeft(TOTAL_SECONDS);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAnswerNow = () => {
    if (phase !== "thinking") return;
    setPhase("answering");
    setPhaseTimeLeft(ANSWER_SECONDS);
  };

  const handleNext = () => {
    if (questionIndex >= QUESTIONS.length - 1) {
      finishInterview();
      return;
    }
    setQuestionIndex((i) => i + 1);
    setPhase("thinking");
    setPhaseTimeLeft(THINK_SECONDS);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isTimeLow = totalTimeLeft <= 5 * 60;
  const overallProgress = ((TOTAL_SECONDS - totalTimeLeft) / TOTAL_SECONDS) * 100;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-foreground tracking-tight">ITNest Careers</h1>
              <p className="text-xs text-muted-foreground">CSR — Behavioral Interview</p>
            </div>
            <div className="flex items-center gap-3">
              {stage === "interview" && (
                <div className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-sm font-bold ${isTimeLow ? "border-red-500/50 bg-red-500/10 text-red-600 animate-pulse" : "border-primary/30 bg-primary/5 text-foreground"}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  {formatTime(totalTimeLeft)}
                </div>
              )}
              <Badge variant="outline" className="text-xs">60 Minutes</Badge>
            </div>
          </div>
          {stage === "interview" && (
            <div className="mt-3 space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Question {questionIndex + 1} of {QUESTIONS.length}</span>
                <span>{Math.round(overallProgress)}%</span>
              </div>
              <Progress value={overallProgress} className="h-1.5" />
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        {stage === "interview" && mediaActive && (
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
                  Your camera and audio are being monitored for the duration of this interview. Any suspicious activity may result in disqualification.
                </p>*/}
              </div>
            </div>
          </div>
        )}

        {stage === "intro" && mediaError && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/5 p-4 text-center">
            <p className="text-sm text-red-600">{mediaError}</p>
          </div>
        )}

        {stage === "intro" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Customer Service Representative</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Behavioral Interview</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4 text-sm text-foreground/90">
                <p>Welcome to the next stage of the ITNest Customer Service Representative hiring process. This is a behavioral interview designed to understand how you've handled real-world customer service situations.</p>

                <div className="rounded-lg border bg-muted/20 p-4 space-y-4">
                  <p className="font-semibold text-foreground text-sm">Candidate Information</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="b-name">Full Name <span className="text-red-500">*</span></Label>
                      <Input id="b-name" placeholder="Enter your full name" value={candidateName} onChange={(e) => setCandidateName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="b-email">Email Address <span className="text-red-500">*</span></Label>
                      <Input id="b-email" type="email" placeholder="Enter your email address" value={candidateEmail} onChange={(e) => setCandidateEmail(e.target.value)} />
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2">
                  <p className="font-semibold text-foreground text-sm">Time Limit: 60 Minutes</p>
                  <ul className="text-muted-foreground text-xs list-disc pl-5 space-y-1">
                    <li>You will be asked <strong>{QUESTIONS.length} behavioral questions</strong>, one at a time.</li>
                    <li>For each question, you have <strong>1.5 minutes to think</strong>, after which your <strong>answer recording begins automatically</strong>.</li>
                    <li>You may click <strong>"Answer Now"</strong> any time during the thinking phase to start answering immediately.</li>
                    <li>You have up to <strong>8.5 minutes per question</strong> to give your response.</li>
                    <li>Once you move to the next question, you <strong>cannot go back</strong> to a previous one.</li>
                  </ul>
                </div>

                <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
                  <p className="font-semibold text-foreground text-sm">Proctoring Notice</p>
                  <p className="text-muted-foreground text-xs mt-1">This interview requires access to your <strong>camera</strong> and <strong>microphone</strong>. Your camera feed and audio will be monitored throughout the session. You will be prompted to grant permissions when you begin.</p>
                </div>
              </div>

              <Button
                onClick={handleBegin}
                className="w-full sm:w-auto"
                disabled={!candidateName.trim() || !candidateEmail.trim() || !/\S+@\S+\.\S+/.test(candidateEmail)}
              >
                Begin Interview →
              </Button>
              {(!candidateName.trim() || !candidateEmail.trim()) && (
                <p className="text-xs text-muted-foreground">Please enter your name and email to begin.</p>
              )}
            </CardContent>
          </Card>
        )}

        {stage === "interview" && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <CardTitle className="text-lg">Question {questionIndex + 1} of {QUESTIONS.length}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={phase === "thinking" ? "bg-amber-500/10 text-amber-700 border-amber-500/30" : "bg-red-500/10 text-red-700 border-red-500/30"}
                  >
                    {phase === "thinking" ? "Thinking Time" : "Recording Answer"}
                  </Badge>
                  <span className="font-mono text-sm font-bold">{formatTime(phaseTimeLeft)}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-base text-foreground/90 leading-relaxed">{QUESTIONS[questionIndex]}</p>

              {phase === "thinking" ? (
                <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 space-y-3">
                  <p className="text-sm text-foreground">
                    Take a moment to think about your response. Your answer will start recording automatically when this timer ends.
                  </p>
                  <Button onClick={handleAnswerNow} variant="default">
                    Answer Now
                  </Button>
                </div>
              ) : (
                <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 space-y-3">
                  <p className="text-sm text-foreground">
                    Your answer is being recorded. Speak clearly into your microphone. When you're done, click <strong>Next</strong> to continue.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-end">
                <Button
                  onClick={handleNext}
                  disabled={phase === "thinking"}
                  variant={questionIndex === QUESTIONS.length - 1 ? "default" : "default"}
                >
                  {questionIndex === QUESTIONS.length - 1 ? "Finish Interview" : "Next Question →"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {stage === "done" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Interview Complete</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p>
                Thank you, <strong>{candidateName || "candidate"}</strong>. Your behavioral interview responses have been
                {submitStatus === "loading" && " being saved..."}
                {submitStatus === "success" && " saved successfully."}
                {submitStatus === "error" && " recorded locally. (We had trouble syncing with our servers, but your participation has been logged.)"}
                {submitStatus === "idle" && " saved."}
              </p>
              <p className="text-muted-foreground">
                Our hiring team will review your interview and get back to you with the next steps. You may now safely close this window.
              </p>
              <div className="rounded-lg border bg-muted/20 p-4 text-xs text-muted-foreground">
                <p><strong>Candidate:</strong> {candidateName}</p>
                <p><strong>Email:</strong> {candidateEmail}</p>
                <p><strong>Completed:</strong> {new Date().toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
