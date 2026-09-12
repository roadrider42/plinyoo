/**
 * Impressum für Plinyoo
 * Gesetzlich vorgeschriebene Angaben gemäß TMG § 5 und RStV § 55
 */

import { Link } from 'react-router-dom';

export default function Impressum() {
  return (
    <main className="bg-main-background text-main-text">
      <section className="max-w-4xl mx-auto px-6 md:px-12 py-16">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-primary mb-2">Impressum</h1>
          <p className="text-sm text-text-muted">Stand: {new Date().getFullYear()}</p>
        </div>

        <div className="mt-8 space-y-8">
          {/* Betreiber */}
          <div>
            <h2 className="text-2xl font-semibold text-primary mb-4">Betreiber der Website</h2>
            <div className="space-y-2 text-text-muted">
              <p>Plinyoo UG (haftungsbeschränkt) i.Gr.</p>
              <p>Theodor-Fliedner-Str. 1d</p>
              <p>34121 Kassel</p>
              <p>Deutschland</p>
            </div>
          </div>

          {/* Geschäftsführer */}
          <div>
            <h2 className="text-xl font-semibold text-primary mb-4">Geschäftsführer</h2>
            <div className="space-y-1 text-text-muted">
              <p>Heiko Miertzsch</p>
            </div>
          </div>

          {/* Kontakt */}
          <div>
            <h2 className="text-xl font-semibold text-primary mb-4">Kontakt</h2>
            <div className="space-y-2 text-text-muted">
              <p>
                <span className="font-medium">E-Mail:</span>{' '}
                <a href="mailto:heiko@plinyoo.com" className="text-primary hover:underline">
                  heiko@plinyoo.com
                </a>
              </p>
              <p>
                <span className="font-medium">Website:</span>{' '}
                <a href="https://www.plinyoo.com" className="text-primary hover:underline">
                  https://www.plinyoo.com
                </a>
              </p>
            </div>
          </div>

          {/* Registereintrag */}
          <div>
            <h2 className="text-xl font-semibold text-primary mb-4">Registereintrag</h2>
            <div className="space-y-1 text-text-muted">
              <p><span className="font-medium">Amtsgericht:</span> Amtsgericht Kassel</p>
              <p className="text-sm text-text-faint italic">
                HRB-Nummer und USt-IdNr. werden nach Eintragung ergänzt
              </p>
            </div>
          </div>

          {/* Haftung für Inhalte */}
          <div>
            <h2 className="text-xl font-semibold text-primary mb-4">Haftung für Inhalte</h2>
            <p className="text-text-muted leading-relaxed">
              Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität
              der Inhalte können wir jedoch keine Gewähr übernehmen. Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene
              Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 des TMG sind wir als
              Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder
              nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
            </p>
          </div>

          {/* Haftung für Links */}
          <div>
            <h2 className="text-xl font-semibold text-primary mb-4">Haftung für Links</h2>
            <p className="text-text-muted leading-relaxed">
              Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können
              wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der
              jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung
              auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar.
            </p>
          </div>

          {/* Urheberrecht */}
          <div>
            <h2 className="text-xl font-semibold text-primary mb-4">Urheberrecht</h2>
            <p className="text-text-muted leading-relaxed">
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht.
              Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes
              bedürfen der schriftlichen Zustimmung des Autors oder Urhebers. Downloads und Kopien dieser Seite sind nur für den
              privaten, nicht kommerziellen Gebrauch gestattet.
            </p>
          </div>

          {/* Datenschutz */}
          <div>
            <h2 className="text-xl font-semibold text-primary mb-4">Datenschutz</h2>
            <p className="text-text-muted leading-relaxed">
              Die Nutzung unserer Website ist in der Regel ohne Angabe personenbezogener Daten möglich. Soweit auf unseren Seiten
              personenbezogene Daten erhoben werden, erfolgt dies, soweit möglich, stets auf freiwilliger Basis. Diese Daten werden
              ohne Ihre ausdrückliche Zustimmung nicht an Dritte weitergegeben.
            </p>
            <p className="text-text-muted leading-relaxed mt-4">
              Weitere Informationen zum Datenschutz finden Sie in unserer{' '}
              <Link to="/datenschutz" className="text-primary hover:underline font-medium">
                Datenschutzerklärung
              </Link>
              .
            </p>
          </div>

          {/* Navigation */}
          <div className="pt-8 border-t border-border">
            <div className="flex flex-wrap gap-4">
              <Link
                to="/"
                className="inline-block rounded-lg bg-primary text-white px-6 py-3 font-semibold hover:bg-primary/90 transition"
              >
                Zur Startseite
              </Link>
              <Link
                to="/datenschutz"
                className="inline-block rounded-lg border border-primary text-primary px-6 py-3 font-semibold hover:bg-primary hover:text-white transition"
              >
                Datenschutzerklärung
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
