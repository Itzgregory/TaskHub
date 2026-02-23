import TeamProjects from '@/pages/dashboard/Org-dashboard/Project/TeamProjects'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/org/projects/')({
  component: TeamProjects,
})