import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Job } from '@/lib/db';

const jobSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  tags: z.string().optional(),
});

type JobFormData = z.infer<typeof jobSchema>;

interface JobFormProps {
  job?: Job;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: JobFormData) => void;
  isLoading?: boolean;
}

export function JobForm({ job, isOpen, onClose, onSubmit, isLoading }: JobFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: job?.title || '',
      slug: job?.slug || '',
      tags: job?.tags?.join(', ') || '',
    },
  });

  const title = watch('title');

  // Auto-generate slug from title
  React.useEffect(() => {
    if (title && !job) {
      const autoSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      reset({ slug: autoSlug });
    }
  }, [title, job, reset]);

  const handleFormSubmit = (data: JobFormData) => {
    const tags = data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [];
    onSubmit({ ...data, tags: tags.join(', ') });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{job ? 'Edit Job' : 'Create New Job'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Job Title</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="e.g., Senior Frontend Developer"
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">URL Slug</Label>
            <Input
              id="slug"
              {...register('slug')}
              placeholder="e.g., senior-frontend-developer"
            />
            {errors.slug && (
              <p className="text-sm text-red-500">{errors.slug.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              {...register('tags')}
              placeholder="e.g., React, TypeScript, Remote"
            />
          </div>
            {/* Dev debug panel for form data and errors */}
            {import.meta.env.DEV && (
              <div className="mt-4 p-2 bg-gray-50 border rounded text-xs">
                <div className="font-medium text-gray-700">Debug: JobForm</div>
                <div className="mt-2">form values:</div>
                <pre>{JSON.stringify(watch(), null, 2)}</pre>
                <div className="mt-2">errors:</div>
                <pre>{JSON.stringify(errors, null, 2)}</pre>
              </div>
            )}

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : job ? 'Update Job' : 'Create Job'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
