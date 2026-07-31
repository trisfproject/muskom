import { Ballot, Candidate } from "@/components/voting/Ballot";

export default function PublicVotingPage() {
  // In a real implementation, this checks eligibility via token/ID, 
  // and fetches candidates via API.
  const mockCandidates: Candidate[] = [
    {
      id: "1",
      number: 1,
      name: "John Doe",
      photo_url: "https://i.pravatar.cc/300?img=11",
      vision: "A modern, inclusive, and technologically advanced organization.",
      mission: "To bridge the gap between traditional operations and digital transformation through community-driven initiatives."
    },
    {
      id: "2",
      number: 2,
      name: "Jane Smith",
      photo_url: "https://i.pravatar.cc/300?img=5",
      vision: "Transparency and operational excellence across all divisions.",
      mission: "Focus on rigid auditing, increased member participation, and expanding our physical footprint."
    }
  ];

  const handleVote = (candidateId: string) => {
    // Submit vote to POST /api/v1/voting/cast
    console.log("Voted for:", candidateId);
    alert("Your vote has been successfully cast. Thank you for participating.");
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto mb-8 px-6">
        <div className="bg-blue-600 text-white rounded-xl p-6 text-center shadow-lg">
          <h1 className="text-2xl font-bold">Booth 01 - Active</h1>
          <p className="mt-1 opacity-90">Participant ID: REG-849201 (Verified)</p>
        </div>
      </div>
      <Ballot candidates={mockCandidates} onVote={handleVote} />
    </div>
  );
}
