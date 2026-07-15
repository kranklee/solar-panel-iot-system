// Datenschutzerklaerung covering DSGVO obligations for German facing portfolio websites
// Documents server logs, contact channels, third country transfers, and visitor rights
import { setRequestLocale } from 'next-intl/server';

export const metadata = {
  title: 'Datenschutzerklaerung',
  description: 'Informationen zur Datenverarbeitung gemaess DSGVO'
};

export default function DatenschutzPage({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);

  return (
    <article className="max-w-3xl space-y-6 text-sm text-foreground/85 dark:text-bg/85">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">DSGVO</p>
        <h1 className="text-4xl font-semibold">Datenschutzerklaerung</h1>
        <p className="text-foreground/60 dark:text-bg/60">
          Diese Erklaerung informiert ueber Art, Umfang und Zweck der Verarbeitung
          personenbezogener Daten auf cembesli.com.
        </p>
      </header>

      <section className="rounded-card border bg-card p-6 dark:bg-card-dark">
        <h2 className="text-lg font-semibold">1. Verantwortlicher</h2>
        <p className="mt-2">
          Cem Besli
          <br />
          [Postanschrift wie im Impressum]
          <br />
          E Mail:{' '}
          <a href="mailto:cem@cembesli.com" className="text-primary">
            cem@cembesli.com
          </a>
        </p>
      </section>

      <section className="rounded-card border bg-card p-6 dark:bg-card-dark">
        <h2 className="text-lg font-semibold">2. Hosting und Server Log Daten</h2>
        <p className="mt-2">
          Die Website wird bei Vercel Inc., 340 S Lemon Ave 4133, Walnut CA 91789, USA gehostet.
          Beim Aufruf der Seite werden technische Zugriffsdaten verarbeitet, darunter anonymisierte
          IP Adresse, Datum und Uhrzeit, angefragte URL, Statuscode, uebertragene Datenmenge,
          Referrer und User Agent. Rechtsgrundlage ist Artikel 6 Absatz 1 Buchstabe f DSGVO. Das
          berechtigte Interesse besteht in der sicheren und stabilen Bereitstellung der Website.
        </p>
      </section>

      <section className="rounded-card border bg-card p-6 dark:bg-card-dark">
        <h2 className="text-lg font-semibold">3. Kontaktaufnahme per E Mail</h2>
        <p className="mt-2">
          Wenn Sie uns eine E Mail senden, werden Ihre Angaben zur Bearbeitung der Anfrage und
          fuer den Fall von Anschlussfragen gespeichert. Rechtsgrundlage ist Artikel 6 Absatz 1
          Buchstabe b oder Buchstabe f DSGVO. Die Daten werden geloescht, sobald sie nicht mehr
          erforderlich sind oder gesetzliche Aufbewahrungspflichten enden.
        </p>
      </section>

      <section className="rounded-card border bg-card p-6 dark:bg-card-dark">
        <h2 className="text-lg font-semibold">4. Spiele Bestenliste und Realtime Daten</h2>
        <p className="mt-2">
          Wenn Sie freiwillig einen Spielscore mit einem selbst gewaehlten Namen einreichen,
          werden dieser Name, die Spielart, der Score und der Zeitstempel ueber Supabase
          gespeichert. Anbieter ist Supabase Inc., 970 Toa Payoh North 07 04, Singapur sowie die
          jeweils regionalen Vertretungen. Rechtsgrundlage ist Artikel 6 Absatz 1 Buchstabe a
          DSGVO. Sie koennen die Loeschung Ihres Eintrags jederzeit per E Mail verlangen.
        </p>
      </section>

      <section className="rounded-card border bg-card p-6 dark:bg-card-dark">
        <h2 className="text-lg font-semibold">5. KI Assistent</h2>
        <p className="mt-2">
          Beim freiwilligen Nutzen des KI Assistenten werden Ihre Nachrichten an Anthropic PBC,
          548 Market Street PMB 90375, San Francisco CA 94104, USA uebertragen, um die Antworten
          zu generieren. Nachrichten werden nicht dauerhaft auf cembesli.com gespeichert.
          Rechtsgrundlage ist Artikel 6 Absatz 1 Buchstabe a DSGVO. Die Uebermittlung in die USA
          erfolgt auf Basis der EU US Datenschutzrahmenvereinbarung und Standardvertragsklauseln.
        </p>
      </section>

      <section className="rounded-card border bg-card p-6 dark:bg-card-dark">
        <h2 className="text-lg font-semibold">6. Reichweitenmessung</h2>
        <p className="mt-2">
          Die Seite nutzt Vercel Web Analytics und Vercel Speed Insights. Beide Dienste sind
          cookielos und verarbeiten anonymisierte technische Daten ohne Personenbezug.
          Rechtsgrundlage ist Artikel 6 Absatz 1 Buchstabe f DSGVO. Berechtigtes Interesse ist
          das Verstaendnis der Nutzung zur Verbesserung der Seite.
        </p>
      </section>

      <section className="rounded-card border bg-card p-6 dark:bg-card-dark">
        <h2 className="text-lg font-semibold">7. Lokaler Speicher im Browser</h2>
        <p className="mt-2">
          Im localStorage Ihres Browsers werden ausschliesslich Praeferenzen wie Thema,
          erreichte Achievements und persoenliche Bestwerte gespeichert. Diese Daten verbleiben
          auf Ihrem Geraet und werden nicht an den Server uebermittelt.
        </p>
      </section>

      <section className="rounded-card border bg-card p-6 dark:bg-card-dark">
        <h2 className="text-lg font-semibold">8. Drittlandtransfer</h2>
        <p className="mt-2">
          Bei Diensten mit Sitz in den USA erfolgt die Datenuebermittlung auf Basis von
          Standardvertragsklauseln und der EU US Datenschutzrahmenvereinbarung. Eine Liste der
          eingesetzten Dienste finden Sie in den jeweiligen Abschnitten oben.
        </p>
      </section>

      <section className="rounded-card border bg-card p-6 dark:bg-card-dark">
        <h2 className="text-lg font-semibold">9. Ihre Rechte</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Auskunft nach Artikel 15 DSGVO</li>
          <li>Berichtigung nach Artikel 16 DSGVO</li>
          <li>Loeschung nach Artikel 17 DSGVO</li>
          <li>Einschraenkung der Verarbeitung nach Artikel 18 DSGVO</li>
          <li>Datenuebertragbarkeit nach Artikel 20 DSGVO</li>
          <li>Widerspruch nach Artikel 21 DSGVO</li>
          <li>Beschwerderecht bei einer Aufsichtsbehoerde nach Artikel 77 DSGVO</li>
        </ul>
        <p className="mt-3">
          Zustaendige Aufsichtsbehoerde ist die Landesdatenschutzbehoerde Ihres Wohnsitzes oder
          die Aufsichtsbehoerde am Sitz des Verantwortlichen.
        </p>
      </section>

      <section className="rounded-card border bg-card p-6 dark:bg-card-dark">
        <h2 className="text-lg font-semibold">10. SSL Verschluesselung</h2>
        <p className="mt-2">
          Diese Seite nutzt aus Gruenden der Sicherheit und zum Schutz der Uebertragung
          vertraulicher Inhalte eine SSL Verschluesselung. Eine verschluesselte Verbindung
          erkennen Sie am Praefix https in der Adresszeile.
        </p>
      </section>

      <p className="text-xs text-foreground/50 dark:text-bg/50">
        Stand der Erklaerung: {new Date().toISOString().slice(0, 10)}.
      </p>
    </article>
  );
}
