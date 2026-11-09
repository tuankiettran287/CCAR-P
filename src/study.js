const template = document.getElementById("question-bank");
export const bank = new Map([...template.content.querySelectorAll("article")].map((card) => {
  const options = [...card.querySelectorAll(".options > li")];
  const explanation = card.querySelector(".feedback").cloneNode(true);
  explanation.querySelector("h3").remove();
  return [Number(card.id.slice(1)), {
    prompt: card.querySelector(".prompt").innerHTML,
    options: options.map((option) => [...option.querySelectorAll(".option-text p")].map((p) => p.innerHTML)),
    correct: options.flatMap((option, index) => option.classList.contains("correct") ? [index] : []),
    explanation: explanation.innerHTML,
  }];
}));
export const bankIds = [...bank.keys()];
export const examSize = 63;
export const scoreScale = 1000;
export const passScore = 720;
const previousExamSize = 60;
export const storageKey = "ccarp-practice.v1";
export const filters = { all: "Tất cả", partial: "Một phần", wrong: "Câu sai", blank: "Chưa làm" };

const fresh = () => ({
  mode: "practice",
  practice: { current: bankIds[0], filter: "all", results: {}, drafts: {} },
  exam: null,
});

function readSelections(data, allowEmpty = false) {
  const result = {};
  for (const [id, values] of Object.entries(data ?? {})) {
    const question = bank.get(Number(id));
    if (!question || !Array.isArray(values) || values.length > question.correct.length
        || (!values.length && !allowEmpty) || new Set(values).size !== values.length
        || values.some((i) => !Number.isInteger(i) || i < 0 || i >= question.options.length)) continue;
    result[Number(id)] = values;
  }
  return result;
}

export function readProgress(raw) {
  const saved = JSON.parse(raw);
  const result = fresh();
  if (!saved || typeof saved !== "object") return result;
  const practice = saved.practice ?? {};
  const exam = saved.exam;
  result.mode = saved.mode === "exam" ? "exam" : "practice";
  result.practice = {
    current: bank.has(practice.current) || practice.current === null ? practice.current : bankIds[0],
    filter: Object.hasOwn(filters, practice.filter) ? practice.filter : "all",
    results: readSelections(practice.results),
    drafts: readSelections(practice.drafts, true),
  };
  if (Array.isArray(exam?.ids) && [previousExamSize, examSize].includes(exam.ids.length)
      && new Set(exam.ids).size === exam.ids.length && exam.ids.every((id) => bank.has(id))) {
    let ids = exam.ids;
    if (ids.length === previousExamSize && exam.finished !== true) {
      // Keep the saved order and append unused questions consistently across tabs.
      const start = bankIds.indexOf(ids.at(-1)) + 1;
      const remaining = [...bankIds.slice(start), ...bankIds.slice(0, start)].filter((id) => !ids.includes(id));
      ids = [...ids, ...remaining.slice(0, examSize - ids.length)];
    }
    result.exam = {
      ids,
      current: ids.includes(exam.current) || exam.current === null ? exam.current : ids[0],
      filter: exam.finished === true && Object.hasOwn(filters, exam.filter) ? exam.filter : "all",
      finished: exam.finished === true,
      answers: readSelections(exam.answers),
    };
  }
  return result;
}

export function loadProgress() {
  try {
    return { progress: readProgress(localStorage.getItem(storageKey)), canSave: true };
  } catch (error) {
    return { progress: fresh(), canSave: error instanceof SyntaxError };
  }
}

export function saveProgress(progress) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(progress));
    return true;
  } catch {
    return false;
  }
}

export const sessionFor = (progress) => progress[progress.mode];

export function gradeQuestion(id, choices) {
  if (!choices?.length) return { status: "blank", credit: 0 };
  const key = bank.get(id).correct;
  const credit = key.filter((option) => choices.includes(option)).length / key.length;
  const status = credit === 1 ? "correct" : credit > 0 ? "partial" : "wrong";
  return { status, credit };
}

export function viewFor(progress) {
  const examMode = progress.mode === "exam";
  const session = sessionFor(progress);
  const ids = examMode ? (session?.ids ?? []) : bankIds;
  const answers = examMode ? session?.answers : session.results;
  const ongoingExam = examMode && !!session && !session.finished;
  const counts = { correct: 0, partial: 0, wrong: 0, blank: 0, answered: 0 };
  let earnedCredit = 0;
  const entries = ids.map((id, index) => {
    const selected = answers[id];
    const { status, credit } = ongoingExam && selected?.length
      ? { status: "answered", credit: 0 }
      : gradeQuestion(id, selected);
    counts[status]++;
    earnedCredit += credit;
    return { id, number: index + 1, status };
  });
  const visible = entries.filter(({ status }) => session.filter === "all" || status === session.filter);
  const current = session?.current;
  const index = ids.indexOf(current);
  const previous = visible.findLast(({ number }) => number < index + 1)?.id;
  const next = visible.find(({ number }) => number > index + 1)?.id;
  const selected = examMode ? (answers?.[current] ?? [])
    : (session.drafts[current] ?? answers[current] ?? []);
  const revealed = examMode ? !!session?.finished
    : Object.hasOwn(answers, current) && !Object.hasOwn(session.drafts, current);
  return { examMode, ongoingExam, session, ids, visible, counts, earnedCredit, current, index, previous, next, selected, revealed };
}

export function makeExam() {
  const ids = bankIds.slice();
  for (let i = 0; i < examSize; i++) {
    const random = i + Math.floor(Math.random() * (ids.length - i));
    [ids[i], ids[random]] = [ids[random], ids[i]];
  }
  const draw = ids.slice(0, examSize);
  return { ids: draw, current: draw[0], filter: "all", finished: false, answers: {} };
}
