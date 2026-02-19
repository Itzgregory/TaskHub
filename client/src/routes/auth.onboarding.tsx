import OnboardingPage from '../pages/onboarding/OnboardingPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/onboarding')({
  component: OnboardingPage,
})


