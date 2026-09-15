import Link from "next/link";
import { ChevronDownIcon, ChevronRightIcon, ExternalLinkIcon, FootballIcon, MapPinIcon, SoccerBallIcon } from "@/components/ui/icons";

export type DashboardTeam = {
  name: string;
  shortName: string;
  code: string;
  crest: string;
};

export type DashboardMatch = {
  id: string;
  minuteLabel: string;
  competition: string;
  stage: string;
  home: DashboardTeam;
  away: DashboardTeam;
  score: { home: number; away: number };
  phase: string;
  latestIncident?: {
    minute: string;
    team: string;
    detail: string;
  };
  venue: string;
  href: string;
};

export type DashboardStatistic = {
  label: string;
  home: number;
  away: number;
  suffix?: string;
};

export type DashboardOperation = {
  time: string;
  label: string;
  context: string;
  actor: string;
  tone: "green" | "yellow" | "blue";
};

export type DashboardFixture = {
  id: string;
  date: string;
  time: string;
  home: DashboardTeam;
  away: DashboardTeam;
  venue: string;
  href: string;
};

export type ControlCenterOverviewProps = {
  league: string;
  season: string;
  featuredMatch: DashboardMatch;
  liveMatches: DashboardMatch[];
  upcomingMatches: DashboardFixture[];
  finishedCount: number;
  publishedNewsCount: number;
  statistics: DashboardStatistic[];
  operations: DashboardOperation[];
};

export function ControlCenterOverview({
  league,
  season,
  featuredMatch,
  liveMatches,
  upcomingMatches,
  finishedCount,
  publishedNewsCount,
  statistics,
  operations,
}: ControlCenterOverviewProps) {
  return (
    <main className="cc-dashboard-page">
      <PageHeader league={league} season={season} featuredMatch={featuredMatch} />

      <section className="cc-hero-grid">
        <FeaturedMatchCard match={featuredMatch} />
        <MatchStatsCard statistics={statistics} />
        <CompetitionSnapshotCard
          league={league}
          season={season}
          upcoming={upcomingMatches.length}
          finished={finishedCount}
          publishedNews={publishedNewsCount}
        />
      </section>

      <section className="cc-dashboard-lower">
        <div className="cc-dashboard-main-column">
          <DashboardTabs liveCount={liveMatches.length} upcomingCount={upcomingMatches.length} />
          <LiveMatchesCard matches={liveMatches} />
          <UpcomingMatches fixtures={upcomingMatches} />
        </div>

        <aside className="cc-dashboard-side-column">
          <RecentOperations operations={operations} />
          <PromoCard />
        </aside>
      </section>
    </main>
  );
}

function PageHeader({ league, season, featuredMatch }: { league: string; season: string; featuredMatch: DashboardMatch }) {
  return (
    <header className="cc-page-hero">
      <div className="cc-page-copy">
        <p className="cc-eyebrow">{league}</p>
        <h1>Live Center</h1>
        <p className="cc-page-subtitle">Real-time fixtures, scores, results and published match updates.</p>
      </div>

      <div className="cc-page-hero-art" aria-hidden="true">
        <div className="cc-stadium-art" />
        <div className="cc-hero-stackword">
          <span>Football</span>
          <span>Lives</span>
          <span>Here</span>
        </div>
      </div>

      <div className="cc-hero-actions">
        <button type="button" className="cc-select-button">
          <span>{season}</span>
          <ChevronDownIcon size={16} />
        </button>
        <Link className="cc-primary-button" href={featuredMatch.href}>
          <span>Open live match</span>
          <ExternalLinkIcon size={15} />
        </Link>
      </div>
    </header>
  );
}

function FeaturedMatchCard({ match }: { match: DashboardMatch }) {
  return (
    <section className="cc-card cc-featured-match">
      <div className="cc-featured-top">
        <div className="cc-featured-pills">
          <span className="cc-live-pill"><span className="cc-live-pill-dot" aria-hidden="true" />LIVE</span>
          <span className="cc-minute-pill">{match.minuteLabel}</span>
        </div>
        <div className="cc-featured-meta">
          <strong>{match.competition}</strong>
          <span>{match.stage}</span>
        </div>
      </div>

      <div className="cc-featured-scoreboard">
        <div className="cc-team-block">
          <TeamCrest team={match.home} size="lg" />
          <strong>{match.home.name}</strong>
        </div>
        <div className="cc-score-block">
          <strong>{match.score.home} - {match.score.away}</strong>
          <span>{match.phase}</span>
        </div>
        <div className="cc-team-block">
          <TeamCrest team={match.away} size="lg" />
          <strong>{match.away.name}</strong>
        </div>
      </div>

      <div className="cc-featured-incident">
        <span className="cc-incident-minute">{match.latestIncident?.minute ?? "--"}</span>
        <span className="cc-incident-ball"><FootballIcon size={14} /></span>
        <div className="cc-incident-copy">
          <strong>{match.latestIncident?.team ?? "No incidents yet"}</strong>
          <small>{match.latestIncident?.detail ?? "No published incident."}</small>
        </div>
      </div>
    </section>
  );
}

function MatchStatsCard({ statistics }: { statistics: DashboardStatistic[] }) {
  return (
    <section className="cc-card cc-stats-card">
      <div className="cc-card-header">
        <h2>Match stats</h2>
        <span className="cc-live-inline"><span className="cc-inline-dot" aria-hidden="true" />Live</span>
      </div>

      <div className="cc-stats-list">
        {statistics.map((stat) => {
          const maxValue = Math.max(stat.home, stat.away, 1);
          const left = (stat.home / maxValue) * 100;
          const right = (stat.away / maxValue) * 100;

          return (
            <div className="cc-stat-row" key={stat.label}>
              <div className="cc-stat-values">
                <strong>{stat.home}{stat.suffix ?? ""}</strong>
                <span>{stat.label}</span>
                <strong>{stat.away}{stat.suffix ?? ""}</strong>
              </div>
              <div className="cc-comparison-bar" aria-hidden="true">
                <span className="cc-comparison-half cc-comparison-home">
                  <i className="cc-bar-home" style={{ width: `${left}%` }} />
                </span>
                <span className="cc-comparison-center" />
                <span className="cc-comparison-half cc-comparison-away">
                  <i className="cc-bar-away" style={{ width: `${right}%` }} />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function CompetitionSnapshotCard({ league, season, upcoming, finished, publishedNews }: { league: string; season: string; upcoming: number; finished: number; publishedNews: number }) {
  const rows = [
    { label: "Upcoming", value: upcoming },
    { label: "Finished", value: finished },
    { label: "Published news", value: publishedNews },
  ];

  return (
    <section className="cc-card cc-snapshot-card">
      <div className="cc-card-header cc-card-header-space">
        <h2>Competition snapshot</h2>
        <ChevronRightIcon size={16} />
      </div>

      <div className="cc-snapshot-brand">
        <span className="cc-league-mark"><SoccerBallIcon size={28} /></span>
        <div>
          <strong>{league}</strong>
          <small>{season}</small>
        </div>
      </div>

      <div className="cc-snapshot-list">
        {rows.map((row) => (
          <div className="cc-snapshot-row" key={row.label}>
            <span>{row.label}</span>
            <strong>{row.value}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function DashboardTabs({ liveCount, upcomingCount }: { liveCount: number; upcomingCount: number }) {
  return (
    <div className="cc-dashboard-tabs" role="tablist" aria-label="Dashboard sections">
      <button type="button" className="is-active" role="tab" aria-selected="true">
        <span>Live now</span>
        <small>{liveCount}</small>
      </button>
      <button type="button" role="tab" aria-selected="false">
        <span>Upcoming</span>
        <small>{upcomingCount}</small>
      </button>
      <button type="button" role="tab" aria-selected="false">
        <span>Finished</span>
      </button>
    </div>
  );
}

function LiveMatchesCard({ matches }: { matches: DashboardMatch[] }) {
  return (
    <section className="cc-card cc-list-card">
      <div className="cc-card-header">
        <h2>Live matches</h2>
      </div>
      <div className="cc-live-list">
        {matches.map((match) => (
          <Link className="cc-live-row" href={match.href} key={match.id}>
            <span className="cc-live-minute-pill">{match.minuteLabel}</span>
            <TeamCrest team={match.home} size="sm" />
            <strong className="cc-live-team">{match.home.name}</strong>
            <span className="cc-live-row-score">{match.score.home} - {match.score.away}</span>
            <TeamCrest team={match.away} size="sm" />
            <strong className="cc-live-team">{match.away.name}</strong>
            <span className="cc-live-venue"><MapPinIcon size={13} />{match.venue}</span>
            <span className="cc-row-button">View <ChevronRightIcon size={15} /></span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function UpcomingMatches({ fixtures }: { fixtures: DashboardFixture[] }) {
  return (
    <section className="cc-card cc-table-card">
      <div className="cc-card-header cc-card-header-link">
        <h2>Upcoming matches</h2>
        <Link href="/control/events">View all <ChevronRightIcon size={15} /></Link>
      </div>

      <div className="cc-fixture-head" role="row">
        <span>Date</span>
        <span>Time</span>
        <span>Match</span>
        <span>Venue</span>
        <span>Actions</span>
      </div>

      <div className="cc-fixture-body">
        {fixtures.map((fixture) => (
          <div className="cc-fixture-row" key={fixture.id}>
            <span>{fixture.date}</span>
            <span>{fixture.time}</span>
            <div className="cc-fixture-match">
              <span className="cc-fixture-team cc-fixture-team-home">
                <strong>{fixture.home.name}</strong>
                <TeamCrest team={fixture.home} size="xs" />
              </span>
              <span className="cc-fixture-vs">vs</span>
              <span className="cc-fixture-team cc-fixture-team-away">
                <TeamCrest team={fixture.away} size="xs" />
                <strong>{fixture.away.name}</strong>
              </span>
            </div>
            <span>{fixture.venue}</span>
            <Link className="cc-row-button cc-row-button-open" href={fixture.href}>Open <ChevronRightIcon size={15} /></Link>
          </div>
        ))}
      </div>
    </section>
  );
}

function RecentOperations({ operations }: { operations: DashboardOperation[] }) {
  return (
    <section className="cc-card cc-operations-card">
      <div className="cc-card-header cc-card-header-link">
        <h2>Recent operations</h2>
        <Link href="/control/audit">View all <ChevronRightIcon size={15} /></Link>
      </div>

      <div className="cc-operations-list">
        {operations.map((operation, index) => (
          <div className="cc-operation-row" key={`${operation.time}-${operation.label}-${index}`}>
            <span className={`cc-operation-dot ${operation.tone}`} aria-hidden="true" />
            <strong className="cc-operation-time">{operation.time}</strong>
            <div className="cc-operation-copy">
              <strong>{operation.label}</strong>
              <small>{operation.context}</small>
            </div>
            <span className="cc-operation-actor">{operation.actor}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function PromoCard() {
  return (
    <section className="cc-card cc-promo-card">
      <div className="cc-promo-art" aria-hidden="true" />
      <div className="cc-promo-overlay">
        <p className="cc-eyebrow">North American League</p>
        <h2>Matchday coverage in real time.</h2>
        <p>Keep fans informed. Everywhere.</p>
        <Link className="cc-secondary-button" href="/control/events">View all matches <ChevronRightIcon size={15} /></Link>
      </div>
    </section>
  );
}

function TeamCrest({ team, size }: { team: DashboardTeam; size: "xs" | "sm" | "lg" }) {
  return (
    <span className={`cc-team-crest ${size} ${team.crest}`} aria-hidden="true">
      <svg viewBox="0 0 32 36" fill="none">
        <path className="crest-body" d="M16 2 28 7v11.6c0 6.3-4.4 10.7-12 15.4-7.6-4.7-12-9.1-12-15.4V7L16 2Z" />
        <path className="crest-detail" d="M16 7.5 21.5 10v6.8c0 3.7-1.8 6-5.5 8.6-3.7-2.6-5.5-4.9-5.5-8.6V10L16 7.5Z" />
        <path className="crest-line" d="M10 13.5h12" />
        <path className="crest-line" d="M16 7.5v18" />
      </svg>
    </span>
  );
}
