import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import { Candidate } from '@/lib/db';
import { Search, User, Mail, Calendar } from 'lucide-react';

interface VirtualizedCandidatesListProps {
  stage?: string;
  jobId?: string;
}

export function VirtualizedCandidatesList({ stage, jobId }: VirtualizedCandidatesListProps) {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50);
  const parentRef = React.useRef<HTMLDivElement>(null);

  const { data: candidatesData, isLoading } = useQuery({
    queryKey: ['candidates', { stage, page: currentPage, pageSize }],
    queryFn: async () => {
        const params = new URLSearchParams();
        if (stage) params.append('stage', stage);
        if (jobId) params.append('jobId', jobId);
        params.append('page', currentPage.toString());
        params.append('pageSize', pageSize.toString());
      
      const response = await fetch(`/api/candidates?${params}`);
      if (!response.ok) throw new Error('Failed to fetch candidates');

      const json = await response.json();

      // Normalize response shape: the mock handlers sometimes return an array
      // of candidates (as used by the board), while other endpoints may
      // return an object { candidates, total }. Normalize both into the
      // { candidates, total } shape expected by this component.
      if (Array.isArray(json)) {
        return { candidates: json, total: json.length };
      }

      return json;
    },
  });

  const candidates = candidatesData?.candidates || [];
  const totalPages = Math.ceil((candidatesData?.total || 0) / pageSize);

  // Filter candidates based on search
  const filteredCandidates = useMemo(() => {
    if (!search) return candidates;
    
    const searchLower = search.toLowerCase();
    return candidates.filter((candidate: Candidate) =>
      candidate.name.toLowerCase().includes(searchLower) ||
      candidate.email.toLowerCase().includes(searchLower)
    );
  }, [candidates, search]);

  const virtualizer = useVirtualizer({
    count: filteredCandidates.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
    overscan: 5,
  });

  const stageColors = {
    applied: 'bg-blue-100 text-blue-800',
    screen: 'bg-yellow-100 text-yellow-800',
    tech: 'bg-purple-100 text-purple-800',
    offer: 'bg-green-100 text-green-800',
    hired: 'bg-emerald-100 text-emerald-800',
    rejected: 'bg-red-100 text-red-800',
  };

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
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          Candidates ({filteredCandidates.length})
        </h2>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search candidates by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Virtualized List */}
      <div
        ref={parentRef}
        className="h-[600px] overflow-auto border rounded-lg"
        style={{
          contain: 'strict',
        }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const candidate = filteredCandidates[virtualItem.index];
            return (
              <div
                key={virtualItem.key}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <Card className="m-2 h-[92px]">
                  <CardContent className="p-4 h-full flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {candidate.name}
                        </h3>
                        <div className="flex items-center mt-1">
                          <Mail className="h-3 w-3 text-gray-400 mr-1" />
                          <p className="text-xs text-gray-500 truncate">
                            {candidate.email}
                          </p>
                        </div>
                        <div className="flex items-center mt-1">
                          <Calendar className="h-3 w-3 text-gray-400 mr-1" />
                          <p className="text-xs text-gray-500">
                            Applied {new Date(candidate.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <Badge
                        className={`${stageColors[candidate.stage as keyof typeof stageColors]} text-xs`}
                      >
                        {candidate.stage}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        className="mt-4"
      />
    </div>
  );
}
