'use strict';
(() => {
  const get = id => document.getElementById(id);
  const dialog = get('auth-dialog'), form = get('auth-form');
  const email = get('auth-email'), password = get('auth-password');
  const message = get('auth-message'), submit = get('auth-submit');
  const switchButton = get('auth-switch'), login = get('open-login'), logout = get('logout');
  let client, initializing, signup = false, busy = false;
  function render(session) {
    const signedIn = !!session?.user;
    login.hidden = signedIn;
    logout.hidden = !signedIn;
    get('account-email').hidden = !signedIn;
    get('account-email').textContent = session?.user?.email || '';
  }
  function setBusy(value) {
    busy = value;
    for (const control of [submit, switchButton, email, password, logout]) control.disabled = value;
  }
  function errorText(error) {
    const messages = {
      invalid_credentials: '이메일 또는 비밀번호를 확인해 주세요.',
      email_not_confirmed: '이메일의 인증 링크를 먼저 확인해 주세요.',
      user_already_exists: '이미 가입한 이메일입니다. 로그인해 주세요.',
      weak_password: '더 강한 비밀번호를 입력해 주세요.',
      over_email_send_rate_limit: '메일 발송이 잠시 제한되었습니다. 잠시 후 다시 시도해 주세요.'
    };
    return messages[error.code] || error.message || '요청을 처리하지 못했습니다. 다시 시도해 주세요.';
  }
  function initialize() {
    if (initializing) return initializing;
    initializing = (async () => {
      const response = await fetch('/api/config', { cache: 'no-store' });
      if (!response.ok) throw new Error('로그인 설정을 불러오지 못했습니다. Vercel의 Supabase 환경 변수를 확인해 주세요.');
      const config = await response.json();
      if (!window.supabase) throw new Error('로그인 라이브러리를 불러오지 못했습니다. 새로고침해 주세요.');
      client = window.supabase.createClient(config.url, config.key);
      client.auth.onAuthStateChange((_event, session) => render(session));
      const { data, error } = await client.auth.getSession();
      if (error) throw error;
      render(data.session);
      get('account-message').hidden = true;
      return client;
    })().catch(error => { initializing = null; throw error; });
    return initializing;
  }
  login.addEventListener('click', () => {
    message.textContent = '';
    dialog.showModal();
    email.focus();
  });
  get('auth-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => { password.value = ''; });
  switchButton.addEventListener('click', () => {
    signup = !signup;
    get('auth-title').textContent = submit.textContent = signup ? '회원가입' : '로그인';
    switchButton.textContent = signup ? '이미 계정이 있나요? 로그인' : '계정이 없나요? 회원가입';
    password.autocomplete = signup ? 'new-password' : 'current-password';
    password.minLength = signup ? 6 : 1;
    password.value = '';
    message.textContent = '';
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    message.textContent = '처리 중입니다…';
    try {
      const authClient = await initialize();
      const credentials = { email: email.value.trim(), password: password.value };
      const { data, error } = signup
        ? await authClient.auth.signUp({ ...credentials, options: { emailRedirectTo: location.origin + '/' } })
        : await authClient.auth.signInWithPassword(credentials);
      if (error) throw error;
      password.value = '';
      render(data.session);
      if (data.session) dialog.close();
      else message.textContent = '가입 확인 메일을 보냈습니다. 이메일의 인증 링크를 확인한 뒤 로그인해 주세요.';
    } catch (error) { message.textContent = errorText(error); }
    finally { setBusy(false); }
  });
  logout.addEventListener('click', async () => {
    if (busy) return;
    setBusy(true);
    try {
      const { error } = await client.auth.signOut();
      if (error) throw error;
      render(null);
      get('account-message').hidden = true;
    } catch (error) {
      get('account-message').textContent = errorText(error);
      get('account-message').hidden = false;
    } finally { setBusy(false); }
  });
  initialize().catch(error => {
    get('account-message').textContent = errorText(error);
    get('account-message').hidden = false;
  });
})();