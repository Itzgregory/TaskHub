import TeamActivity from '@/pages/dashboard/Org-dashboard/Activity/TeamsActivity'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/org/activity/')({
  component: TeamActivity,
})

