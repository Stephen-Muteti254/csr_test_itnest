import api from "@/lib/api";

export const assessmentApi = {
  submitScore: async (payload: { score: number; role: string; candidateName: string; candidateEmail: string }) => {
    const res = await api.post("/assessments/scores", payload);
    return res.data;
  },
};
