export function TermsNotice() {
  return (
    <p className="text-center text-xs" style={{ color: "var(--c-texTer)" }}>
      By continuing you agree to our{" "}
      <span className="underline cursor-pointer hover:text-[var(--c-texSec)] transition-colors">
        Terms
      </span>{" "}
      and{" "}
      <span className="underline cursor-pointer hover:text-[var(--c-texSec)] transition-colors">
        Privacy Policy
      </span>
      .
    </p>
  );
}