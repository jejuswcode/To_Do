# 오늘의 할 일

할 일 추가·완료·삭제 및 Supabase 이메일 회원가입·로그인을 지원합니다.
supabase-js v2는 CDN으로 로드합니다. 할 일 목록은 현재 페이지 메모리에만 보관되며 계정별 DB 저장은 포함하지 않습니다.

## Vercel

이 저장소를 Vercel 프로젝트에 연결합니다. Framework Preset은 **Other**, 프로젝트 루트는 저장소 루트로 두고 Build Command와 Output Directory는 지정하지 않습니다. `api/config.js`는 Vercel Function으로 실행됩니다.

Vercel의 Supabase 연동으로 주입된 다음 변수를 사용합니다.

- URL: `SUPABASE_URL` 또는 `NEXT_PUBLIC_SUPABASE_URL`
- 공개 키: `SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 중 하나

변수를 Production 및 필요한 Preview 환경에 적용한 뒤 재배포합니다. 서비스 역할 키와 비밀 키는 사용하지 않습니다. `/api/config`는 URL과 공개 키만 반환합니다.

Supabase Authentication 설정에서 이메일 가입을 활성화하고, URL Configuration의 Site URL과 Redirect URLs에 실제 Vercel 앱 URL을 등록합니다. 이메일 인증이 활성화되어 있으면 가입 확인 메일의 링크를 연 뒤 로그인합니다.

로컬 인증 확인은 `vercel dev`와 해당 프로젝트 환경 변수로 실행합니다. `index.html`을 파일로 직접 열면 할 일 기능만 사용할 수 있습니다.

공식 문서: [Supabase 로그인](https://supabase.com/docs/reference/javascript/auth-signinwithpassword), [회원가입](https://supabase.com/docs/reference/javascript/auth-signup), [Vercel 환경 변수](https://vercel.com/docs/environment-variables).