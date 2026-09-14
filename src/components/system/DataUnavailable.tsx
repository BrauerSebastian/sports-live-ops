export function DataUnavailable({ title = "Operations data unavailable" }: { title?: string }) {
  return <main className="system-state-page"><span className="overline">System state</span><h1>{title}</h1><p>Connect PostgreSQL and run the migration and seed commands before opening this route.</p><code>npm run db:migrate<br />npm run db:seed</code></main>;
}
