# Server API
엔드포인트: POST /api/sync
설명: 생성 시 leaderPasscode 받아서 해싱 저장
────────────────────────────────────────
엔드포인트: POST /api/sync/:id/verify-leader
설명: Leader passcode 검증
────────────────────────────────────────
엔드포인트: PATCH /api/sync/:id
설명: Sync 수정 (제목, 설명)
────────────────────────────────────────
엔드포인트: POST /api/sync/:id/time-options
설명: Time Option 추가
────────────────────────────────────────
엔드포인트: DELETE /api/sync/:id/time-options/:optionId
설명: Time Option 삭제
────────────────────────────────────────
엔드포인트: DELETE /api/sync/:id
설명: Sync 삭제

<!-- ## Client follow up
Sync 생성 폼에 Leader passcode 입력 추가
상세 페이지에 "Edit" 버튼 → passcode 입력 → 수정 모드
수정/삭제 UI -->