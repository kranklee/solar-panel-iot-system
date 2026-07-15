// Impressum page mandated by Paragraph 5 of the German Telemediengesetz for any German facing site
// Editable placeholders for postal address and supervisory authority since those vary per person
import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';

export const metadata = {
  title: 'Impressum',
  description: 'Angaben gemaess Paragraph 5 TMG'
};

export default function ImpressumPage({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);

  return (
    <article className="prose prose-invert max-w-3xl space-y-6 text-sm text-foreground/85 dark:text-bg/85">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Paragraph 5 TMG
        </p>
        <h1 className="text-4xl font-semibold">Impressum</h1>
        <p className="text-foreground/60 dark:text-bg/60">
          Angaben gemaess Paragraph 5 TMG und Paragraph 18 Absatz 2 MStV. Bitte vor
          Veroeffentlichung die Platzhalter durch die Postanschrift ersetzen.
        </p>
      </header>

      <section className="rounded-card border bg-card p-6 dark:bg-card-dark">
        <h2 className="text-lg font-semibold">Diensteanbieter</h2>
        <p className="mt-2">
          Cem Besli
          <br />
          [Strasse und Hausnummer]
          <br />
          [Postleitzahl Ort]
          <br />
          Deutschland
        </p>
      </section>

      <section className="rounded-card border bg-card p-6 dark:bg-card-dark">
        <h2 className="text-lg font-semibold">Kontakt</h2>
        <p className="mt-2">
          E Mail: <a href="mailto:cem@cembesli.com" className="text-primary">cem@cembesli.com</a>
          <br />
          Website: <Link href="/" className="text-primary">https://cembesli.com</Link>
        </p>
      </section>

      <section className="rounded-card border bg-card p-6 dark:bg-card-dark">
        <h2 className="text-lg font-semibold">
          Verantwortlich fuer den Inhalt nach Paragraph 18 Absatz 2 MStV
        </h2>
        <p className="mt-2">Cem Besli, Anschrift wie oben.</p>
      </section>

      <section className="rounded-card border bg-card p-6 dark:bg-card-dark">
        <h2 className="text-lg font-semibold">EU Streitschlichtung</h2>
        <p className="mt-2">
          Die Europaeische Kommission stellt eine Plattform zur Online Streitbeilegung bereit,
          erreichbar unter{' '}
          <a
            href="https://ec.europa.eu/consumers/odr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary"
          >
            https://ec.europa.eu/consumers/odr
          </a>
          . Unsere E Mail Adresse finden Sie oben im Impressum. Wir sind nicht bereit oder
          verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
          teilzunehmen.
        </p>
      </section>

      <section className="rounded-card border bg-card p-6 dark:bg-card-dark">
        <h2 className="text-lg font-semibold">Haftung fuer Inhalte</h2>
        <p className="mt-2">
          Als Diensteanbieter sind wir gemaess Paragraph 7 Absatz 1 TMG fuer eigene Inhalte auf
          diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach Paragraphen 8 bis 10
          TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, uebermittelte oder
          gespeicherte fremde Informationen zu ueberwachen oder nach Umstaenden zu forschen, die
          auf eine rechtswidrige Taetigkeit hinweisen.
        </p>
        <p className="mt-2">
          Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den
          allgemeinen Gesetzen bleiben hiervon unberuehrt. Eine diesbezuegliche Haftung ist
          jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung moeglich.
          Bei Bekanntwerden entsprechender Rechtsverletzungen werden wir diese Inhalte
          umgehend entfernen.
        </p>
      </section>

      <section className="rounded-card border bg-card p-6 dark:bg-card-dark">
        <h2 className="text-lg font-semibold">Haftung fuer Links</h2>
        <p className="mt-2">
          Unser Angebot enthaelt Links zu externen Websites Dritter, auf deren Inhalte wir
          keinen Einfluss haben. Deshalb koennen wir fuer diese fremden Inhalte auch keine
          Gewaehr uebernehmen. Fuer die Inhalte der verlinkten Seiten ist stets der jeweilige
          Anbieter oder Betreiber der Seiten verantwortlich.
        </p>
      </section>

      <section className="rounded-card border bg-card p-6 dark:bg-card-dark">
        <h2 className="text-lg font-semibold">Urheberrecht</h2>
        <p className="mt-2">
          Die durch den Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten
          unterliegen dem deutschen Urheberrecht. Die Vervielfaeltigung, Bearbeitung,
          Verbreitung und jede Art der Verwertung ausserhalb der Grenzen des Urheberrechtes
          beduerfen der schriftlichen Zustimmung des jeweiligen Autors.
        </p>
      </section>

      <p className="text-xs text-foreground/50 dark:text-bg/50">
        Quelle des Mustertexts: angelehnt an die haeufig genutzten Vorlagen von eRecht24 und
        anderen oeffentlichen Mustern. Vor dem produktiven Einsatz von einer Rechtsanwaeltin
        oder einem Rechtsanwalt pruefen lassen.
      </p>
    </article>
  );
}
