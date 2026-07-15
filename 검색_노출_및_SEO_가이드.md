# 🔍 일본어 여행 회화 앱 - 검색 포털 노출 및 SEO 등록 가이드

이 가이드는 완성된 일본어 여행 회화 웹앱을 **구글(Google)과 네이버(Naver) 검색 결과에 무료로 노출시키고 최적화(SEO)하기 위한 실무 가이드**입니다. (광고는 포함하지 않은 순수 노출 가이드입니다.)

---

## 1. 사전 준비 (웹사이트 공개 배포)
검색 엔진에 등록하기 전에 먼저 웹사이트가 인터넷상에 공개된 고유한 주소(URL)를 가지고 있어야 합니다.
* **추천 배포 플랫폼**: **Vercel** (현재 프로젝트 구조가 Vercel Serverless Function `/api/tts.js`를 사용하므로 Vercel 배포를 강력히 권장합니다. 무료 플랜으로 충분합니다.)
* **예시 배포 주소**: `https://japanese-wine.vercel.app` 또는 개인 도메인

---

## 2. 구글(Google) 검색 노출 등록 단계

구글 크롤러(Googlebot)가 사이트를 수집해가도록 등록하는 과정입니다.

1. **[구글 서치 콘솔](https://search.google.com/search-console/about) 접속 및 로그인**
2. **속성 추가**:
   * **URL 접두사** 방식 선택 -> 배포된 웹사이트 주소(예: `https://japanese-wine.vercel.app`) 입력 후 [계속] 클릭.
3. **소유권 인증**:
   * 가장 간편한 **HTML 태그** 인증 방식 선택.
   * 제공되는 메타태그(예: `<meta name="google-site-verification" content="..." />`) 복사.
   * `index.html` 파일의 `<head>` 영역 안에 붙여넣고 사이트 재배포(Push).
   * 서치 콘솔 화면에서 [확인] 버튼 클릭하여 인증 완료.
4. **사이트맵 제출**:
   * 서치 콘솔 왼쪽 메뉴에서 **[Sitemaps]** 클릭.
   * 새 사이트맵 추가 창에 `sitemap.xml` 입력 후 [제출] 클릭.

---

## 3. 네이버(Naver) 검색 노출 등록 단계

네이버 크롤러(Yeti)가 사이트를 수집해가도록 등록하는 과정입니다.

1. **[네이버 서치어드바이저](https://searchadvisor.naver.com/) 접속 및 로그인**
2. **웹마스터 도구** 바로가기 클릭.
3. **사이트 등록**:
   * 배포된 웹사이트 주소 입력 후 추가.
4. **소유권 확인**:
   * **HTML 태그** 방식 선택 -> 제공되는 초록색 메타태그(예: `<meta name="naver-site-verification" content="..." />`) 복사.
   * `index.html` 의 `<head>` 영역 안에 붙여넣고 재배포.
   * 네이버 화면에서 [소유권 확인] 클릭.
5. **사이트맵 및 RSS 제출**:
   * 왼쪽 메뉴의 **[요청]** ➡️ **[사이트맵 제출]** 클릭.
   * `sitemap.xml` 입력 후 확인.

---

## 4. SEO 필수 파일 구성안

검색 엔진 로봇이 방문했을 때 읽어가는 두 가지 필수 파일입니다. 프로젝트 루트 경로에 새로 생성하여 배포해두면 노출이 빨라집니다.

### A. robots.txt (검색 로봇 규칙 정의 파일)
웹사이트의 모든 페이지를 검색 로봇이 긁어갈 수 있도록 허용하는 설정입니다.

* **파일명**: `robots.txt`
* **파일 내용**:
  ```text
  User-agent: *
  Allow: /
  
  Sitemap: https://japanese-wine.vercel.app/sitemap.xml
  ```
  *(※ `https://japanese-wine.vercel.app` 부분은 실제 배포된 주소로 변경하여 저장하세요.)*

### B. sitemap.xml (사이트 지도 파일)
구글/네이버 로봇에게 웹사이트에 어떤 페이지들이 있는지 명세하는 파일입니다. 본 앱은 단일 페이지 웹(SPA) 구조이므로 홈 화면 하나만 등록해 주면 됩니다.

* **파일명**: `sitemap.xml`
* **파일 내용**:
  ```xml
  <?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
      <loc>https://japanese-wine.vercel.app/</loc>
      <lastmod>2026-07-15</lastmod>
      <changefreq>monthly</changefreq>
      <priority>1.0</priority>
    </url>
  </urlset>
  ```
  *(※ `<loc>` 태그 안의 주소는 실제 배포된 주소로 변경하세요.)*

---

## 5. 현재 앱에 적용된 HTML Meta 태그 정보
검색 결과에 제목과 설명이 예쁘게 나오도록 `index.html`에 이미 검색 최적화 태그가 기본적으로 작성되어 있습니다. 필요시 수정하여 사용할 수 있습니다.

```html
<!-- 기본 검색 최적화 메타 태그 -->
<title>일본어 여행 회화 가이드 - 간편한 음성 재생 PWA</title>
<meta name="description" content="일본 여행 시 바로 사용하는 상황별 기초 필수 회화 가이드. 발음 듣기 지원 및 홈 화면 추가 가능.">
<meta name="keywords" content="일본어 회화, 여행 일본어, 일본 여행, 기초 일본어, 일본어 발음">

<!-- 카카오톡, 페이스북 공유 시 노출되는 오픈그래프(OG) 태그 -->
<meta property="og:type" content="website">
<meta property="og:title" content="일본어 여행 회화 가이드">
<meta property="og:description" content="터치 한 번으로 원어민 발음이 재생되는 간편한 일본어 여행 회화 서비스">
<meta property="og:image" content="https://japanese-wine.vercel.app/icon-512.png">
<meta property="og:url" content="https://japanese-wine.vercel.app/">
```

---

## 💡 자주 묻는 질문 (FAQ)
* **Q. 네이버나 구글에 등록할 때 비용이 발생하나요?**
  * **A.** 아니요, 검색 노출 등록은 **100% 무료**입니다. 비용 요구나 대행 업체 결제는 전혀 필요하지 않습니다.
* **Q. 등록하고 나면 검색 노출까지 얼마나 걸리나요?**
  * **A.** 보통 등록 완료 후 **3일에서 1주일 정도** 지나면 포털 사이트에 사이트명이 검색되기 시작합니다.
* **Q. 광고(애드센스)는 나중에 따로 달 수 있나요?**
  * **A.** 네, 사이트 트래픽이 쌓인 후 구글 애드센스에 따로 신청하여 심사를 통과하면 언제든 원하는 시점에 코드를 추가해 광고를 달 수 있습니다.
