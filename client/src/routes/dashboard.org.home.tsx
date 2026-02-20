import OrgDashboard from '@/pages/dashboard/Org-dashboard/OrgDashboard'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/org/home')({
  component: OrgDashboard,
})


