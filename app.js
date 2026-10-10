/* 유튜브 트렌드 랩 — YouTube Data API v3 인기 영상 분석 */
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const KEY_STORE = 'ytl_api_key';

  const CATS = {
    '1': '영화/애니', '2': '자동차', '10': '음악', '15': '동물', '17': '스포츠',
    '19': '여행', '20': '게임', '22': '일상/브이로그', '23': '코미디',
    '24': '엔터테인먼트', '25': '뉴스', '26': '노하우', '27': '교육', '28': '과학기술',
  };

  const STOP = new Set([
    '공식', 'official', 'mv', 'm/v', 'teaser', '티저', '예고', '속보', '단독', '현장',
    '영상', '뉴스', 'news', 'live', '라이브', '하이라이트', '풀버전', 'shorts', '쇼츠',
    'ep', '화', '회', '편', 'the', 'a', 'of', 'to', 'in', 'on', 'and', 'vs',
    '합니다', '입니다', '있는', '같은', '정말', '너무', '이번', '오늘', '내일',
  ]);

  /* ---------- 데모 데이터 ---------- */
  const DEMO = [
    { title: '신곡 뮤직비디오 최초 공개 🔥 역대급 퍼포먼스', channel: 'STAR MUSIC', views: 8420000, cat: '10' },
    { title: 'AI가 만든 영화 예고편, 헐리우드가 긴장하는 이유', channel: '테크 인사이트', views: 3210000, cat: '28' },
    { title: '자취생 10분 초간단 레시피 5가지 🍳', channel: '오늘의 요리', views: 2870000, cat: '26' },
    { title: '월드컵 예선 하이라이트 | 대한민국 vs 일본 풀버전', channel: '스포츠 투데이', views: 6540000, cat: '17' },
    { title: '100일 만에 집짓기 브이로그 (대반전 결말)', channel: '시골일기', views: 4120000, cat: '22' },
    { title: '신형 전기차 직접 타봤습니다, 주행거리 실측!', channel: '카 리뷰어', views: 1980000, cat: '2' },
    { title: '강아지가 아기를 처음 만났을 때 🐶👶', channel: '펫 파라다이스', views: 5230000, cat: '15' },
    { title: '주식 초보가 꼭 알아야 할 3가지 원칙', channel: '머니 스쿨', views: 1760000, cat: '27' },
    { title: '몰아보기 | 편의점 신상 털기 20종 리뷰', channel: '먹방 연구소', views: 3440000, cat: '24' },
    { title: '게임 신작 실황, 첫 보스전 노데미지 클리어', channel: '겜생겜사', views: 2310000, cat: '20' },
    { title: '제주도 2박 3일 뚜벅이 여행 코스 총정리', channel: '떠나자', views: 1890000, cat: '19' },
    { title: '개그맨들의 즉흥 콩트 대결, 빵 터졌습니다 😂', channel: '웃음 공장', views: 4760000, cat: '23' },
  ].map((v, i) => ({ ...v, id: 'demo' + i, thumb: null }));

  /* ---------- API 키 ---------- */
  const saved = localStorage.getItem(KEY_STORE);
  if (saved) $('apiKey').value = saved;
  $('saveKey').addEventListener('click', () => {
    const k = $('apiKey').value.trim();
    if (!k) { msg('키를 입력하세요.', 'err'); return; }
    localStorage.setItem(KEY_STORE, k);
    msg('API 키 저장됨 (이 브라우저에만 보관)', 'ok');
  });

  function msg(t, cls) {
    const m = $('apiMsg');
    m.textContent = t; m.className = 'msg ' + (cls || '');
  }

  /* ---------- 분석 실행 ---------- */
  $('analyzeBtn').addEventListener('click', async () => {
    const key = ($('apiKey').value || '').trim();
    if (!key) { msg('먼저 YouTube Data API 키를 입력·저장하세요.', 'err'); return; }
    localStorage.setItem(KEY_STORE, key);
    msg('불러오는 중…', '');
    $('analyzeBtn').disabled = true;
    try {
      const region = $('region').value, max = $('maxRes').value;
      const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&regionCode=${region}&maxResults=${max}&key=${encodeURIComponent(key)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || ('HTTP ' + res.status));
      const videos = (data.items || []).map((it) => ({
        id: it.id,
        title: it.snippet.title,
        channel: it.snippet.channelTitle,
        views: parseInt(it.statistics.viewCount || '0', 10),
        cat: it.snippet.categoryId,
        thumb: it.snippet.thumbnails?.medium?.url,
        published: it.snippet.publishedAt,
      }));
      if (!videos.length) throw new Error('결과가 없습니다.');
      msg(`인기 영상 ${videos.length}개 분석 완료`, 'ok');
      render(videos);
    } catch (e) {
      console.error(e);
      const m = /quota|403/.test(e.message) ? 'API 할당량 초과 또는 키 권한 문제입니다. 키를 확인하세요.'
        : /400/.test(e.message) ? 'API 키가 올바르지 않습니다.'
        : '불러오기 실패: ' + e.message;
      msg(m, 'err');
    } finally {
      $('analyzeBtn').disabled = false;
    }
  });

  $('demoBtn').addEventListener('click', () => {
    msg('데모 데이터로 표시 중 (실제 API 아님)', '');
    render(DEMO);
  });

  /* ---------- 키워드 추출 ---------- */
  function extractKeywords(videos) {
    const count = new Map();
    for (const v of videos) {
      const clean = v.title
        .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}]/gu, ' ')
        .replace(/#(\S+)/g, '$1')
        .replace(/[|\[\](){}<>"'“”‘’·…~!?,.:;\/\\\-_=+*#@%^&$]/g, ' ');
      for (let tok of clean.split(/\s+/)) {
        tok = tok.trim().toLowerCase();
        if (tok.length < 2 || /^\d+$/.test(tok) || STOP.has(tok)) continue;
        count.set(tok, (count.get(tok) || 0) + 1);
      }
    }
    return [...count.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15);
  }

  const fmtNum = (n) => n >= 100000000 ? (n / 100000000).toFixed(1) + '억'
    : n >= 10000 ? (n / 10000).toFixed(1) + '만' : String(n);

  /* ---------- 렌더 ---------- */
  function barChart(el, rows, color) {
    const max = Math.max(1, ...rows.map((r) => r[1]));
    el.innerHTML = rows.map(([name, val]) => `
      <div class="brow">
        <span class="bname" title="${escapeHtml(name)}">${escapeHtml(name)}</span>
        <div class="btrack"><div class="bfill" style="width:${(val / max) * 100}%;${color ? `background:${color};` : ''}"></div></div>
        <span class="bnum">${val}</span>
      </div>`).join('');
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function render(videos) {
    $('result').style.display = 'flex';
    const total = videos.reduce((a, v) => a + v.views, 0);
    const top = [...videos].sort((a, b) => b.views - a.views)[0];

    $('stCount').textContent = videos.length + '개';
    $('stViews').textContent = fmtNum(total);
    $('stAvg').textContent = fmtNum(Math.round(total / videos.length));
    $('stTop').textContent = `${top.title} (${fmtNum(top.views)}회)`;

    barChart($('kwChart'), extractKeywords(videos));

    const catCount = new Map();
    videos.forEach((v) => {
      const name = CATS[v.cat] || '기타';
      catCount.set(name, (catCount.get(name) || 0) + 1);
    });
    barChart($('catChart'), [...catCount.entries()].sort((a, b) => b[1] - a[1]), 'linear-gradient(90deg,#2f81f7,#00d4aa)');

    const chCount = new Map();
    videos.forEach((v) => chCount.set(v.channel, (chCount.get(v.channel) || 0) + 1));
    barChart($('chChart'), [...chCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10), 'linear-gradient(90deg,#a06bff,#ff7ab8)');

    $('videoList').innerHTML = [...videos].sort((a, b) => b.views - a.views).map((v, i) => `
      <a class="video" href="https://www.youtube.com/watch?v=${v.id}" target="_blank" rel="noopener">
        ${v.thumb ? `<img src="${v.thumb}" alt="" loading="lazy" />` : `<img alt="" />`}
        <div class="vbody">
          <div class="vtitle">${i + 1}. ${escapeHtml(v.title)}</div>
          <div class="vmeta">${escapeHtml(v.channel)} · 👀 ${fmtNum(v.views)} · ${CATS[v.cat] || '기타'}</div>
        </div>
      </a>`).join('');

    $('result').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
})();
