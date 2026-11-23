# Sources: the Albanian alphabet as one line

Checked on 23 November 2026. Flat style (`engine/flat.js`). Narration is in English; Albanian names are spelled phonetically in `script.json` so the voice says them roughly right, and correctly on screen.

## Documents

- **CoM**: Wikipedia, "Congress of Manastir". https://en.wikipedia.org/wiki/Congress_of_Manastir
- **KiM**: Wikipedia (Albanian), "Kongresi i Manastirit". https://sq.wikipedia.org/wiki/Kongresi_i_Manastirit
- **AA**: Wikipedia, "Albanian alphabet". https://en.wikipedia.org/wiki/Albanian_alphabet
- **Ab**: Wikipedia, "Abetare". https://en.wikipedia.org/wiki/Abetare
- **GB**: Wikipedia, "Gjon Buzuku" and "Meshari". https://en.wikipedia.org/wiki/Gjon_Buzuku
- **OC**: Wikipedia, "Albanian Orthography Congress". https://www.wikipedia.com/wiki/Albanian_Orthography_Congress
- **REL**: Radio Evropa e Lirë, "Abetarja e përbashkët e Shqipërisë dhe e Kosovës", 17 May 2012. https://www.evropaelire.org/a/24583954.html
- **Duk**: Dukagjini, "Rrugëtimi i deritanishëm i abetares mbarëkombëtare", 20 August 2022. https://www.dukagjini.com/rrugetimi-i-deritanishem-i-abetares-mbarekombetare/
- **Uni**: Unicode Consortium, "Supported Scripts". https://www.unicode.org/standard/supported.html ; Script Encoding Initiative, completed proposals. https://sei.berkeley.edu/completed-proposals
- **ATSH**: Albanian Telegraphic Agency, "Dita e Alfabetit Shqip, 118 vjet nga Kongresi i Manastirit", 22 November 2026. https://ata.gov.al/2026/11/22/dita-e-alfabetit-shqip-118-vjet-nga-kongresi-i-manastirit/
- **Teo**: teorel.com, "Dita e Alfabetit të Gjuhës Shqipe", 20 November 2025. https://teorel.com/2025/11/20/dita-e-alfabetit-te-gjuhes-shqipe/

## Facts used

| Scene | Fact | Source |
|---|---|---|
| title, letters | 36 letters; one sign for each sound | AA, Teo |
| early | Baptism formula of 1462 (Pal Engjëlli): the first certain document in Albanian | AA |
| early | Meshari by Gjon Buzuku, 1555: the first known printed book in Albanian | GB |
| scripts | Latin letters in the north, Greek in the south, Arabic (Ottoman) script, and original scripts: Elbasan, Todhri, Vithkuqi | AA |
| primer | First Abetare: Naum Veqilharxhi's Ëvetar, 1844 | Ab |
| primer | Vithkuqi script: 33 letters, printed in 1844 | AA |
| primer | Later primers: Kristoforidhi (1867–72, Gheg and Tosk), the Istanbul primer (1879), Gurakuqi (1905 and 1906) | Ab |
| primer | Six or more alphabets in use before the congress | KiM |
| congress | 14–22 November 1908, Manastir (today Bitola) | CoM |
| congress | 50 delegates, 32 with voting rights | CoM |
| congress | Alphabet commission of 11, chaired by Gjergj Fishta | CoM |
| congress | Decision: a compromise keeping both the Istanbul and the Latin (Bashkimi) alphabet | CoM |
| congress | The Istanbul alphabet fell out of use in the following years; the Bashkimi one is the predecessor of today's alphabet | CoM |
| congress | Istanbul alphabet dates from 1879; Bashkimi from the society of that name in Shkodër | AA |
| letters | 7 vowels (a, e, ë, i, o, u, y) and 29 consonants | AA; consonant count computed: 36 − 7 |
| letters | 9 digraphs: dh, gj, ll, nj, rr, sh, th, xh, zh; marked letters ç and ë | AA |
| today | Orthography Congress, Tirana, 20–25 November 1972 | OC |
| today | Shared Albania–Kosovo Abetare presented in Prizren on 17 May 2012 | REL |
| today | New joint Abetare agreed in November 2021, for use from 1 September 2022 | Duk |
| today | Unicode: Elbasan in 7.0 (2014), Vithkuqi in 14.0 (2021), Todhri in 16.0 (2024) | Uni |
| outro | 118th anniversary marked on 22 November 2026 in Albania, Kosovo and North Macedonia | ATSH |

## Where sources disagree, and what the film does

- **Delegates.** English Wikipedia gives 50 delegates from 23 places (32 voting, 18 observers) and marks the figure as uncited. Several news items say 50 delegates from 26 towns; one library page says 150 people attended with 32 voting. The film says 50 delegates, 32 with a vote.
- **The decision.** Many anniversary articles say the congress chose the 36-letter Latin alphabet outright. English Wikipedia describes a compromise that kept two alphabets, with the Istanbul one disappearing within a few years. The film follows the second account.
- **Kristoforidhi's primers** are dated 1867, 1868, 1869 or 1872 depending on the source. The film shows "1867–72".
- **The 2022 joint Abetare** is sourced to announcements made before the school year began. The film says a new joint edition followed in 2022 and makes no claim about how widely it is used.

## On screen only in this version

| Scene | Fact | Source |
|---|---|---|
| early | Wording of the baptism formula, "Un'te paghesont' pr'emenit t'Atit e t'Birit e t'Spertit Senit.", dated 8 November 1462 | Wikipedia, "Formula e pagëzimit". https://en.wikipedia.org/wiki/Formula_e_pag%C3%ABzimit |
| early | English rendering "I baptise you in the name of the Father, and the Son, and the Holy Spirit" | Our translation of the standard formula; the page gives none |
| congress | 14–22 November; 32 of 50 delegates with a vote, so 18 without (computed: 50 − 32) | CoM |
| today | Orthography Congress dates, 20–25 November 1972 | OC |
| outro | 118 years (computed: 2026 − 1908) | CoM, ATSH |

## Real letters

The Elbasan, Todhri and Vithkuqi signs are real characters, drawn with the Noto fonts in `fonts/` (SIL Open Font License). Each is the first letter of its Unicode block: U+10500, U+105C0 and U+10570. The book in the 1844 stop shows U+10570 to U+10573. The Arabic sample is alef, beh, jeem.

## What the diagram simplifies

- The six strands before 1908 stand for "six or more alphabets in use" (KiM). Only four are named. The two that branch off later are not labelled, because the sources used do not list the six.
- The two lines that leave the congress are labelled as the narration names them: "Latin" and "Istanbul". The Latin one is the Bashkimi alphabet.
- The three later primers are placed above all the strands, not on one of them, because the sources used do not agree on which script each edition used.
