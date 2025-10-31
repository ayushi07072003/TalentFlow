import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Candidate } from '@/lib/db';
import { User, Mail, Calendar } from 'lucide-react';

const STAGES = [
  { id: 'applied', title: 'Applied', color: 'bg-blue-100 border-blue-200' },
  { id: 'screen', title: 'Screen', color: 'bg-yellow-100 border-yellow-200' },
  { id: 'tech', title: 'Tech', color: 'bg-purple-100 border-purple-200' },
  { id: 'offer', title: 'Offer', color: 'bg-green-100 border-green-200' },
  { id: 'hired', title: 'Hired', color: 'bg-emerald-100 border-emerald-200' },
  { id: 'rejected', title: 'Rejected', color: 'bg-red-100 border-red-200' },
];

interface CandidateCardProps {
  candidate: Candidate;
}

function CandidateCard({ candidate }: CandidateCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: candidate.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="mb-2 cursor-move hover:shadow-md transition-shadow"
    >
      <CardContent className="p-3">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="h-4 w-4 text-gray-600" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-900 truncate">
              {candidate.name}
            </h4>
            <div className="flex items-center mt-1">
              <Mail className="h-3 w-3 text-gray-400 mr-1" />
              <p className="text-xs text-gray-500 truncate">
                {candidate.email}
              </p>
            </div>
            <div className="flex items-center mt-1">
              <Calendar className="h-3 w-3 text-gray-400 mr-1" />
              <p className="text-xs text-gray-500">
                {new Date(candidate.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface KanbanColumnProps {
  stage: typeof STAGES[0];
  candidates: Candidate[];
}

function KanbanColumn({ stage, candidates }: KanbanColumnProps) {
  return (
    <div className="flex-1 min-w-0">
      <div className={`p-3 rounded-t-lg border-2 ${stage.color}`}>
        <h3 className="font-semibold text-sm text-gray-800">
          {stage.title} ({candidates.length})
        </h3>
      </div>
      <div className="bg-gray-50 border-l-2 border-r-2 border-b-2 border-gray-200 rounded-b-lg min-h-[400px] p-3">
        <SortableContext
          items={candidates.map(c => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {candidates.map((candidate) => (
            <CandidateCard key={candidate.id} candidate={candidate} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

export function CandidateKanban() {
  const queryClient = useQueryClient();

  const { data: candidates = [], isLoading } = useQuery({
    queryKey: ['candidates'],
    queryFn: async () => {
      const response = await fetch('/api/candidates');
      if (!response.ok) throw new Error('Failed to fetch candidates');
      return response.json();
    },
  });

  const updateCandidateMutation = useMutation({
    mutationFn: async ({ id, stage }: { id: string; stage: string }) => {
      const response = await fetch(`/api/candidates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage }),
      });
      if (!response.ok) throw new Error('Failed to update candidate');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active && over && active.id !== over.id) {
      const candidate = candidates.find((c: Candidate) => c.id === active.id);
      const newStage = over.id as string;

      if (candidate && candidate.stage !== newStage) {
        updateCandidateMutation.mutate({
          id: candidate.id,
          stage: newStage,
        });
      }
    }
  };

  // Group candidates by stage
  const candidatesByStage = STAGES.map(stage => ({
    stage,
    candidates: candidates.filter((c: Candidate) => c.stage === stage.id),
  }));

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading candidates...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Candidates Board</h2>
        <p className="text-gray-600">Drag candidates between stages</p>
      </div>

      <DndContext
        sensors={sensors}
        onDragEnd={handleDragEnd}
      >
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {candidatesByStage.map(({ stage, candidates }) => (
            <KanbanColumn
              key={stage.id}
              stage={stage}
              candidates={candidates}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
}
