# 📺 유튜브 트렌드 랩 | YouTube Trend Lab

> 인기 영상·뜨는 키워드·조회수 실시간 분석  
> Real-time trending video and keyword analysis

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen?style=flat-square)](https://metasongi.github.io/youtube-trend-lab/) ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square)

🌐 **Live:** https://metasongi.github.io/youtube-trend-lab/

---

지금 유튜브에서 뜨는 영상·키워드·조회수를 실시간 분석하는 웹앱.


## 기능

- 📺 YouTube Data API v3 인기 급상승 영상 조회 (지역별: 한국/미국/일본/영국/대만)
- 🔥 제목 빈도 기반 **요즘 뜨는 키워드 TOP 15**
- 📂 카테고리 분포 · 🎙️ 자주 등장하는 채널
- 📊 총/평균 조회수, 1위 영상 요약 카드
- 🎬 인기 영상 목록 (썸네일·조회수·바로가기)
- 🎲 API 키 없이 보는 데모 모드

## API 키 발급 (무료)

1. [Google Cloud Console](https://console.cloud.google.com/apis/library/youtube.googleapis.com)에서 프로젝트 생성
2. "YouTube Data API v3" 사용 설정
3. 사용자 인증 정보 → API 키 만들기
4. 사이트 입력창에 붙여넣고 저장 (브라우저에만 보관)

무료 할당량 하루 10,000 유닛 — 인기 영상 50개 조회는 약 3 유닛.

## 기술

- Vanilla JS + Fetch API
- API 키는 localStorage에만 저장

---

## English Summary

Real-time trending video and keyword analysis.
