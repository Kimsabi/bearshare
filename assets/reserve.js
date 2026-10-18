// Bearshare 대관신청 시간표 (시제품: 데이터는 모두 예시이며 저장되지 않음)
(function () {
  // ── 예시 데이터 ──────────────────────────────────────────
  // 날짜: 2026-10-18(일) ~ 10-24(토)
  const DAYS = [
    { d: 18, w: '일', weekend: true },
    { d: 19, w: '월', weekend: false },
    { d: 20, w: '화', weekend: false },
    { d: 21, w: '수', weekend: false },
    { d: 22, w: '목', weekend: false },
    { d: 23, w: '금', weekend: false },
    { d: 24, w: '토', weekend: true }
  ];

  const SPACES = [
    { id: 'bt', name: '베어토피아', sub: '시범 운영' },
    { id: 'au', name: '외국어대학 강당', sub: '200석 · 가상' },
    { id: 'fd', name: '대운동장', sub: '야간 조명' },
    { id: 'gy', name: '체육관', sub: '코트 3면 · 가상' },
    { id: 'ca', name: '강의실 A', sub: '40석 · 가상' },
    { id: 'cb', name: '강의실 B', sub: '60석 · 가상' },
    { id: 'cc', name: '강의실 C', sub: '24석 · 가상' }
  ];

  // 시간 칸: 0 = 09:00, 1 = 09:30 ... 25 = 21:30 (마지막 칸이 22:00에 끝남)
  const SLOTS = 26;

  // 예약된 시간 (a = 시작 칸, b = 끝 칸(포함 안 함))
  const BOOKINGS = {
    0: [{ sp: 'bt', a: 2, b: 6, label: '안서동 독서 모임' }, { sp: 'fd', a: 18, b: 22, label: '동남구 조기축구회' }, { sp: 'cb', a: 10, b: 14, label: '원데이: 엑셀 첫걸음' }],
    1: [{ sp: 'bt', a: 8, b: 12, label: '토익 스터디' }, { sp: 'gy', a: 21, b: 24, label: '배드민턴 동호회' }, { sp: 'ca', a: 20, b: 23, label: '주민 영어회화' }],
    2: [{ sp: 'bt', a: 20, b: 24, label: '보드게임 소모임' }, { sp: 'au', a: 20, b: 26, label: '주민 합창단 연습' }],
    3: [{ sp: 'bt', a: 4, b: 8, label: '육아 정보 모임' }, { sp: 'fd', a: 20, b: 24, label: '풋살 동호회' }],
    4: [{ sp: 'gy', a: 21, b: 24, label: '원데이: 배드민턴' }, { sp: 'cc', a: 20, b: 22, label: '창업 스터디' }],
    5: [{ sp: 'bt', a: 18, b: 22, label: '뜨개질 모임' }, { sp: 'ca', a: 22, b: 26, label: '코딩 스터디' }],
    6: [{ sp: 'bt', a: 10, b: 14, label: '원데이: 스마트폰 사진' }, { sp: 'gy', a: 18, b: 22, label: '농구 동호회' }, { sp: 'au', a: 6, b: 12, label: '주민 음악회 리허설' }]
  };

  // ── 운영 규칙 ────────────────────────────────────────────
  // 평일: 베어토피아 09–22시, 그 외 19–22시
  // 주말: 체육관·대운동장 18–22시, 그 외 09–22시
  function openFrom(spaceId, weekend) {
    if (spaceId === 'bt') return 0;
    if (weekend) return (spaceId === 'fd' || spaceId === 'gy') ? 18 : 0;
    return 20;
  }

  // ── 상태 ────────────────────────────────────────────────
  const state = { day: 1, sel: null, agree: false, submitted: false };

  const $ = (id) => document.getElementById(id);
  const time = (i) => {
    const m = 540 + i * 30;
    const h = Math.floor(m / 60);
    return String(h).padStart(2, '0') + ':' + (m % 60 === 0 ? '00' : '30');
  };
  const bookedAt = (spaceId, i) => (BOOKINGS[state.day] || []).find((b) => b.sp === spaceId && i >= b.a && i < b.b);
  const isFree = (spaceId, i) => i >= openFrom(spaceId, DAYS[state.day].weekend) && !bookedAt(spaceId, i);

  function pick(spaceId, i) {
    const cur = state.sel;
    if (cur && cur.sp === spaceId && cur.b - cur.a === 1) {
      if (i === cur.a) { state.sel = null; }
      else {
        const a = Math.min(cur.a, i);
        const b = Math.max(cur.a, i) + 1;
        let ok = true;
        for (let k = a; k < b; k++) if (!isFree(spaceId, k)) ok = false;
        state.sel = ok ? { sp: spaceId, a, b } : { sp: spaceId, a: i, b: i + 1 };
      }
    } else {
      state.sel = { sp: spaceId, a: i, b: i + 1 };
    }
    state.submitted = false;
    render();
  }

  // ── 그리기 ──────────────────────────────────────────────
  function renderDays() {
    const box = $('days');
    box.innerHTML = '';
    DAYS.forEach((d, idx) => {
      const on = idx === state.day;
      const tone = d.w === '일' ? '#B4441C' : (d.w === '토' ? '#1D4E9E' : '#1A2233');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('aria-label', '10월 ' + d.d + '일 ' + d.w + '요일');
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      btn.style.cssText = 'display:flex; flex-direction:column; align-items:center; gap:2px; padding:10px 0; min-width:64px; flex:1 1 64px; border-radius:12px; font:inherit; cursor:pointer; ' +
        (on ? 'background:#0B2A5B; color:#FFFFFF; border:1px solid #0B2A5B;' : 'background:#FFFFFF; color:' + tone + '; border:1px solid #DDE2EA;');
      btn.innerHTML = '<span style="font-size:13px">' + d.w + '</span><strong style="font-size:20px">' + d.d + '</strong>';
      btn.addEventListener('click', () => { state.day = idx; state.sel = null; state.submitted = false; render(); });
      box.appendChild(btn);
    });
    $('ruleText').textContent = DAYS[state.day].weekend
      ? '주말 운영: 체육관·대운동장 18:00–22:00 · 그 외 공간 09:00–22:00'
      : '평일 운영: 베어토피아 09:00–22:00 · 그 외 공간 19:00–22:00 (낮 시간은 수업·학생 이용)';
  }

  function renderGrid() {
    const grid = $('grid');
    const cols = 'display:grid; grid-template-columns:64px repeat(' + SPACES.length + ', minmax(96px, 1fr));';
    const weekend = DAYS[state.day].weekend;
    let html = '<div style="' + cols + ' background:#F5F7FB; border-bottom:1px solid #DDE2EA">' +
      '<div style="padding:10px 8px; font-size:12px; color:#5A6475; text-align:right">시간</div>';
    SPACES.forEach((sp) => {
      html += '<div style="padding:10px 8px; border-left:1px solid #E3E7EE; display:flex; flex-direction:column; gap:2px">' +
        '<strong style="font-size:13px">' + sp.name + '</strong><span style="font-size:11px; color:#5A6475">' + sp.sub + '</span></div>';
    });
    html += '</div>';

    for (let i = 0; i < SLOTS; i++) {
      const half = i % 2 === 1;
      const line = half ? '1px solid #D5DBE5' : '1px dashed #E8ECF2';
      html += '<div style="' + cols + '">';
      html += '<div style="height:28px; padding:0 8px; font-size:12px; line-height:28px; color:#5A6475; text-align:right; border-bottom:' + line + '">' + (half ? '' : time(i)) + '</div>';
      SPACES.forEach((sp) => {
        const bk = bookedAt(sp.id, i);
        const blocked = i < openFrom(sp.id, weekend);
        const sel = state.sel && state.sel.sp === sp.id && i >= state.sel.a && i < state.sel.b;
        let bg = '#FFFFFF', color = '#1D4E9E', label = '', status = '예약 가능', cursor = 'pointer', weight = 400;
        if (blocked) {
          bg = 'repeating-linear-gradient(135deg, #F1F3F7 0 6px, #E6EAF0 6px 12px)';
          color = '#5A6475'; status = '이용 불가'; cursor = 'not-allowed';
          if (i === 0) label = (weekend && (sp.id === 'fd' || sp.id === 'gy')) ? '18시부터 이용' : '수업·학생 이용';
        } else if (bk) {
          bg = '#DCE6F7'; color = '#16366E'; status = '예약됨'; cursor = 'not-allowed'; weight = 600;
          if (i === bk.a) label = bk.label;
        } else if (sel) {
          bg = '#1D4E9E'; color = '#FFFFFF'; status = '선택함'; weight = 700;
          if (i === state.sel.a) label = '선택';
        }
        const style = 'display:block; width:100%; height:28px; margin:0; border:0; border-left:1px solid #E3E7EE; border-bottom:' + line +
          '; padding:0 8px; background:' + bg + '; color:' + color + '; font:inherit; font-size:12px; font-weight:' + weight +
          '; text-align:left; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; cursor:' + cursor;
        html += '<button type="button" data-sp="' + sp.id + '" data-i="' + i + '"' + ((blocked || bk) ? ' disabled' : '') +
          ' aria-label="' + sp.name + ' ' + time(i) + '–' + time(i + 1) + ' ' + status + '" style="' + style + '">' + label + '</button>';
      });
      html += '</div>';
    }
    grid.innerHTML = html;
  }

  function renderSide() {
    const sel = state.sel;
    $('noSel').hidden = !!sel;
    $('selBox').hidden = !sel;
    $('selBox').style.display = sel ? 'flex' : 'none';
    if (sel) {
      const sp = SPACES.find((s) => s.id === sel.sp);
      const d = DAYS[state.day];
      $('selSpace').textContent = sp.name;
      $('selDate').textContent = '2026년 10월 ' + d.d + '일 (' + d.w + ')';
      $('selTime').textContent = time(sel.a) + ' – ' + time(sel.b) + ' · ' + ((sel.b - sel.a) * 30) + '분';
    }
    const can = !!sel && state.agree;
    const btn = $('submit');
    btn.disabled = !can;
    btn.style.cssText = 'height:52px; border-radius:10px; border:0; font:inherit; font-size:16px; font-weight:700; ' +
      (can ? 'background:#1D4E9E; color:#FFFFFF; cursor:pointer;' : 'background:#E3E7EE; color:#5A6475; cursor:not-allowed;');
    $('form').style.display = state.submitted ? 'none' : 'flex';
    $('done').hidden = !state.submitted;
    $('done').style.display = state.submitted ? 'flex' : 'none';
  }

  function render() { renderDays(); renderGrid(); renderSide(); }

  // ── 이벤트 ──────────────────────────────────────────────
  $('grid').addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-sp]');
    if (!btn || btn.disabled) return;
    pick(btn.dataset.sp, Number(btn.dataset.i));
  });
  $('agree').addEventListener('change', (e) => { state.agree = e.target.checked; renderSide(); });
  $('submit').addEventListener('click', () => { if (state.sel && state.agree) { state.submitted = true; renderSide(); } });
  $('reset').addEventListener('click', () => {
    state.sel = null; state.agree = false; state.submitted = false;
    $('agree').checked = false;
    render();
  });

  render();
})();
