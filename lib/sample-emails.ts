import type { EmailTemplate } from "./types"

export const sampleEmailTemplates: EmailTemplate[] = [
  {
    id: "email-1",
    name: "Standardne järelkontakt",
    subject: "Järelkontakt: [Ettevõtte nimi] ja [Kontakti ettevõte]",
    content: `<p>Tere, [Kontaktisiku nimi]</p>

<p>Suur tänu tänase meeldiva ja sisuka telefonikõne eest!</p>

<p>Nagu telefoni teel arutasime, siis pakun teile kampaania <strong>"Tühi jutt ei müü"</strong> raames võimalust saada tasuta teie ettevõtte vajadustest lähtuva veebilehe näidislahendus.</p>

<p>Veebilehe näidis visualiseerib, milline struktuur ja sisu sobiksid just Teie ettevõtte kodulehele. See toob esile konkreetsed taktikad ja elemendid, mis aitavad teil külastajaid tõhusamalt kõnetada kui konkurendid, et saada rohkem kvalifitseeritud päringuid ja õigeid kliente. Lisaks näete, kuidas hoolikalt läbimõeldud veebileht tugevdab Teie ettevõtte usaldusväärsust ja professionaalset mainet ning muutub tööriistaks, mis toetab aktiivselt teie äritegevust.</p>

<h3>Näiteid meie tehtud töödest</h3>

<ul>
<li><strong>Rail Auto OÜ</strong> - veebileht on hea näide "B2C" konversioonipõhisest disainist, kus iga element täidab kindlat eesmärki potentsiaalse kliendi teekonna suunamisel.</li>
<li><strong>Kivaku OÜ</strong> - veebileht on hea näide B2B+B2C konversioonipõhisest disainist, kus iga element täidab kindlat eesmärki potentsiaalse kliendi teekonna suunamisel.</li>
<li><strong>Teie Kinnisvara OÜ</strong> - veebileht on hea näide, kuidas digitaalne kohalolu saab toetada ettevõtte kuvandit ja äriprotsesse, mitte ainult otseselt konversioone.</li>
<li><strong>Dr. Schults Hambaravi</strong> - veebileht on hea näide sellest, kuidas veebileht saab efektiivselt toetada nii brändi kuvandit kui ka äriprotsesse.</li>
</ul>

<p>Et anda teile aimu, siis:</p>

<ul>
<li>Vähem mahukate kodulehtede hinnad jäävad 1500 ja 2500 euro vahele.</li>
<li>Terviklikud, tulemustele orienteeritud lahendused jäävad 2500 ja 4500 euro vahele.</li>
<li>Meie lähenemine on "võtmed kätte" – meie teeme töö (ka sisu!) ja keskendume tulemustele.</li>
</ul>

<p>Meie kohtumine ja teile loodav näidis on igal juhul tasuta ja kohustustevabad.</p>

<p>Kui näidise pinnalt näete, et oleme õigel teel ja läheb koostööks, siis saame paika panna nii Teile sobivaima lahenduse kui ka selle konkreetse hinna.</p>

<p>Parimate soovidega,<br>
Georg-Marttin<br>
[Ettevõtte nimi]</p>`,
    isDefault: true,
    callResult: "Saada info"
  },
  {
    id: "email-2",
    name: "Kohtumise kinnitus",
    subject: "Kohtumine: [Ettevõtte nimi] ja [Kontakti ettevõte] - [Kuupäev] [Kellaaeg]",
    content: `<p>Tere, [Kontaktisiku nimi]</p>

<p>Suur tänu tänase meeldiva ja sisuka telefonikõne eest!</p>

<p>Nagu telefoni teel kokku leppisime, toimub meie kohtumine <strong>[Nädalapäev]([Kuupäev]), kell [Kellaaeg]</strong>. Helistan teile umbes tund aega enne kohtumist ja saadan videokõne lingi.</p>

<p>Kohtumise eesmärk on tutvuda lähemalt teie ettevõtte vajadustega ja näidata, kuidas saaksime aidata teil luua veebileht, mis toob teile rohkem kliente ja suurendab müüki.</p>

<p>Meie kohtumisel räägime:</p>
<ul>
<li>Teie ettevõtte eesmärkidest ja sihtgrupist</li>
<li>Teie praegusest veebilehest ja selle väljakutsetest</li>
<li>Konkreetsetest lahendustest, mis aitaksid teil eristuda konkurentidest</li>
<li>Kuidas meie saaksime teid aidata</li>
</ul>

<p>Kui teil tekib enne kohtumist küsimusi või soovite midagi täpsustada, siis võtke julgelt ühendust.</p>

<p>Ootan meie kohtumist!</p>

<p>Parimate soovidega,<br>
Georg-Marttin<br>
[Ettevõtte nimi]</p>`,
    callResult: "Kohtumine"
  },
  {
    id: "email-3",
    name: "Info saatmine",
    subject: "Info: [Ettevõtte nimi] teenused - veebilehe näidislahendus",
    content: `<p>Tere, [Kontaktisiku nimi]</p>

<p>Tänan teid meeldiva telefonikõne eest! Nagu lubasin, saadan teile täiendavat infot meie teenuste kohta.</p>

<p>[Ettevõtte nimi] on spetsialiseerunud turunduslikult läbimõeldud veebilehtede loomisele, mis aitavad ettevõtetel saada rohkem kliente ja suurendada müüki.</p>

<h3>Mida me pakume:</h3>

<ul>
<li><strong>Turunduslikult läbimõeldud veebilehed</strong> - Iga element veebilehel täidab kindlat eesmärki potentsiaalse kliendi teekonna suunamisel</li>
<li><strong>Konversioonipõhine disain</strong> - Keskendume sellele, et veebileht tooks teile päringuid ja kliente</li>
<li><strong>Professionaalne sisu loomine</strong> - Meie tiim loob kogu sisu, mis kõnetab teie sihtgruppi</li>
<li><strong>Tehniline teostus</strong> - Kaasaegsed lahendused, mis on kasutajasõbralikud ja töötavad kõikidel seadmetel</li>
</ul>

<h3>Näiteid meie tehtud töödest:</h3>

<ul>
<li><strong>Rail Auto OÜ</strong> - B2C konversioonipõhine veebileht</li>
<li><strong>Kivaku OÜ</strong> - B2B+B2C konversioonipõhine veebileht</li>
<li><strong>Teie Kinnisvara OÜ</strong> - Brändi kuvandit ja äriprotsesse toetav veebileht</li>
<li><strong>Dr. Schults Hambaravi</strong> - Brändi kuvandit ja äriprotsesse toetav veebileht</li>
</ul>

<p>Meie hinnad:</p>
<ul>
<li>Vähem mahukate kodulehtede hinnad jäävad 1500 ja 2500 euro vahele.</li>
<li>Terviklikud, tulemustele orienteeritud lahendused jäävad 2500 ja 4500 euro vahele.</li>
</ul>

<p>Kui soovite näha, kuidas saaksime aidata just teie ettevõttel kasvada, siis pakume teile tasuta personaalse veebilehe näidislahenduse. See annab teile selge pildi, milline võiks olla teie uus veebileht ja kuidas see aitaks teil saavutada teie eesmärke.</p>

<p>Kas sobiks, kui lepime kokku lühikese videokõne, et arutada teie vajadusi ja näidata, kuidas saaksime teid aidata?</p>

<p>Parimate soovidega,<br>
Georg-Marttin<br>
[Ettevõtte nimi]</p>`,
    callResult: "Saada info"
  },
  {
    id: "email-4",
    name: "Tagasihelistamine",
    subject: "Järelkontakt: [Ettevõtte nimi] - tagasihelistamine",
    content: `<p>Tere, [Kontaktisiku nimi]</p>

<p>Proovisin teile täna helistada, et rääkida võimalikust koostööst, kuid kahjuks ei õnnestunud teid kätte saada.</p>

<p>Nagu meil telefoni teel kokku lepitud, helistan teile tagasi [Nädalapäev] ([Kuupäev]) kell [Kellaaeg].</p>

<p>Sooviksin lühidalt tutvustada, kuidas saaksime aidata [Kontakti ettevõte] veebilehte parendada, et see tooks teile rohkem kliente ja suurendaks müüki.</p>

<p>Kui soovite juba enne meie kõnet tutvuda meie teenustega, siis leiate täiendavat infot manusest või meie kodulehelt: www.digiagentuur.ee</p>

<p>Kui teile pakutud aeg ei sobi, palun andke mulle teada, et saaksime leida sobivama aja.</p>

<p>Kuni vestluseni!</p>

<p>Parimate soovidega,<br>
Georg-Marttin<br>
[Ettevõtte nimi]</p>`,
    callResult: "Helista hiljem"
  }
]
