export default function AgbPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-14">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-8">
        <h1 className="text-3xl font-bold">Allgemeine Gesch&auml;ftsbedingungen (AGB)</h1>
        <p className="text-sm text-gray-500">Stand: {new Date().toLocaleDateString("de-AT", { month: "long", year: "numeric" })}</p>

        <section>
          <h2 className="text-lg font-semibold mb-2">1. Geltungsbereich</h2>
          <p className="text-gray-700 leading-relaxed">
            Diese Allgemeinen Gesch&auml;ftsbedingungen gelten f&uuml;r alle &uuml;ber die Plattform LernApp (lernapp.at) vermittelten Leistungen zwischen Sch&uuml;lerinnen und Sch&uuml;lern (im Folgenden &bdquo;Sch&uuml;ler&ldquo;) und Lehrpersonen (im Folgenden &bdquo;Lehrer&ldquo;) sowie zwischen Nutzern und der LernApp e.U. (im Folgenden &bdquo;Plattformbetreiber&ldquo;).
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">2. Leistungsbeschreibung</h2>
          <p className="text-gray-700 leading-relaxed">
            LernApp ist eine digitale Vermittlungsplattform, die Sch&uuml;lern erm&ouml;glicht, qualifizierte Nachhilfelehrer zu finden und Unterrichtstermine zu buchen. Der Plattformbetreiber ist kein Vertragspartner des eigentlichen Nachhilfeverh&auml;ltnisses, sondern lediglich Vermittler zwischen Sch&uuml;ler und Lehrer. Der Unterrichtsvertrag kommt direkt zwischen Sch&uuml;ler und Lehrer zustande.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">3. Registrierung und Nutzerkonto</h2>
          <p className="text-gray-700 leading-relaxed">
            Die Nutzung der Plattform setzt eine Registrierung voraus. Nutzer verpflichten sich, wahrheitsgem&auml;&szlig;e Angaben zu machen und ihre Zugangsdaten geheim zu halten. Ein Anspruch auf Registrierung besteht nicht. Der Plattformbetreiber beh&auml;lt sich das Recht vor, Konten ohne Angabe von Gr&uuml;nden zu sperren oder zu l&ouml;schen.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">4. Preise und Zahlung</h2>
          <p className="text-gray-700 leading-relaxed">
            Der Preis f&uuml;r Nachhilfestunden betr&auml;gt 33,00 &euro; pro Unterrichtsstunde (60 Minuten), anteilig berechnet. Alle Preise sind Endpreise inkl. gesetzlicher Umsatzsteuer. Die Zahlung erfolgt &uuml;ber den Zahlungsdienstleister Stripe. Mit der Buchung autorisiert der Sch&uuml;ler die Zahlung, die nach Best&auml;tigung durch den Lehrer eingezogen wird. Zahlungen sind grunds&auml;tzlich im Voraus f&auml;llig.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">5. Buchung und Stornierung</h2>
          <p className="text-gray-700 leading-relaxed">
            Buchungen k&ouml;nnen vom Sch&uuml;ler &uuml;ber die Plattform vorgenommen werden. Eine Buchung ist verbindlich, sobald der Lehrer diese best&auml;tigt und die Zahlung autorisiert wurde. Stornierungen durch den Sch&uuml;ler sind bis zu 24 Stunden vor dem gebuchten Termin kostenlos m&ouml;glich. Bei sp&auml;terer Stornierung oder Nichterscheinen wird der volle Betrag in Rechnung gestellt. Stornierungen durch den Lehrer sind jederzeit m&ouml;glich; in diesem Fall wird keine Zahlung eingezogen bzw. eine bereits autorisierte Zahlung r&uuml;ckg&auml;ngig gemacht.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">6. Pflichten der Lehrer</h2>
          <p className="text-gray-700 leading-relaxed">
            Lehrer versichern, dass sie &uuml;ber die erforderliche fachliche Qualifikation verf&uuml;gen. Sie verpflichten sich, zugesagte Termine einzuhalten und Sch&uuml;ler rechtzeitig &uuml;ber etwaige Verhinderungen zu informieren. Lehrer sind als selbstst&auml;ndige Auftragnehmer t&auml;tig und nicht Angestellte des Plattformbetreibers.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">7. Bewertungen</h2>
          <p className="text-gray-700 leading-relaxed">
            Sch&uuml;ler k&ouml;nnen Lehrer nach Abschluss einer bezahlten Buchung bewerten. Bewertungen m&uuml;ssen wahrheitsgem&auml;&szlig; und sachlich sein. Der Plattformbetreiber beh&auml;lt sich das Recht vor, beleidigende oder rechtlich unzul&auml;ssige Bewertungen zu l&ouml;schen.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">8. Haftung</h2>
          <p className="text-gray-700 leading-relaxed">
            Der Plattformbetreiber haftet nicht f&uuml;r die fachliche Qualit&auml;t der erbrachten Nachhilfeleistungen, da diese ausschlie&szlig;lich zwischen Sch&uuml;ler und Lehrer erbracht werden. Die Haftung des Plattformbetreibers ist auf Vorsatz und grobe Fahrl&auml;ssigkeit beschr&auml;nkt, soweit dies gesetzlich zul&auml;ssig ist. F&uuml;r leichte Fahrl&auml;ssigkeit wird keine Haftung &uuml;bernommen, au&szlig;er bei Verletzung wesentlicher Vertragspflichten oder Personensch&auml;den.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">9. Datenschutz</h2>
          <p className="text-gray-700 leading-relaxed">
            Die Verarbeitung personenbezogener Daten erfolgt gem&auml;&szlig; der Datenschutz-Grundverordnung (DSGVO) und dem &ouml;sterreichischen Datenschutzgesetz (DSG). N&auml;here Informationen entnehmen Sie bitte unserer{" "}
            <a href="/datenschutz" className="text-blue-600 hover:underline">Datenschutzerkl&auml;rung</a>.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">10. &Auml;nderungen der AGB</h2>
          <p className="text-gray-700 leading-relaxed">
            Der Plattformbetreiber beh&auml;lt sich vor, diese AGB jederzeit zu &auml;ndern. &Auml;nderungen werden Nutzern per E-Mail mitgeteilt. Widerspricht ein Nutzer den ge&auml;nderten AGB nicht innerhalb von 30 Tagen nach Benachrichtigung, gelten die ge&auml;nderten AGB als akzeptiert.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">11. Anwendbares Recht und Gerichtsstand</h2>
          <p className="text-gray-700 leading-relaxed">
            Es gilt ausschlie&szlig;lich &ouml;sterreichisches Recht unter Ausschluss der Verweisungsnormen des internationalen Privatrechts sowie des UN-Kaufrechts. Soweit gesetzlich zul&auml;ssig, wird als Gerichtsstand Wien vereinbart. F&uuml;r Verbraucher gelten die gesetzlichen Gerichtsstands&shy;regelungen gem&auml;&szlig; &sect; 14 KSchG.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">12. Salvatorische Klausel</h2>
          <p className="text-gray-700 leading-relaxed">
            Sollten einzelne Bestimmungen dieser AGB unwirksam oder undurchf&uuml;hrbar sein oder werden, bleibt die Wirksamkeit der &uuml;brigen Bestimmungen davon unber&uuml;hrt. An die Stelle der unwirksamen Bestimmung tritt eine wirksame Regelung, die dem wirtschaftlichen Zweck der unwirksamen Bestimmung am n&auml;chsten kommt.
          </p>
        </section>
      </div>
    </main>
  );
}
