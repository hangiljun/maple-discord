# 🔧 댓글 기능 활성화를 위한 Firestore 인덱스 설정

## 문제 상황
자유게시판 댓글 작성 시 댓글이 저장되지 않고 아무런 반응이 없는 문제가 발생합니다.

## 원인
Firestore에서 `board_comments` 컬렉션을 조회할 때 `where("postId", "==", id)`와 `orderBy("createdAt", "asc")`를 함께 사용하는데, 이 복합 쿼리를 위한 **인덱스**가 생성되지 않았기 때문입니다.

## 해결 방법 (3가지 중 선택)

### 방법 1: Firebase CLI로 자동 배포 (권장)

1. Firebase CLI 설치 (이미 설치되어 있다면 생략)
```bash
npm install -g firebase-tools
```

2. Firebase 로그인
```bash
firebase login
```

3. 프로젝트 폴더에서 인덱스 배포
```bash
firebase deploy --only firestore:indexes
```

### 방법 2: 브라우저에서 에러 메시지 링크 클릭

1. 브라우저에서 http://localhost:3001/board 접속
2. 아무 게시글에 들어가서 댓글 작성 시도
3. 브라우저 개발자 도구 콘솔(F12) 확인
4. 에러 메시지에 나오는 **인덱스 생성 링크**를 클릭
5. Firebase Console에서 자동으로 인덱스 생성

### 방법 3: Firebase Console에서 수동 생성

1. [Firebase Console](https://console.firebase.google.com/) 접속
2. 프로젝트(`maplediscord-cfc6a`) 선택
3. 좌측 메뉴에서 **Firestore Database** 클릭
4. 상단 탭에서 **인덱스** 클릭
5. **복합 인덱스 추가** 버튼 클릭
6. 다음과 같이 설정:
   - 컬렉션 ID: `board_comments`
   - 필드 1: `postId` (오름차순)
   - 필드 2: `createdAt` (오름차순)
7. **인덱스 만들기** 클릭

## 인덱스 생성 후
- 인덱스 생성은 보통 **1~5분** 정도 소요됩니다
- 인덱스 상태가 "사용 설정됨"으로 변경되면 댓글 기능이 정상 작동합니다
- 브라우저를 새로고침하고 다시 댓글 작성을 시도해보세요

## 수정된 파일
- ✅ `firestore.indexes.json` - 인덱스 정의 파일 추가
- ✅ `app/board/[id]/page.tsx` - 댓글 작성 에러 핸들링 개선

## 참고사항
- `firestore.indexes.json` 파일이 이미 생성되어 있으므로, Firebase CLI를 사용하는 방법 1이 가장 간단합니다
- 인덱스는 한 번만 생성하면 되며, 이후에는 자동으로 유지됩니다
