import TeamMembers from '@/pages/dashboard/Org-dashboard/Member/TeamMembers'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/org/members/')({
  component: TeamMembers,
})


