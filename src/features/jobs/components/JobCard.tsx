import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Job } from '@/lib/db';
import { Archive, Edit, ExternalLink } from 'lucide-react';

interface JobCardProps {
  job: Job;
  onEdit: (job: Job) => void;
  onArchive: (job: Job) => void;
  onUnarchive: (job: Job) => void;
  onDelete: (job: Job) => void;
}

export function JobCard({ job, onEdit, onArchive, onUnarchive }: JobCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
        <div className="flex-1">
          <Link to={`/jobs/${job.id}`} className="hover:underline">
            <CardTitle className="text-lg">{job.title}</CardTitle>
          </Link>
          <p className="text-sm text-gray-500 mt-1">/{job.slug}</p>
        </div>
          <div className="flex items-center space-x-2">
            <Badge variant={job.status === 'active' ? 'default' : 'secondary'}>
              {job.status}
            </Badge>
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(job)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => job.status === 'active' ? onArchive(job) : onUnarchive(job)}
              >
                <Archive className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(job)}
                aria-label="Delete job"
                className="text-red-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-1">
          {job.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="mt-3 text-xs text-gray-500">
          Created: {new Date(job.createdAt).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
}
