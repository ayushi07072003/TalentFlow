import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { JobCard } from './JobCard';
import { JobForm } from './JobForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Job } from '@/lib/db';
import { Plus, Search, Filter } from 'lucide-react';

interface SortableJobCardProps {
  job: Job;
  onEdit: (job: Job) => void;
  onArchive: (job: Job) => void;
  onUnarchive: (job: Job) => void;
  onDelete: (job: Job) => void;
}

function SortableJobCard({ job, onEdit, onArchive, onUnarchive, onDelete }: SortableJobCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: job.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <JobCard
        job={job}
        onEdit={onEdit}
        onArchive={onArchive}
        onUnarchive={onUnarchive}
        onDelete={onDelete}
      />
    </div>
  );
}

interface JobsListProps {
  search: string;
  status: string;
  tags: string[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export function JobsList({ search, status, tags, sortBy, sortOrder }: JobsListProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { data: jobsData, isLoading } = useQuery({
    queryKey: ['jobs', { search, status, tags, sortBy, sortOrder }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (status) params.append('status', status);
      if (tags.length > 0) params.append('tags', tags.join(','));
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);
      params.append('page', '1');
      params.append('pageSize', '50');

      const response = await fetch(`/api/jobs?${params}`);
      if (!response.ok) throw new Error('Failed to fetch jobs');
      return response.json();
    },
  });

  const createJobMutation = useMutation({
    mutationFn: async (data: { title: string; slug: string; tags: string }) => {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title,
          slug: data.slug,
          tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : [],
        }),
      });
      if (!response.ok) throw new Error('Failed to create job');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      setIsFormOpen(false);
    },
  });

  const updateJobMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Job> }) => {
      const response = await fetch(`/api/jobs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update job');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      setIsFormOpen(false);
      setEditingJob(null);
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async ({ id, fromOrder, toOrder }: { id: string; fromOrder: number; toOrder: number }) => {
      const response = await fetch(`/api/jobs/${id}/reorder`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromOrder, toOrder }),
      });
      if (!response.ok) throw new Error('Failed to reorder job');
      return response.json();
    },
    onError: () => {
      // Rollback optimistic update
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });

    // Delete job mutation
    const deleteJobMutation = useMutation({
      mutationFn: async (id: string) => {
        const response = await fetch(`/api/jobs/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete job');
        return response.json();
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['jobs'] });
      },
    });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = jobsData.jobs.findIndex((job: Job) => job.id === active.id);
      const newIndex = jobsData.jobs.findIndex((job: Job) => job.id === over?.id);

      // Optimistic update
      queryClient.setQueryData(['jobs', { search, status, tags }], (old: any) => ({
        ...old,
        jobs: arrayMove(old.jobs, oldIndex, newIndex),
      }));

      // API call
      reorderMutation.mutate({
        id: active.id as string,
        fromOrder: oldIndex,
        toOrder: newIndex,
      });
    }
  };

  const handleEdit = (job: Job) => {
    setEditingJob(job);
    setIsFormOpen(true);
  };

  const handleArchive = async (job: Job) => {
    updateJobMutation.mutate({
      id: job.id,
      data: { status: 'archived' },
    });
  };

  const handleUnarchive = async (job: Job) => {
    updateJobMutation.mutate({
      id: job.id,
      data: { status: 'active' },
    });
  };

    const handleDelete = async (job: Job) => {
      if (window.confirm(`Delete job "${job.title}"? This cannot be undone.`)) {
        deleteJobMutation.mutate(job.id);
      }
    };

  const handleFormSubmit = (data: { title: string; slug: string; tags: string }) => {
    if (editingJob) {
      updateJobMutation.mutate({
        id: editingJob.id,
        data: {
          title: data.title,
          slug: data.slug,
          tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : [],
        },
      });
    } else {
      createJobMutation.mutate(data);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading jobs...</div>;
  }

  // ...existing code...
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Jobs ({jobsData?.pagination?.total || 0})</h2>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Job
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={jobsData?.jobs?.map((job: Job) => job.id) || []}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {jobsData?.jobs?.map((job: Job) => (
                <SortableJobCard
                  key={job.id}
                  job={job}
                  onEdit={handleEdit}
                  onArchive={handleArchive}
                  onUnarchive={handleUnarchive}
                  onDelete={handleDelete}
                />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <JobForm
        job={editingJob ?? undefined}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingJob(null);
        }}
        onSubmit={handleFormSubmit as any}
        isLoading={createJobMutation.isPending || updateJobMutation.isPending}
      />
    </div>
  );
}
