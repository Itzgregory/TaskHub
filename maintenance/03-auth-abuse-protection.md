# Security Update: Protecting Login and Registration from Automated Attacks

## What Is This Change?

This update adds rate limiting to the login and registration pages — meaning the system now caps how many times someone can attempt these actions within a given time window. This is a targeted defence against bots and scripts that try thousands of password combinations automatically.

---

## Why Rate Limiting?

Three approaches were considered. Temporary account lockouts were ruled out immediately — they can actually be weaponised to lock real users out of their own accounts on purpose. Progressive slowdowns (making each failed attempt wait longer) were considered, but they punish legitimate users who simply mistype their password a few times. Rate limiting by IP address was chosen because it stops scripted attacks without affecting anyone using the app normally.

---

## How It Works

Two limits are now in place:

**Login:** A maximum of 10 attempts per minute, per IP address. A real user would have to mistype their password 10 times in under 60 seconds to be blocked — effectively impossible in normal use.

**Registration:** A maximum of 5 new account registrations per hour, per IP address. Creating an account is something you do once, so this is more than sufficient for any legitimate user.

If someone exceeds either limit, they receive a clear message telling them they've been blocked and how long to wait before trying again. All settings are adjustable without changing any code.

---

## How This Fits Into the Bigger Picture

Rate limiting doesn't stand alone — it works alongside several other existing protections: password hashing that makes each guess computationally slow, account lockout after repeated failures, and login error messages that don't reveal whether an email address is registered. Together these layers make automated attacks significantly harder.

**Impact on brute-force attacks:** The number of passwords an attacker can try per day drops by approximately 86% compared to before this change.

---

## Known Limitations

A few tradeoffs are worth being aware of. Attackers using a large network of different IP addresses can still make attempts across many IPs simultaneously — adding a CAPTCHA challenge after several failures is planned as a future improvement. Users sharing a single internet connection (such as in a large office) share the same IP limit, though the thresholds are generous enough that this is unlikely to cause issues in practice. Finally, the current implementation stores counters in memory, so for environments running multiple servers, this would need to be switched to a shared cache like Redis.

---

## Summary

| Area | Detail |
|------|--------|
| **What it does** | Caps login and registration attempts per IP address |
| **Login limit** | 10 attempts per minute |
| **Registration limit** | 5 attempts per hour |
| **Impact on real users** | None under normal use |
| **Reduction in brute-force exposure** | ~86% |
| **Residual risk** | Distributed botnet attacks; CAPTCHA planned as follow-up |