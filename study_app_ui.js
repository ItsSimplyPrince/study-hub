// Study Hub — artifact-style layout (Study Topics · Study Schedule · Past Exams)
// Content: BIO 166, CHE 444, CHE 344, CHE 249, MAT 226 only (no org chem / physics).

const _legacyPacingGuide = typeof renderPacingGuide === 'function' ? renderPacingGuide : null;
const _legacyExamCenter = typeof renderExamCenter === 'function' ? renderExamCenter : null;
const _legacyToggleReview = typeof toggleReview === 'function' ? toggleReview : null;

const SCIENCE_COURSES = ['bio', 'che444', 'che344', 'che249'];

const TOPIC_GROUPS = {
  bio: [
    { label: 'FOUNDATIONS', slugs: ['macromolecules', 'cell-structure-membranes'] },
    { label: 'METABOLISM & ENZYMES', slugs: ['enzyme-kinetics', 'cellular-energetics', 'cellular-respiration', 'photosynthesis'] },
    { label: 'CELL CYCLE & GENETICS', slugs: ['cell-division', 'mendelian-molecular-genetics', 'evolution'] },
  ],
  che444: [
    { label: 'EXAM I — BIOMOLECULES', slugs: ['amino-acids', 'protein-structure-1-4', 'enzyme-kinetics-michaelis-menten', 'lipids-membranes'] },
    { label: 'EXAM II — METABOLISM', slugs: ['bioenergetics-thermodynamics', 'glycolysis-10-steps', 'tca-cycle-8-steps'] },
    { label: 'EXAM III — OXIDATIVE', slugs: ['oxidative-phosphorylation', 'fatty-acid-oxidation'] },
  ],
  che344: [
    { label: 'GASES & KMT', slugs: ['ideal-gas-law-real-gases', 'kinetic-molecular-theory-molecular-speeds'] },
    { label: 'THERMODYNAMICS', slugs: ['first-law-of-thermodynamics', 'second-third-laws-gibbs-free-energy'] },
    { label: 'EQUILIBRIUM & STAT MECH', slugs: ['chemical-equilibrium-vanthoff', 'statistical-thermodynamics-fundamentals'] },
  ],
  che249: [
    { label: 'STATISTICS & ERROR', slugs: ['error-analysis-classification', 'foundational-statistical-equations', 'propagation-of-error'] },
    { label: 'SPECTROSCOPY & ACID–BASE', slugs: ['beer-lambert-law', 'henderson-hasselbalch-buffer-chemistry'] },
    { label: 'ELECTROCHEM & SEPARATIONS', slugs: ['nernst-equation-electrochemistry', 'edta-complexometric-titrations', 'chromatography-separations'] },
  ],
};

const topicHubState = {};
const examState = {};
const TOPIC_DONE_KEY = 'study-hub-topic-done';

function courseAccent(course) {
  const map = { bio: '--bio', che444: '--che444', che344: '--che344', che249: '--che249', mat226: '--mat226' };
  return map[course] || '--gold';
}

function courseColorVar(course) {
  const map = { bio: 'var(--bio)', che444: 'var(--che444)', che344: 'var(--che344)', che249: 'var(--che249)', mat226: 'var(--mat226)' };
  return map[course] || 'var(--gold)';
}

function getConceptRows(course) {
  return CONCEPT_SYLLABUS[course] || [];
}

function conceptCodeForSlug(course, slug) {
  const rows = getConceptRows(course);
  const idx = rows.findIndex(r => r.slug === slug);
  return idx >= 0 ? 'C' + (idx + 1) : '';
}

function getReviewForSlug(course, slug) {
  const bank = CONCEPT_REVIEWS_BY_SLUG[course];
  if (!bank) return null;
  return bank[slug] || null;
}

function getLearningMeta(course, slug) {
  const bank = typeof CONCEPT_LEARNING_META !== 'undefined' && CONCEPT_LEARNING_META[course];
  if (!bank) return null;
  return bank[slug] || null;
}

function renderLearningFrame(course, slug) {
  const meta = getLearningMeta(course, slug);
  const row = (CONCEPT_SYLLABUS[course] || []).find(r => r.slug === slug);
  if (!meta && !row) return '';
  const col = courseColorVar(course);
  return `
    <div class="learning-frame" style="border-left-color:${col}">
      <div class="learning-path">
        <span class="lp-step lp-active">1 · Learn</span>
        <span class="lp-arrow">→</span>
        <span class="lp-step">2 · Practice</span>
        <span class="lp-arrow">→</span>
        <span class="lp-step">3 · Past Exams</span>
      </div>
      ${meta ? `
        <p class="learning-purpose"><strong>Why this matters:</strong> ${meta.purpose}</p>
        <p class="learning-use"><strong>How you use it:</strong> ${meta.use}</p>
        <p class="learning-exam"><strong>Exam focus:</strong> ${meta.examNote}</p>
      ` : ''}
    </div>`;
}

function getModuleForSlug(course, slug) {
  const data = CONCEPT_WALKTHROUGHS[course];
  if (!data) return null;
  const row = (CONCEPT_SYLLABUS[course] || []).find(r => r.slug === slug);
  if (row) {
    const byId = data.modules.find(m => m.id === row.moduleId);
    if (byId) return byId;
  }
  return data.modules.find(m => slugifyTitle(m.title) === slug) || null;
}

function getTopicDoneSet(course) {
  try {
    const all = JSON.parse(localStorage.getItem(TOPIC_DONE_KEY) || '{}');
    return new Set(all[course] || []);
  } catch (e) {
    return new Set();
  }
}

function setTopicDone(course, slug, done) {
  try {
    const all = JSON.parse(localStorage.getItem(TOPIC_DONE_KEY) || '{}');
    const set = new Set(all[course] || []);
    if (done) set.add(slug); else set.delete(slug);
    all[course] = [...set];
    localStorage.setItem(TOPIC_DONE_KEY, JSON.stringify(all));
  } catch (e) { /* ignore */ }
}

function examWeightLine(course, row) {
  if (!row) return '';
  const w = row.week || '';
  if (/exam/i.test(w)) return w + ' — high-yield for this exam; also review before the final';
  if (course === 'bio') return w + ' — maps to BIO 166 midterm / final units';
  if (course === 'che344') return w + ' — physical chemistry exam unit';
  if (course === 'che249') return w + ' — analytical exam chapter cluster';
  return w + ' — syllabus order';
}

function getCourseResourcesHTML(course) {
  const el = document.getElementById(course + '-resources');
  if (!el) return '<p class="sessions-empty">No external resources listed for this course.</p>';
  return '<div class="topic-resources-wrap">' + el.innerHTML + '</div>';
}

function initTopicHubState(course) {
  if (!topicHubState[course]) {
    const rows = getConceptRows(course);
    topicHubState[course] = {
      slug: rows.length ? rows[0].slug : null,
      inner: 'rules',
    };
  }
  return topicHubState[course];
}

function renderOneConceptModule(course, m, accent) {
  if (!m) return '<p class="sessions-empty">Walkthrough content not found for this topic.</p>';
  const row = syllabusRowForModule(course, m.id, m.title);
  const slug = row ? row.slug : slugifyTitle(m.title);
  const idx = moduleSyllabusIndex(course, m);
  const code = idx < 999 ? 'C' + (idx + 1) : '';
  const weekPill = row
    ? '<span class="pill pill-muted">' + code + ' · ' + row.week + '</span>'
    : '';
  return `
    <article class="concept-module concept-module-inline" id="${course}-${m.id}-inline" data-concept-slug="${slug}">
      <header class="concept-module-hd">${weekPill}<h2 class="concept-module-title">${m.title}</h2></header>
      <figure class="cv-slide cv-intro">
        <div class="cv-slide-label">Visual · Overview</div>
        <div class="cv-slide-frame">${m.introSvg}</div>
        <figcaption>${m.introCap}</figcaption>
      </figure>
      <div class="cv-text" style="border-left-color:var(${accent})">${m.text}</div>
      <figure class="cv-slide cv-reinforce">
        <div class="cv-slide-label">Visual · Application</div>
        <div class="cv-slide-frame">${m.reinforceSvg}</div>
        <figcaption>${m.reinforceCap}</figcaption>
      </figure>
    </article>`;
}

function renderConceptReviewForSlug(course, slug, opts) {
  const compact = opts && opts.compact;
  const block = getReviewForSlug(course, slug);
  if (!block) {
    return '<p class="sessions-empty">Practice problems for this topic are being expanded. Use Past Exams for full-length practice.</p>';
  }
  const typeLabels = { concept: 'Core', apply: 'Apply', analyze: 'Analyze', synthesize: 'Synthesize', exam: 'Exam angle' };
  return `
    <div class="review-block card concept-review-inline${compact ? ' review-compact' : ''}">
      ${compact ? '' : `<p class="review-bridge">${block.bridge}</p>`}
      <p class="practice-count">${block.questions.length} problems · work in order (each adds a new angle)</p>
      ${block.questions.map((q, qi) => {
        const typeLabel = typeLabels[q.type] || q.type;
        const key = course + '-cs-' + slug + '-' + qi;
        const open = reviewOpen[key];
        return `<div class="qcard-app">
          <div class="qcard-app-hd" onclick="toggleReview('${key}')">
            <span class="qcard-app-tag ${q.type}">${typeLabel}</span>
            <span class="qcard-app-q">${q.q}</span>
            <span class="qcard-app-toggle">${open ? 'hide' : 'reveal'}</span>
          </div>
          <div class="qcard-app-body ${open ? 'open' : ''}" id="rev-body-${key}">
            <p class="qcard-app-hint"><strong>Hint:</strong> ${q.hint}</p>
            <div class="qcard-app-sol"><strong>Solution:</strong> ${q.solution}</div>
          </div>
        </div>`;
      }).join('')}
    </div>`;
}

function renderTopicInnerPane(course) {
  const st = initTopicHubState(course);
  const slug = st.slug;
  if (!slug) return '<p class="sessions-empty">Select a topic from the left.</p>';

  const accent = courseAccent(course);
  const mod = getModuleForSlug(course, slug);

  if (st.inner === 'rules') {
    return renderLearningFrame(course, slug) + renderOneConceptModule(course, mod, accent);
  }
  if (st.inner === 'practice') {
    return renderLearningFrame(course, slug) +
      `<section class="topic-practice-panel">
        <h3 class="topic-practice-heading">Practice — apply what you learned</h3>
        <p class="topic-practice-lead">Work these after Key rules. Attempt each problem closed-book, then reveal hints. Each question adds a new angle on the material.</p>
        ${renderConceptReviewForSlug(course, slug)}
        <div class="topic-practice-cta">
          <button type="button" class="pacing-btn" onclick="setTopicInnerTab('${course}','rules')">← Back to Key rules</button>
          <button type="button" class="pacing-btn primary" style="background:${courseColorVar(course)}" onclick="switchTab('${course}','exams')">Past Exams →</button>
        </div>
      </section>`;
  }
  if (st.inner === 'resources') return getCourseResourcesHTML(course);
  return '';
}

function renderTopicDetail(course) {
  const st = initTopicHubState(course);
  const slug = st.slug;
  const rows = getConceptRows(course);
  const idx = rows.findIndex(r => r.slug === slug);
  const row = rows[idx];
  const code = conceptCodeForSlug(course, slug);
  const done = getTopicDoneSet(course).has(slug);
  const col = courseColorVar(course);

  const innerTabs = ['rules', 'practice', 'resources'].map(t => {
    const labels = { rules: 'Key rules', practice: 'Practice Qs', resources: 'Resources' };
    const active = st.inner === t ? ' active' : '';
    return `<button type="button" class="topic-inner-tab${active}" style="--topic-accent:${col}" onclick="setTopicInnerTab('${course}','${t}')">${labels[t]}</button>`;
  }).join('');

  const prevSlug = idx > 0 ? rows[idx - 1].slug : null;
  const nextSlug = idx < rows.length - 1 && idx >= 0 ? rows[idx + 1].slug : null;

  return `
    <div class="topic-detail">
      <header class="topic-detail-hd">
        <div>
          <h1 class="topic-detail-title">${code ? code + ' · ' : ''}${row ? row.unit : slug}</h1>
          <p class="topic-exam-weight">${examWeightLine(course, row)}</p>
        </div>
        <label class="topic-done-toggle">
          <input type="checkbox" ${done ? 'checked' : ''} onchange="toggleTopicDone('${course}','${slug}', this.checked)">
          Mark studied
        </label>
      </header>
      <div class="topic-inner-tabs">${innerTabs}</div>
      <div class="topic-inner-pane" id="${course}-topic-pane">${renderTopicInnerPane(course)}</div>
      <nav class="topic-prev-next">
        <button type="button" class="topic-nav-btn" ${prevSlug ? '' : 'disabled'} onclick="openTopicHub('${course}','${prevSlug || ''}')">← prev</button>
        <button type="button" class="topic-nav-btn" ${nextSlug ? '' : 'disabled'} onclick="openTopicHub('${course}','${nextSlug || ''}')">next →</button>
      </nav>
    </div>`;
}

function renderTopicsProgress(course) {
  const rows = getConceptRows(course);
  const done = getTopicDoneSet(course);
  const n = rows.length;
  const d = rows.filter(r => done.has(r.slug)).length;
  const pct = n ? Math.round(100 * d / n) : 0;
  return `<div class="topics-progress">
    <span class="topics-progress-count">${d}/${n}</span>
    <div class="topics-progress-track"><div class="topics-progress-fill" style="width:${pct}%"></div></div>
    <span class="topics-progress-pct">${pct}%</span>
  </div>`;
}

function renderTopicPills(course) {
  const st = initTopicHubState(course);
  const groups = TOPIC_GROUPS[course] || [{ label: 'TOPICS', slugs: getConceptRows(course).map(r => r.slug) }];
  const col = courseColorVar(course);
  let html = '';

  groups.forEach(grp => {
    html += `<div class="topic-group"><div class="topic-group-label">${grp.label}</div><div class="topic-pills">`;
    grp.slugs.forEach(slug => {
      const row = getConceptRows(course).find(r => r.slug === slug);
      if (!row) return;
      const code = conceptCodeForSlug(course, slug);
      const active = st.slug === slug ? ' active' : '';
      const short = row.unit.length > 28 ? row.unit.slice(0, 26) + '…' : row.unit;
      html += `<button type="button" class="topic-pill${active}" style="--topic-accent:${col}" onclick="openTopicHub('${course}','${slug}')" title="${row.unit}">${code} · ${short}</button>`;
    });
    html += '</div></div>';
  });
  return html;
}

function renderTopicsHub(course) {
  const host = document.getElementById(course + '-topics');
  if (!host) return;
  initTopicHubState(course);
  const name = (STUDY_SCHEDULE.courseNames && STUDY_SCHEDULE.courseNames[course]) || course;
  const data = CONCEPT_WALKTHROUGHS[course];
  let banner = '';
  if (data && data.banner) {
    banner = `<div class="overlap-banner" style="margin-bottom:14px"><strong>Note:</strong> ${data.banner}</div>`;
  }

  host.innerHTML = `
    <div class="topics-shell">
      <div class="topics-shell-hd">
        <strong>${name}</strong> — semester path: <em>Learn</em> (Key rules + diagrams) → <em>Practice</em> (concept problems) → <em>Past Exams</em> (full-length MC).
        ${renderTopicsProgress(course)}
      </div>
      ${banner}
      <div class="topics-layout">
        <aside class="topics-sidebar">${renderTopicPills(course)}</aside>
        <main class="topics-main" id="${course}-topic-main">${renderTopicDetail(course)}</main>
      </div>
    </div>`;
}

function openTopicHub(course, slug, innerTab) {
  if (!slug) return;
  const st = initTopicHubState(course);
  st.slug = slug;
  if (innerTab) st.inner = innerTab;
  showPanel(course, 'topics');
  const main = document.getElementById(course + '-topic-main');
  if (main) {
    main.innerHTML = renderTopicDetail(course);
  } else {
    renderTopicsHub(course);
  }
  document.querySelectorAll('.topic-pill').forEach(btn => {
    const on = btn.getAttribute('onclick') && btn.getAttribute('onclick').includes("'" + slug + "'");
    btn.classList.toggle('active', !!on);
  });
}

function setTopicInnerTab(course, tab) {
  const st = initTopicHubState(course);
  st.inner = tab;
  const pane = document.getElementById(course + '-topic-pane');
  if (pane) pane.innerHTML = renderTopicInnerPane(course);
  const col = courseColorVar(course);
  document.querySelectorAll('#' + course + '-topic-main .topic-inner-tab').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('onclick') && btn.getAttribute('onclick').includes("'" + tab + "'"));
  });
}

function toggleTopicDone(course, slug, checked) {
  setTopicDone(course, slug, checked);
  renderTopicsHub(course);
}

function initPacingPhaseOptions(course) {
  const sel = document.getElementById(course + '-pacing-phase');
  if (!sel || sel.dataset.filled === '1') return;
  (STUDY_SCHEDULE.phases || []).forEach((p, i) => {
    const opt = document.createElement('option');
    opt.value = String(i);
    opt.textContent = p.title;
    sel.appendChild(opt);
  });
  sel.dataset.filled = '1';
}

function renderCourseSchedule(course) {
  const host = document.getElementById(course + '-schedule');
  if (!host) return;
  const name = (STUDY_SCHEDULE.courseNames && STUDY_SCHEDULE.courseNames[course]) || course;
  const color = courseColorVar(course);

  if (!host.dataset.shellReady) {
    host.innerHTML = `
      <div class="schedule-course-shell">
        <div class="sessions-hero">
          <div class="sessions-hero-text">
            <strong>${name} — Study Schedule</strong><br>
            Each card is one timed block from your master calendar. Open the topic for Key rules + practice, then Past Exams when ready.
          </div>
          <div id="${course}-sessions-progress" class="sessions-progress"></div>
        </div>
        <div class="schedule-course-controls">
          <label>Phase
            <select id="${course}-pacing-phase" onchange="renderCourseSchedule('${course}')">
              <option value="-1">All phases</option>
            </select>
          </label>
          <button type="button" class="pacing-btn" onclick="showSchedule()">Open full calendar</button>
        </div>
        <div id="${course}-pacing" class="course-pacing-mount"></div>
      </div>`;
    host.dataset.shellReady = '1';
    initPacingPhaseOptions(course);
  }

  const phaseSel = document.getElementById(course + '-pacing-phase');
  const phaseFilter = phaseSel ? parseInt(phaseSel.value, 10) : -1;

  if (_legacyPacingGuide) {
    const savedFilter = phaseFilter;
    _legacyPacingGuide(course);
    if (phaseSel) phaseSel.value = String(savedFilter);
    const pacing = document.getElementById(course + '-pacing');
    if (pacing) {
      const dupHero = pacing.querySelector('.sessions-hero');
      if (dupHero) dupHero.remove();
    }
  }

  const progressEl = document.getElementById(course + '-sessions-progress');
  if (progressEl && typeof updateSessionsProgress === 'function') {
    updateSessionsProgress(course);
  }
}

function renderPacingGuide(course) {
  if (SCIENCE_COURSES.includes(course)) {
    renderCourseSchedule(course);
    return;
  }
  if (_legacyPacingGuide) _legacyPacingGuide(course);
}

function renderStudyHub(course) {
  renderTopicsHub(course);
}

function renderStudySessions(course) {
  renderCourseSchedule(course);
}

// --- Past Exams (MC quizzes) ---

function getExamList(course) {
  return COURSE_EXAMS[course] || [];
}

function initExamState(course, examId) {
  if (!examState[course]) examState[course] = {};
  if (!examState[course][examId]) {
    examState[course][examId] = { idx: 0, score: 0, answered: false, chosen: null };
  }
  return examState[course][examId];
}

function renderExamQuiz(course, examId) {
  const mount = document.getElementById(course + '-exam-mount');
  if (!mount) return;
  const exams = getExamList(course);
  const exam = exams.find(e => e.id === examId) || exams[0];
  if (!exam) {
    mount.innerHTML = '<p class="sessions-empty">Exam questions for this course are loading.</p>';
    return;
  }
  examId = exam.id;
  const s = initExamState(course, examId);
  const questions = exam.questions;
  const col = courseColorVar(course);

  let tabHtml = '<div class="exam-tab-bar">';
  exams.forEach(ex => {
    const active = ex.id === examId ? ' active' : '';
    const n = ex.questions.length;
    tabHtml += `<button type="button" class="exam-tab-btn${active}" style="--exam-accent:${col}" onclick="switchCourseExam('${course}','${ex.id}')">${ex.title}<span class="exam-tab-count">${n} Q</span></button>`;
  });
  tabHtml += '</div>';

  if (s.idx >= questions.length) {
    mount.innerHTML = tabHtml + `
      <div class="quiz-card">
        <div class="quiz-q">${exam.title} — complete</div>
        <p style="font-size:14px;color:var(--text1);margin:8px 0 16px">Score: ${s.score} / ${questions.length} (${Math.round(100 * s.score / questions.length)}%)</p>
        <button class="quiz-next show" onclick="resetExamQuiz('${course}','${examId}')">Retake this exam</button>
      </div>`;
    return;
  }

  const q = questions[s.idx];
  const optsHtml = q.opts.map((opt, i) => {
    let cls = '';
    if (s.answered) {
      if (i === q.ans) cls = ' correct';
      else if (i === s.chosen && i !== q.ans) cls = ' wrong';
    }
    return `<button class="qopt${cls}" onclick="answerExamQuiz('${course}','${examId}',${i})" ${s.answered ? 'disabled' : ''}>${opt}</button>`;
  }).join('');

  mount.innerHTML = tabHtml + `
    <div class="exam-center-intro">
      <strong>Past Exams</strong> — ${questions.length} MC questions per exam, drawn from lecture concepts and designed to push critical thinking.
      Complete concept practice first; exams reinforce high-level integration and exam-style reasoning. Work closed-book, then read each explanation.
    </div>
    <div class="quiz-card">
      <div class="quiz-score">Question ${s.idx + 1} of ${questions.length} · Score: ${s.score}</div>
      <div class="quiz-q">${q.q}</div>
      <div class="quiz-opts">${optsHtml}</div>
      <div class="quiz-exp ${s.answered ? 'show' : ''}">${q.exp}</div>
      <button class="quiz-next ${s.answered ? 'show' : ''}" onclick="nextExamQuiz('${course}','${examId}')">Next question →</button>
    </div>`;
}

function switchCourseExam(course, examId) {
  if (!examState[course]) examState[course] = {};
  examState[course]._active = examId;
  initExamState(course, examId);
  renderExamQuiz(course, examId);
}

function resetExamQuiz(course, examId) {
  examState[course][examId] = { idx: 0, score: 0, answered: false, chosen: null };
  renderExamQuiz(course, examId);
}

function answerExamQuiz(course, examId, choice) {
  const s = examState[course][examId];
  if (!s || s.answered) return;
  s.answered = true;
  s.chosen = choice;
  const exam = getExamList(course).find(e => e.id === examId);
  if (exam && choice === exam.questions[s.idx].ans) s.score++;
  renderExamQuiz(course, examId);
}

function nextExamQuiz(course, examId) {
  const s = examState[course][examId];
  s.idx++;
  s.answered = false;
  s.chosen = null;
  renderExamQuiz(course, examId);
}

function renderExamCenter(course) {
  const exams = getExamList(course);
  if (!exams.length) {
    const mount = document.getElementById(course + '-exam-mount');
    if (mount) mount.innerHTML = '<p class="sessions-empty">Exam bank not available for this course.</p>';
    return;
  }
  if (!examState[course]) examState[course] = {};
  const active = examState[course]._active || exams[0].id;
  examState[course]._active = active;
  renderExamQuiz(course, active);
}

function toggleReview(key) {
  reviewOpen[key] = !reviewOpen[key];
  const course = key.split('-')[0];
  if (key.includes('-cs-')) {
    const st = topicHubState[course];
    if (st && st.slug) {
      const pane = document.getElementById(course + '-topic-pane');
      if (pane && st.inner === 'practice') pane.innerHTML = renderConceptReviewForSlug(course, st.slug);
      else if (document.getElementById(course + '-topic-main')) {
        document.getElementById(course + '-topic-main').innerHTML = renderTopicDetail(course);
      }
    }
    return;
  }
  if (_legacyToggleReview) _legacyToggleReview(key);
}

function openFullWalkthrough(course, slug) {
  openTopicHub(course, slug, 'rules');
}

function onConceptStudySelect(course, selectEl) {
  openTopicHub(course, selectEl.value || '');
}

// Override jump from schedule cards
function patchJumpToConcept() {
  if (typeof jumpToConcept !== 'function') return;
  window._legacyJumpToConcept = jumpToConcept;
  window.jumpToConcept = function(course, slug) {
    if (SCIENCE_COURSES.includes(course)) {
      openTopicHub(course, slug, 'rules');
      return;
    }
    if (window._legacyJumpToConcept) window._legacyJumpToConcept(course, slug);
  };
}

function normalizeCourseTab(tab) {
  if (tab === 'concepts' || tab === 'resources' || tab === 'review' || tab === 'pacing') {
    if (tab === 'pacing') return 'schedule';
    return 'topics';
  }
  return tab;
}

function initScienceCourseTabs() {
  SCIENCE_COURSES.forEach(c => {
    renderTopicsHub(c);
    renderExamCenter(c);
  });
  patchJumpToConcept();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initScienceCourseTabs);
} else {
  setTimeout(initScienceCourseTabs, 0);
}
