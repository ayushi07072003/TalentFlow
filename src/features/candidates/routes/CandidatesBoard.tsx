
import { CandidateKanban } from '../components/CandidateKanban';

export function CandidatesBoard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Candidates Board</h1>
        <p className="text-gray-600">Kanban view of candidates by stage</p>
      </div>

      <CandidateKanban />
    </div>
  );
}
