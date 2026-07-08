import { ButtonLink } from '../components/ui';
import { ScoreGauge } from '../components/ScoreGauge';

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-[600px] flex-col items-center px-5 py-28 text-center">
      <ScoreGauge value={4} size={96} caption="found" />
      <h1 className="mt-8 text-[clamp(1.8rem,4vw,2.4rem)] font-extrabold text-heading">
        We couldn’t find that page.
      </h1>
      <p className="mt-3 text-body text-muted">
        The link may be broken, or the page may have moved.
      </p>
      <div className="mt-8 flex gap-3">
        <ButtonLink to="/">Back home</ButtonLink>
        <ButtonLink to="/match" variant="secondary">
          Find a therapist
        </ButtonLink>
      </div>
    </section>
  );
}
