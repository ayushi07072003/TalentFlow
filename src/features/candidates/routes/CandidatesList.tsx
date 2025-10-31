import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { VirtualizedCandidatesList } from '../components/VirtualizedCandidatesList';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Grid, List } from 'lucide-react';

const STAGE_OPTIONS = [
  { value: '', label: 'All Stages' },
  { value: 'applied', label: 'Applied' },
  { value: 'screen', label: 'Screen' },
  { value: 'tech', label: 'Tech' },
  { value: 'offer', label: 'Offer' },
  { value: 'hired', label: 'Hired' },
  { value: 'rejected', label: 'Rejected' },
];

export function CandidatesList() {
  const [search, setSearch] = useState('');
  const [stage, setStage] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const jobId = params.get('jobId') || undefined;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Candidates</h1>
          <p className="text-gray-600">Manage candidate applications</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4 mr-2" />
            List
          </Button>
          <Button
            variant={viewMode === 'board' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('board')}
          >
            <Grid className="h-4 w-4 mr-2" />
            Board
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search candidates..."
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Stage Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Stage</label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {STAGE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* If opened from a Job, show a back link */}
      {jobId && (
        <div>
          <Link to={`/jobs/${jobId}`}>
            <Button variant="ghost">Back to Job</Button>
          </Link>
        </div>
      )}

      {/* View Mode Content */}
      {viewMode === 'list' ? (
        <VirtualizedCandidatesList stage={stage} jobId={jobId} />
      ) : (
        <div className="text-center py-8">
          <Grid className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Kanban Board</h3>
          <p className="text-gray-600 mb-4">
            Switch to board view to see candidates organized by stage
          </p>
          <Link to="/candidates/board">
            <Button>
              <Grid className="h-4 w-4 mr-2" />
              Go to Board View
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
