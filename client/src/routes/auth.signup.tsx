import SignupPage from '../pages/auth/SignUp'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/signup')({
  component: SignupPage,
})


