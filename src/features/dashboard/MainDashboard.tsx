// ...existing code...
import { TopBar } from './TopBar';
import { JobsWidget } from './widgets/JobsWidget';
import { SummaryCards } from './widgets/SummaryCards';
import { CandidatesWidget } from './widgets/CandidatesWidget';
import { AssessmentsWidget } from './widgets/AssessmentsWidget';
import { ActivityTimeline } from './widgets/ActivityTimeline';
import { DemographicsWidget } from './widgets/DemographicsWidget';
import { CalendarWidget } from './widgets/CalendarWidget';

export function MainDashboard() {
  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {/* <SideNav /> */}
      <div className="flex-1 flex flex-col">
        <TopBar />
        <main className="p-6">
          <SummaryCards />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <JobsWidget />
            <CandidatesWidget />
            <AssessmentsWidget />
            <ActivityTimeline />
            <DemographicsWidget />
            <CalendarWidget />
          </div>
        </main>
      </div>
    </div>
  );
}
