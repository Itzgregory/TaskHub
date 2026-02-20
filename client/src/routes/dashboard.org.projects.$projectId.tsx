import ProjectDetail from '@/pages/dashboard/Org-dashboard/Project/ProjectDetail'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/org/projects/$projectId')({
  component: ProjectDetail,
})


