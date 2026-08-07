import DashboardLayout from '@/app/(core)/dashboard/layout';
import DashboardOverview from '@/app/(core)/dashboard/page';

export default function App() {
  return (
    <DashboardLayout>
      <DashboardOverview />
    </DashboardLayout>
  );
}
