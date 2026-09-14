# UI redesign critique

## What was wrong

The first implementation framed live operations as a generic SaaS dashboard. Decorative KPI cards competed with the match, information density was inconsistent, and some database-backed screens exposed browser-default link and form styling. On Event Control, the timeline and statistics editor also broke down at narrower widths and made routine operator work harder to scan.

## Current direction

The Control Room now uses a restrained broadcast-operations visual system: a near-black application frame, thin neutral borders, compact navigation, warm off-white data-entry surfaces, and a single coral live-state accent. Typography uses one sans family with monospace reserved for clocks, scores, dates, and operational values.

The reference is treated as a systems direction rather than a template. No fake signal-health percentages, synthetic reviews, decorative charts, artificial status metrics, or placeholder product claims were added. Counts on the overview come from the current database state. Buttons remain rectangular with modest corner radii, and there are no decorative gradients, scroll animations, custom cursor effects, emoji icons, or AI-labelled content.

The shell is organized as a contained operations frame with a fixed navigation rail and a quiet utility header. The overview prioritizes current matches, real incident/commentary counts, the upcoming schedule, and the operator attention queue. A light summary surface is used only where contrast improves scanning, not as a decorative KPI pattern.

## Event Control

The match remains the primary object. The scoreboard, state controls, clock, chronological feed, incident entry, commentary publishing, and match statistics are separated by task rather than by decorative cards.

The timeline uses fixed time and event columns so long labels cannot collapse into the timestamp area. Incident types use small semantic markers instead of icons. Fast-entry actions use edge markers and plain labels. Match statistics use a warm light data-entry panel with explicit home and away columns, validation, and a dedicated save footer.

## Live Center

Live Center remains a separate public surface because the audience task is different from the operator task. It now shares the same dark material system, typography, and live-state accent without inheriting Control Room navigation. Public pages use functional headings such as Live Center, Upcoming, Latest finals, and Statistics instead of campaign-style hero copy.

## Implementation constraints

The redesign stays dependency-light and uses the existing Next.js and React components plus global CSS. The favicon and social preview are typographic product assets, not AI-generated imagery. Contrast checks, source-size budgets, responsive behavior, and keyboard focus states remain part of the web-quality checks.
