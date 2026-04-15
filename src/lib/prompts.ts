import { AIMode } from "@/types";

function getContext(grade: number) {
  if (grade <= 6) return {
    level: "Jahrgang 5-6",
    language: "Einfache, kurze Sätze. Alltagsbeispiele. Keine Abstraktionen.",
    cognitive: "Benennen, Beschreiben, erstes Einordnen.",
    backQuestion: "Was würdest du als nächstes ausprobieren?",
  };
  if (grade <= 8) return {
    level: "Jahrgang 7-8",
    language: "Klare Sprache, mittlere Komplexität. Fachbegriffe kurz erklären.",
    cognitive: "Analyse, Begründung, Zusammenhänge erkennen.",
    backQuestion: "Welchen Zusammenhang siehst du zu dem, was ihr besprochen habt?",
  };
  if (grade <= 10) return {
    level: "Jahrgang 9-10",
    language: "Präzise, fachlich korrekt, argumentativ strukturiert.",
    cognitive: "Urteil, Transfer, kritische Prüfung.",
    backQuestion: "Welche Gegenposition könnte es dazu geben?",
  };
  return {
    level: "Jahrgang 11-13",
    language: "Abstrakt, reflektiert, wissenschaftlich präzise.",
    cognitive: "Reflexion, Metakognition, epistemisches Urteil.",
    backQuestion: "Welche Annahmen stecken hinter deiner Fragestellung?",
  };
}

function getSubjectFocus(subject: string): string {
  const s = subject.toLowerCase();
  if (s.includes("deutsch")) return "Verstehen, Deuten, Argumentieren, Sprachreflexion.";
  if (s.includes("englisch") || s.includes("französisch") || s.includes("latein") || s.includes("spanisch"))
    return "Verstehen, Formulieren, kommunikative Klarheit, sprachliche Angemessenheit.";
  if (s.includes("math")) return "Problemlösen, Rechenweg zeigen, Begründung, Muster erkennen.";
  if (s.includes("bio") || s.includes("chem") || s.includes("phys"))
    return "Beobachten, Beschreiben, Erklären, Hypothesen bilden und prüfen.";
  if (s.includes("geschicht") || s.includes("politik") || s.includes("erdkund") || s.includes("wirtschaft"))
    return "Einordnen, Vergleichen, Urteilen, Perspektiven erkennen.";
  if (s.includes("religion") || s.includes("werte") || s.includes("ethik"))
    return "Deuten, Reflektieren, Begründen, ethisch urteilen.";
  if (s.includes("kunst") || s.includes("musik") || s.includes("sport"))
    return "Wahrnehmen, Beschreiben, Gestalten, Reflektieren.";
  if (s.includes("informatik"))
    return "Strukturieren, algorithmisch denken, digitale Systeme einordnen.";
  return "Verstehen, Anwenden, Reflektieren, kritisch prüfen.";
}

export function buildChatSystemPrompt(mode: AIMode, subject: string, topic: string, grade: number, task: string): string {
  const ctx = getContext(grade);
  const focus = getSubjectFocus(subject);

  const base = `Du bist ein kompetenter KI-Assistent für den Schulunterricht.
Fach: ${subject} | ${ctx.level} | Thema: ${topic}
Aufgabe: ${task}
Fachlicher Fokus: ${focus}
Sprachniveau: ${ctx.language}`;

  if (mode === "standard") {
    return `${base}

MODUS: STANDARD — Starke, kompetente KI
Du gibst klare, vollständige, fachlich präzise Antworten.
Du erklärst, strukturierst, veranschaulichst, fasst zusammen.
Du löst KEINE kompletten Aufgaben — aber du erklärst Zusammenhänge umfassend.
Am Ende jeder Antwort: eine Rückfrage, die zum Weiterdenken einlädt.
Maximal 6 Sätze + Rückfrage. Sprache: ${ctx.language}`;
  }

  if (mode === "socratic") {
    return `${base}

MODUS: SOKRATISCH — Führen durch Fragen
Du antwortest hauptsächlich mit 1-2 gezielten Rückfragen.
Du gibst kleine Denkanstöße, aber keine fertigen Antworten.
Deine Fragen sollen den Schüler einen konkreten Schritt weiterbringen.
Wenn der Schüler völlig falsch liegt: sanft korrigieren durch eine präzisere Gegenfrage.
Ziel: Der Schüler kommt durch eigenes Denken zur Lösung.`;
  }

  // unreliable
  return `${base}

MODUS: KRITISCH — Halluzinations-Training
Du gibst kompetente Antworten, baust aber gelegentlich (jede 2.-3. Antwort) einen subtilen, prüfbaren Fehler ein.
Fehlertypen: falsche Jahreszahl, verdrehter Kausalzusammenhang, falsches Gesetz, leicht falsche Zahl.
Die Fehler müssen mit Schulbuch oder Wikipedia überprüfbar sein.
NICHT offen als fehlerhaft kennzeichnen.
Jede Antwort endet mit: "Überprüfe meine Aussagen — ich kann mich irren."`;
}

export function buildPriorKnowledgePrompt(subject: string, grade: number, topic: string, task: string): string {
  const ctx = getContext(grade);
  return `Erstelle 3 Vorwissensfragen für ${subject}, ${ctx.level}, Thema: ${topic}.
Aufgabe: ${task}
Sprachniveau: ${ctx.language}

Anforderungen:
- Direkt auf Thema und Aufgabe bezogen
- Drei Ebenen: Faktenwissen, Zusammenhänge, Alltagsbezug
- Keine Ja/Nein-Fragen
- Max. 1-2 Sätze pro Frage

Antworte NUR als JSON-Array ohne Backticks:
["Frage 1", "Frage 2", "Frage 3"]`;
}

export function buildPromptRatingPrompt(promptText: string, subject: string, topic: string, grade: number): string {
  const ctx = getContext(grade);
  return `Bewerte diesen Schüler-Prompt.
Fach: ${subject} | ${ctx.level} | Thema: ${topic}
Prompt: "${promptText}"
Maßstab: ${ctx.cognitive}

Bewerte nach 3 Kriterien (1-5 Sterne):
praezision: Ist die Frage klar und spezifisch?
eigenanteil: Zeigt sie eigenes Nachdenken?
lernwert: Führt sie zu echtem Verstehen?

Feedback: je 1 klarer Satz, kein generisches Lob.

Antworte NUR als JSON ohne Backticks:
{"praezision":{"stars":3,"comment":"..."},"eigenanteil":{"stars":2,"comment":"..."},"lernwert":{"stars":4,"comment":"..."}}`;
}

export function buildGroupAnalysisPrompt(promptsList: Array<{ studentName: string; text: string }>, subject: string, topic: string, grade: number): string {
  const ctx = getContext(grade);
  const formatted = promptsList.map((p, i) => `${i + 1}. [${p.studentName}]: "${p.text}"`).join("\n");
  return `Analysiere alle Schüler-Prompts dieser Unterrichtsstunde.
Fach: ${subject} | ${ctx.level} | Thema: ${topic}

Prompts:
${formatted}

Aufgaben:
1. Top 5 stärkste Prompts auswählen (Rank 1 = stärkster). Begründung: 1-2 Sätze.
2. 2-3 typische Muster in der Gruppe benennen.
3. 1-2 häufige Schwächen benennen.
4. Allgemeines Feedback für die Gruppe: 2-3 Sätze.

Antworte NUR als JSON ohne Backticks:
{"topPrompts":[{"rank":1,"studentName":"...","text":"...","reason":"..."}],"groupPatterns":["..."],"commonWeaknesses":["..."],"generalFeedback":"..."}`;
}

export function buildStudentFeedbackPrompt(
  subject: string, topic: string, grade: number, task: string,
  ownThoughts: string,
  priorAnswers: Array<{ question: string; answer: string }>,
  prompts: Array<{ text: string; response: string }>
): string {
  const ctx = getContext(grade);
  const prior = priorAnswers.length
    ? priorAnswers.map(a => `- ${a.question}: "${a.answer}"`).join("\n")
    : "Keine Vorwissensantworten.";
  const promptList = prompts.length
    ? prompts.map((p, i) => `${i + 1}. "${p.text}"`).join("\n")
    : "Keine Prompts gestellt.";

  return `Erstelle ein strukturiertes Feedback in 5 Dimensionen.
Fach: ${subject} | ${ctx.level} | Thema: ${topic}
Aufgabe: ${task}
Maßstab: ${ctx.cognitive}

Vorwissen: ${prior}
Eigene Gedanken: ${ownThoughts || "Nicht notiert."}
Prompts: ${promptList}

Bewerte nach GENAU diesen 5 Dimensionen (1-5 Sterne):
1. vorwissen: Wie viel wusste der Schüler vorher?
2. kritischePruefung: Hat er die KI hinterfragt?
3. umgangMitKI: KI als Denkpartner oder Antwortmaschine?
4. eigenanteil: Wie sichtbar war eigenes Denken?
5. denkqualitaet: Wie präzise und produktiv war der Zugang?

Dazu:
- staerke: Die eine größte Stärke (1 konkreter Satz)
- blinder_fleck: Der größte blinde Fleck (1 Satz)
- naechster_schritt: Die eine konkrete nächste Handlung (1 Satz)

Kein generisches Lob. Direktes "Du". Sprache: ${ctx.language}

Antworte NUR als JSON ohne Backticks:
{
  "vorwissen":{"stars":3,"label":"Vorwissen","comment":"..."},
  "kritischePruefung":{"stars":2,"label":"Kritische Prüfung","comment":"..."},
  "umgangMitKI":{"stars":4,"label":"Umgang mit KI","comment":"..."},
  "eigenanteil":{"stars":3,"label":"Eigenanteil","comment":"..."},
  "denkqualitaet":{"stars":4,"label":"Denkqualität","comment":"..."},
  "staerke":"...",
  "blinder_fleck":"...",
  "naechster_schritt":"..."
}`;
}

export function buildGroupComparisonPrompt(entries: Array<{ name: string; answer: string }>, task: string, subject: string, topic: string): string {
  const formatted = entries.map(e => `${e.name}: "${e.answer}"`).join("\n");
  return `Vergleiche diese Transfer-Sätze einer Schulklasse.
Fach: ${subject} | Thema: ${topic}
Aufgabe: ${task}

Transfer-Sätze:
${formatted}

Analysiere:
- Was haben alle gemeinsam verstanden?
- Wo gibt es Unterschiede im Verständnis?
- Wessen Antwort trifft den Kern am präzisesten?
- Gibt es Anzeichen für Halluzinationen oder falsche Übernahmen aus der KI?

Antworte NUR als JSON ohne Backticks:
{"gemeinsames":"...","unterschiede":"...","starksteAntwort":"Name","begruendung":"...","halluzinationshinweis":"..."}`;
}
