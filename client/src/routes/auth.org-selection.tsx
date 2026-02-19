import OrganisationSelectionPage from '@/pages/org-selection/OrganisationSelectionPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/org-selection')({
  component: OrganisationSelectionPage,
})

