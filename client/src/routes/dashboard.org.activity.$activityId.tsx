import ActivityDetail from '@/pages/dashboard/Org-dashboard/Activity/ActivityDetail'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/org/activity/$activityId')({
  component: ActivityDetail,
})


