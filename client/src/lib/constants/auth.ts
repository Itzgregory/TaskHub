export const FEATURE_CHIPS = ["Tasks", "Projects", "Deadlines", "Reminders"];

export const QUOTE = {
  text: "The secret of getting ahead is getting started.",
  author: "Mark Twain",
};


export const SIGNUP_FEATURES = [
  { emoji: "✅", label: "Organise tasks across projects" },
  { emoji: "📅", label: "Due dates & reminders" },
  { emoji: "🔍", label: "Instant search across everything" },
  { emoji: "🌙", label: "Light & dark mode" },
];

export const PASSWORD_REQUIREMENTS = [
  { label: "At least 8 characters", test: (v: string) => v.length >= 8 },
  { label: "One uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
  { label: "One number", test: (v: string) => /\d/.test(v) },
];