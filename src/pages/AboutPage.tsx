const SECTION_CLASS = 'mt-8';

function SectionHeading({ children }: { children: string }) {
  return <h2 className="text-base font-semibold text-ink-primary">{children}</h2>;
}

export function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">About Crossings</p>
      <h1 className="mt-1 text-2xl font-semibold text-ink-primary">Methodology</h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
        Crossings is a citizen-science web app that turns crowdsourced sightings of wildlife road crossings and
        vehicle collisions into a live map of danger zones, then converts that data into ranked, exportable
        recommendations that local authorities can act on.
      </p>

      <section className={SECTION_CLASS}>
        <SectionHeading>The problem</SectionHeading>
        <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
          Wildlife-vehicle collisions kill an enormous number of animals every year and injure thousands of
          drivers, yet the data that could prevent them is scattered across police reports, individual driver
          memories, and the occasional roadkill survey — rarely in one place, rarely mapped, and rarely connected
          to a decision about where to put a warning sign or a crossing structure. Transportation agencies know
          fencing, signage, and crossing structures work; the harder problem is knowing exactly where to spend a
          limited budget. Crossings addresses the second problem: it aggregates scattered sightings into a shared
          map, uses that map to find statistically meaningful hotspots, and turns each hotspot into a plain-language
          recommendation a town, county, or state DOT can actually use.
        </p>
      </section>

      <section className={SECTION_CLASS}>
        <SectionHeading>How it works</SectionHeading>
        <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-ink-secondary">
          <li>
            <strong className="text-ink-primary">Report.</strong> Anyone can add a report by clicking a spot on the
            map or using their device&apos;s location, then choosing what happened (a crossing sighting or a
            confirmed collision), the animal category, and a severity level. Reports save to the browser&apos;s
            local storage and appear on the map immediately.
          </li>
          <li>
            <strong className="text-ink-primary">Map.</strong> Every report — the seeded demo dataset plus anything
            submitted locally — plots on an OpenStreetMap base layer as a colored, sized marker, or as a heatmap
            layer showing incident density.
          </li>
          <li>
            <strong className="text-ink-primary">Cluster.</strong> A grid-based density clustering pass (below)
            groups nearby reports into priority zones and ranks them by a composite score.
          </li>
          <li>
            <strong className="text-ink-primary">Explore.</strong> The Insights dashboard breaks the same filtered
            data down by time, category, and severity, and surfaces the top five zones by priority score.
          </li>
          <li>
            <strong className="text-ink-primary">Act.</strong> Any zone can generate a one-page action report:
            location, incident counts, dominant category, time-of-day pattern, and a plain-language mitigation
            recommendation — printable or downloadable as a text file.
          </li>
        </ol>
      </section>

      <section className={SECTION_CLASS}>
        <SectionHeading>Hotspot detection & scoring</SectionHeading>
        <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
          Hotspot detection is a grid-based density clustering pass — conceptually a simplified, grid-accelerated
          DBSCAN — run entirely in the browser:
        </p>
        <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-ink-secondary">
          <li>
            Every report is projected to local x/y meters and dropped into a 500m square grid cell. The cell size
            plays the role of DBSCAN&apos;s <code className="text-xs">eps</code> neighborhood radius.
          </li>
          <li>
            Adjacent occupied cells (8-connected) are flood-filled into connected components, so an elongated
            cluster following a road corridor merges into one zone instead of splintering into one blob per cell.
          </li>
          <li>
            A component becomes a zone only if it contains at least 4 reports — DBSCAN&apos;s{' '}
            <code className="text-xs">minPts</code>, applied to the whole zone rather than per point.
          </li>
        </ol>
        <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
          Each zone is then ranked by a composite priority score on a 0-1 scale:
        </p>
        <pre className="mt-2 overflow-x-auto rounded-md border border-line bg-surface-plane p-3 text-xs text-ink-primary">
          score = 0.45 × countNorm + 0.30 × severityNorm + 0.25 × recencyScore
        </pre>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ink-secondary">
          <li>
            <strong className="text-ink-primary">countNorm</strong> — the zone&apos;s incident count, min-max
            normalized against the busiest zone currently detected. This keeps the score meaningful as a relative
            priority ranking among the zones actually found, rather than an arbitrary absolute scale.
          </li>
          <li>
            <strong className="text-ink-primary">severityNorm</strong> — average severity divided by 3 (severity is
            recorded on a 1-3 scale: near-miss, injury, fatality/high-hazard).
          </li>
          <li>
            <strong className="text-ink-primary">recencyScore</strong> — exponential decay from the zone&apos;s most
            recent incident, halving every 180 days, so a burst of old activity matters less than incidents still
            happening.
          </li>
        </ul>
        <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
          The weights (45/30/25) favor incident volume first, severity second, recency third — deliberately, since a
          zone with many minor incidents still represents a real, recurring hazard worth signage even before anyone
          is seriously hurt. All of this runs client-side and recomputes live as filters change; nothing is
          hardcoded or precomputed.
        </p>
      </section>

      <section className={SECTION_CLASS}>
        <SectionHeading>Data sources & assumptions</SectionHeading>
        <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
          This demo ships with a programmatically generated sample dataset centered on Grand County, Colorado,
          along the CO-9 corridor between Kremmling and Green Mountain Reservoir — a real wildlife-vehicle collision
          corridor where Colorado Parks &amp; Wildlife and CDOT have built underpasses and fencing after tracking
          mule deer and elk migration collisions. The sample data is synthetic: it uses a seeded random generator to
          place reports around several plausible cluster centers plus background noise, so the map and hotspot
          detection have something realistic to find on first load. Timestamps are weighted toward dawn and dusk
          hours, mirroring real-world collision patterns (animal activity is highest and visibility lowest at
          twilight), and are treated as approximate Mountain Time.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
          In a real deployment, this sample data would be replaced or supplemented by actual crowdsourced reports,
          and could ingest existing DOT roadkill or collision datasets where available. There is no backend: reports
          you submit are stored only in your browser&apos;s local storage, so they persist across refreshes on your
          device but are not shared with other visitors or synced anywhere.
        </p>
      </section>

      <section className={SECTION_CLASS}>
        <SectionHeading>Limitations</SectionHeading>
        <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-relaxed text-ink-secondary">
          <li>Reports are crowdsourced and unverified — Crossings has no way to confirm a submission is accurate.</li>
          <li>
            The demo dataset is synthetic, not real collision records; the map illustrates what the tool does with
            real data rather than presenting it.
          </li>
          <li>
            Because reports live in browser local storage, they are private to one device and not aggregated across
            users — a production version would need a shared backend to deliver on the "crowdsourced" promise fully.
          </li>
          <li>
            The clustering and scoring method is intentionally simple and transparent rather than a fitted or
            trained model; it favors explainability over statistical sophistication.
          </li>
          <li>
            Recommendations are a starting point for a field survey, not a replacement for one — final mitigation
            decisions should involve a wildlife biologist and a traffic engineer.
          </li>
        </ul>
      </section>
    </div>
  );
}
