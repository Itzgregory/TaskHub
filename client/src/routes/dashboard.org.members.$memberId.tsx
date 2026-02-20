import MemberDetail from '@/pages/dashboard/Org-dashboard/Member/MemberDetail'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/org/members/$memberId')({
  component: MemberDetail,
})

