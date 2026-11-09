import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { HeroArt } from "./hero.jsx";
import {
  bank, examSize, filters, gradeQuestion, loadProgress, makeExam, passScore, readProgress,
  saveProgress, scoreScale, sessionFor, storageKey, viewFor,
} from "./study.js";
import "./styles.css";

const icons = {
  layers: "m3 8 9-4.5L21 8l-9 4.5L3 8Zm0 4.5 9 4.5 9-4.5M3 17l9 4.5 9-4.5",
  book: "M12 6c-2.2-2-5.4-2.5-9-1v13c3.6-1.5 6.8-1 9 1 2.2-2 5.4-2.5 9-1V5c-3.6-1.5-6.8-1-9 1Zm0 0v13",
  clipboard: "M9 4H6a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-3M9 3h6v4H9zM8 12h8m-8 4h5",
  grid: "M4 4h6v6H4zm10 0h6v6h-6zM4 14h6v6H4zm10 0h6v6h-6z",
  left: "m14 6-6 6 6 6",
  right: "m10 6 6 6-6 6",
  check: "m5 12 4.5 4.5L19 7",
};

function Icon({ name }) {
  return <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path d={icons[name]} />
  </svg>;
}

function Masthead({ examMode, canSave, switchMode }) {
  return <header className="masthead">
    <div className="shell bar">
      <div className="brand">
        <span className="brand-mark"><Icon name="layers" /></span>
        <div><span className="brand-name">CCAR-P</span><span className="brand-sub">Claude Certified Architect</span></div>
      </div>
      <nav className="mode-switch" aria-label="Chế độ làm bài">
        <button id="mode-practice" type="button" aria-pressed={!examMode} onClick={() => switchMode("practice")}><Icon name="book" />Luyện tập</button>
        <button id="mode-exam" type="button" aria-pressed={examMode} onClick={() => switchMode("exam")}><Icon name="clipboard" />Thi thử</button>
      </nav>
      <p id="storage-status" className={canSave ? "storage" : "storage unavailable"} role="status">
        {canSave ? "Lưu trên trình duyệt này" : "Không thể lưu trên trình duyệt"}
      </p>
    </div>
  </header>;
}

function StudyHeading({ examMode, session }) {
  const questionCount = session?.ids?.length ?? examSize;
  return <div className="page-heading">
    <HeroArt />
    <p className="kicker" id="mode-label">{examMode ? "ĐỀ THI " + questionCount + " CÂU" : "NGÂN HÀNG 160 CÂU"}</p>
    <h1 id="page-title">{examMode ? "Thi thử CCAR-P" : "Luyện từng câu"}</h1>
    <p id="page-description">{examMode
      ? "Đáp án và giải thích xuất hiện sau khi bạn nộp bài."
      : "Kiểm tra đáp án sau mỗi câu và xem lại những câu bạn làm sai."}</p>
    {session && <a id="mobile-map-link" className="mobile-map" href="#map-panel"><Icon name="grid" />Đến bản đồ câu hỏi</a>}
  </div>;
}

function ExamIntro({ startExam }) {
  return <section id="exam-intro" className="intro panel">
    <div>
      <h2>Tạo đề thi thử</h2>
      <p>Đề gồm {examSize} câu khác nhau lấy ngẫu nhiên từ ngân hàng 160 câu. Điểm đạt là {passScore}/{scoreScale}. Bạn có thể đổi đáp án trước khi nộp bài.</p>
    </div>
    <button id="exam-start" className="button primary" type="button" onClick={startExam}>Bắt đầu thi thử</button>
  </section>;
}

function ExamResults({ counts, earnedCredit, questionCount, startExam, review }) {
  const score = Math.round(earnedCredit * scoreScale / questionCount);
  const passed = score >= passScore;
  return <section id="exam-results" className="results panel" aria-labelledby="results-title">
    <div className="results-heading">
      <div>
        <h2 id="results-title" tabIndex={-1}>Kết quả thi thử</h2>
        <p className="muted">Ngưỡng đạt {passScore}/{scoreScale}</p>
      </div>
      <strong id="result-status" className={passed ? "result-status good" : "result-status bad"}>
        {passed ? "Đạt" : "Chưa đạt"}
      </strong>
    </div>
    <div className="score-grid">
      <div className="score-total"><strong id="result-score">{score}/{scoreScale}</strong><span>Điểm quy đổi</span></div>
      <div className="score-correct"><strong id="result-correct">{counts.correct}</strong><span>Đúng</span></div>
      <div className="score-partial"><strong id="result-partial">{counts.partial}</strong><span>Đúng một phần</span></div>
      <div className="score-wrong"><strong id="result-wrong">{counts.wrong}</strong><span>Sai</span></div>
      <div><strong id="result-blank">{counts.blank}</strong><span>Bỏ trống</span></div>
    </div>
    <div className="actions">
      <button id="result-review" className="button" type="button" onClick={review} disabled={!counts.wrong}>Xem câu sai</button>
      <button id="new-exam" className="button primary" type="button" onClick={startExam}>Tạo đề mới</button>
    </div>
  </section>;
}

function AnswerOption({ paragraphs, index, selected, question, locked, choose }) {
  const chosen = selected.includes(index);
  const multiple = question.correct.length > 1;
  const correct = locked && question.correct.includes(index);
  const wrong = locked && chosen && !correct;
  const stateClass = correct ? "is-correct" : wrong ? "is-wrong" : !locked && chosen ? "is-selected" : "";
  return <label className={["answer-row", stateClass, locked && "is-locked"].filter(Boolean).join(" ")}>
    <input id={"choice-" + index} type={multiple ? "checkbox" : "radio"} name="choice" value={index}
      checked={chosen} disabled={locked || (multiple && !chosen && selected.length >= question.correct.length)}
      onChange={(event) => choose(index, event.target.checked)} />
    <span className="answer-key" aria-hidden="true">{index + 1}</span>
    <span className="option-copy">
      {paragraphs.map((html, paragraph) =>
        <span key={paragraph} className="option-paragraph" lang="en" dangerouslySetInnerHTML={{ __html: html }} />)}
      {(correct || wrong) && <span className="answer-status">
        {wrong ? "Bạn chọn · Sai" : chosen ? "Bạn chọn · Đúng" : "Đáp án đúng"}
      </span>}
    </span>
  </label>;
}

const gradingMessages = {
  correct: "Bạn trả lời đúng",
  partial: "Đúng một phần",
  wrong: "Bạn trả lời sai",
  blank: "Bạn đã bỏ trống câu này",
};

function QuestionPanel({ view, goTo, choose, check, retry }) {
  const { examMode, current, index, ids, selected, revealed, previous, next } = view;
  if (current == null) {
    return <section id="empty-panel" className="question panel">
      <h2>Không có câu trong bộ lọc</h2>
      <p className="muted">Chọn Tất cả để trở về danh sách câu hỏi.</p>
    </section>;
  }
  const question = bank.get(current);
  const grade = revealed ? gradeQuestion(current, selected) : null;
  const position = (index + 1) + "/" + ids.length;
  return <section id="question-panel" className="question panel" aria-labelledby="question-title">
    <div className="question-header">
      <div className="question-heading">
        <span className="section-icon"><Icon name="clipboard" /></span>
        <h2 id="question-title" tabIndex={-1}>Câu {index + 1}</h2>
      </div>
      <div className="question-meta">
        <span className="key-help"><kbd>←</kbd> <kbd>→</kbd> Chuyển câu</span>
        <span className="position" id="question-position">{position}{examMode && " · Câu gốc " + current}</span>
      </div>
    </div>
    <div id="prompt" lang="en" dangerouslySetInnerHTML={{ __html: question.prompt }} />
    <fieldset>
      <legend id="answer-instructions">
        {question.correct.length > 1
          ? "Chọn " + question.correct.length + " đáp án · Đã chọn " + selected.length + "/" + question.correct.length
          : "Chọn một đáp án"}
      </legend>
      <div id="answers" key={current}>
        {question.options.map((paragraphs, option) =>
          <AnswerOption key={option} paragraphs={paragraphs} index={option}
            selected={selected} question={question} locked={revealed} choose={choose} />)}
      </div>
    </fieldset>
    <section id="feedback" className="feedback" aria-labelledby="feedback-title" hidden={!revealed}>
      <h3 id="feedback-title" tabIndex={-1}>Giải thích</h3>
      {grade && <>
        <p id="grading-status" className="status-line" data-status={grade.status}>
          {gradingMessages[grade.status]}
          {grade.status === "partial" && " · " + Math.round(grade.credit * 100) + "% điểm câu này"}
        </p>
        <div id="explanation" dangerouslySetInnerHTML={{ __html: question.explanation }} />
      </>}
    </section>
    <div className="question-nav" role="group" aria-label="Thao tác câu hỏi">
      {!examMode && <div id="practice-actions">
        <button id="check-answer" className="button primary" type="button" hidden={revealed}
          disabled={!selected.length} onClick={check} aria-label="Kiểm tra đáp án">
          <Icon name="check" /><span className="nav-wide">Kiểm tra đáp án</span><span className="nav-short" aria-hidden="true">Kiểm tra</span>
        </button>
        <button id="retry-question" className="button" type="button" hidden={!revealed} onClick={retry} aria-label="Làm lại câu này">
          <span className="nav-wide">Làm lại câu này</span><span className="nav-short" aria-hidden="true">Làm lại</span>
        </button>
      </div>}
      <button id="prev-question" className="button" type="button" disabled={previous === undefined} onClick={() => goTo(previous)}
        aria-label="Câu trước" aria-keyshortcuts="ArrowLeft">
        <Icon name="left" /><span className="nav-wide">Câu trước</span><span className="nav-short" aria-hidden="true">Trước</span>
      </button>
      {examMode && <span className="mobile-position" aria-hidden="true">{position}</span>}
      <button id="next-question" className="button" type="button" disabled={next === undefined} onClick={() => goTo(next)}
        aria-label="Câu tiếp" aria-keyshortcuts="ArrowRight">
        <span className="nav-wide">Câu tiếp</span><span className="nav-short" aria-hidden="true">Tiếp</span><Icon name="right" />
      </button>
    </div>
  </section>;
}

const statusLabels = { correct: "Đúng", partial: "Đúng một phần", wrong: "Sai", answered: "Đã chọn", blank: "Chưa làm" };

function QuestionMap({ view, goTo, setFilter, openSubmit }) {
  const { ids, counts, visible, session, current, ongoingExam } = view;
  const done = ids.length - counts.blank;
  return <aside id="map-panel" className="map panel" aria-labelledby="map-title">
    <div className="map-head">
      <span className="section-icon"><Icon name="grid" /></span>
      <h2 id="map-title">Bản đồ câu hỏi</h2>
      <span id="progress-text" className="position">{done}/{ids.length}</span>
    </div>
    <progress id="progress" max={ids.length} value={done} aria-label="Tiến độ làm bài" />
    <p id="counts">{ongoingExam
      ? done + " đã chọn · " + counts.blank + " chưa làm"
      : counts.correct + " đúng · " + counts.partial + " một phần · " + counts.wrong + " sai · " + counts.blank + " chưa làm"}</p>
    {!ongoingExam && <div className="filters" id="filters" role="group" aria-label="Lọc câu hỏi">
      {Object.entries(filters).map(([filter, label]) => <button key={filter} type="button" data-filter={filter}
        aria-pressed={session.filter === filter} onClick={() => setFilter(filter)}>{label}</button>)}
    </div>}
    <div id="question-map" role="group" aria-label="Chọn câu hỏi">
      {visible.map(({ id, number, status }) => <button key={id} type="button" data-id={id} data-state={status}
        aria-label={"Câu " + number + " · " + statusLabels[status]}
        aria-current={id === current ? "true" : undefined} onClick={() => goTo(id)}>{number}</button>)}
    </div>
    {!visible.length && <p id="map-empty" className="muted">Không có câu phù hợp.</p>}
    {ongoingExam && <div className="actions" id="submit-actions">
      <button id="exam-submit" className="button primary" type="button" onClick={openSubmit}>Nộp bài</button>
    </div>}
  </aside>;
}

function App() {
  const [store, setStore] = useState(loadProgress);
  const latest = useRef(store.progress);
  const focusAfterRender = useRef(null);
  const dialog = useRef(null);
  const view = viewFor(store.progress);

  const change = useCallback((mutate, focusId = null) => {
    const progress = structuredClone(latest.current);
    mutate(progress);
    latest.current = progress;
    focusAfterRender.current = focusId;
    setStore({ progress, canSave: saveProgress(progress) });
  }, []);

  const goTo = useCallback((id) => {
    if (id === undefined) return;
    change((progress) => { sessionFor(progress).current = id; }, "question-title");
  }, [change]);

  useLayoutEffect(() => {
    const id = focusAfterRender.current;
    if (!id) return;
    focusAfterRender.current = null;
    const target = document.getElementById(id);
    if (id === "question-title" && target) {
      target.focus({ preventScroll: true });
      target.scrollIntoView({ block: "start" });
    } else {
      target?.focus();
    }
  });

  useEffect(() => {
    function syncProgress(event) {
      if (event.key !== storageKey) return;
      try {
        const progress = readProgress(event.newValue);
        latest.current = progress;
        if (dialog.current.open) dialog.current.close();
        setStore({ progress, canSave: true });
      } catch {
        // A malformed update from another tab must not replace this session.
      }
    }
    function onKeyDown(event) {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      if (event.defaultPrevented || event.isComposing || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey
          || dialog.current.open || event.target?.isContentEditable
          || event.target?.closest?.("input, textarea, select, [role='slider']")) return;
      const { current, previous, next } = viewFor(latest.current);
      const target = event.key === "ArrowLeft" ? previous : next;
      if (current == null || target === undefined) return;
      event.preventDefault();
      goTo(target);
    }
    window.addEventListener("storage", syncProgress);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("storage", syncProgress);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [goTo]);

  function setFilter(filter) {
    change((progress) => {
      const session = sessionFor(progress);
      session.filter = filter;
      const { visible } = viewFor(progress);
      if (!visible.some(({ id }) => id === session.current)) session.current = visible[0]?.id ?? null;
    }, "question-title");
  }

  function choose(index, checked) {
    const { current, examMode, selected, revealed } = viewFor(latest.current);
    if (current == null || revealed) return;
    const limit = bank.get(current).correct.length;
    const chosen = limit === 1 ? [index] : checked ? [...selected, index] : selected.filter((i) => i !== index);
    if (chosen.length > limit) return;
    change((progress) => {
      if (!examMode) progress.practice.drafts[current] = chosen;
      else if (chosen.length) progress.exam.answers[current] = chosen;
      else delete progress.exam.answers[current];
    });
  }

  function check() {
    const { current, examMode, selected, revealed } = viewFor(latest.current);
    if (examMode || revealed || !selected.length) return;
    change(({ practice }) => {
      practice.results[current] = selected;
      delete practice.drafts[current];
    }, "feedback-title");
  }

  function retry() {
    change(({ practice }) => { practice.drafts[practice.current] = []; }, "choice-0");
  }

  function startExam() {
    change((progress) => { progress.exam = makeExam(); }, "question-title");
  }

  function submitExam() {
    if (!viewFor(latest.current).ongoingExam) return;
    dialog.current.close();
    change(({ exam, practice }) => {
      for (const id of exam.ids) {
        if (exam.answers[id]) practice.results[id] = [...exam.answers[id]];
      }
      exam.finished = true;
    }, "results-title");
  }

  return <>
    <Masthead examMode={view.examMode} canSave={store.canSave}
      switchMode={(mode) => change((progress) => { progress.mode = mode; })} />
    <main className={view.current == null ? "shell" : "shell has-question"}>
      <StudyHeading examMode={view.examMode} session={view.session} />
      {!view.session && <ExamIntro startExam={startExam} />}
      {view.examMode && view.session?.finished && <ExamResults counts={view.counts}
        earnedCredit={view.earnedCredit} questionCount={view.ids.length}
        startExam={startExam} review={() => setFilter("wrong")} />}
      {view.session && <div id="question-board" className="layout">
        <QuestionPanel view={view} goTo={goTo} choose={choose} check={check} retry={retry} />
        <QuestionMap view={view} goTo={goTo} setFilter={setFilter} openSubmit={() => dialog.current.showModal()} />
      </div>}
      <footer>Nguồn câu hỏi và giải thích <a href="https://practice-cert.maithienan.com/practice/CCAR-P/session?mode=learn">Practice Cert · CCAR-P</a></footer>
    </main>
    <dialog id="submit-dialog" ref={dialog} aria-labelledby="submit-title">
      <h2 id="submit-title">Nộp bài thi thử?</h2>
      <p id="submit-summary">Đã chọn đáp án cho {view.counts.answered}/{view.ids.length} câu. Còn {view.counts.blank} câu bỏ trống. Bạn có thể xem lại đáp án sau khi nộp.</p>
      <form method="dialog" className="actions">
        <button className="button" autoFocus>Tiếp tục làm</button>
        <button id="confirm-submit" className="button primary" type="button" onClick={submitExam}>Nộp và xem kết quả</button>
      </form>
    </dialog>
  </>;
}

createRoot(document.getElementById("root")).render(<App />);
