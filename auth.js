// auth.js — proteção compartilhada entre todos os cronogramas
// Inclua com: <script src="auth.js"></script> antes do </body>

(function() {
  const SENHA = 'concursos2026'; // mesma senha do index
  const KEY   = 'hub_auth';

  function isLogada() {
    try { return atob(localStorage.getItem(KEY)||'') === SENHA; } catch(e) { return false; }
  }

  // Injeta overlay de bloqueio se não estiver logada
  function injetarOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'auth-overlay';
    overlay.style.cssText = [
      'position:fixed','inset:0','background:rgba(15,15,17,0.97)',
      'z-index:9999','display:flex','align-items:center',
      'justify-content:center','padding:1rem','font-family:DM Sans,system-ui,sans-serif'
    ].join(';');

    overlay.innerHTML = `
      <div style="width:100%;max-width:320px;background:#18181c;border:1px solid rgba(255,255,255,0.13);border-radius:16px;padding:2rem 1.75rem;text-align:center;">
        <div style="width:64px;height:64px;border-radius:50%;border:1.5px solid #7c6ff7;overflow:hidden;margin:0 auto 1rem;display:flex;align-items:center;justify-content:center;">
          <img src="my-notion-face-transparent.png" style="width:100%;height:100%;object-fit:contain;" onerror="this.style.display='none';this.parentElement.textContent='📚'">
        </div>
        <div style="font-size:16px;font-weight:500;color:#e8e8ec;margin-bottom:6px;">Conteúdo protegido</div>
        <div style="font-size:12px;color:#6b6b78;font-family:DM Mono,monospace;margin-bottom:1.5rem;line-height:1.5;">
          Faça login no hub para acessar<br>os cronogramas com checklist.
        </div>
        <div style="position:relative;margin-bottom:.75rem;">
          <input id="ov-pwd" type="password" placeholder="••••••••"
            style="width:100%;background:#202026;border:1px solid rgba(255,255,255,0.13);border-radius:10px;padding:10px 40px 10px 14px;font-size:14px;color:#e8e8ec;outline:none;font-family:inherit;"
            onkeydown="if(event.key==='Enter')window._authCheck()">
          <button onclick="const i=document.getElementById('ov-pwd');i.type=i.type==='password'?'text':'password';"
            style="position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#6b6b78;font-size:14px;">👁</button>
        </div>
        <div id="ov-err" style="font-size:12px;color:#f76b6b;min-height:18px;margin-bottom:.5rem;font-family:DM Mono,monospace;"></div>
        <button onclick="window._authCheck()"
          style="width:100%;background:#7c6ff7;border:none;color:white;font-size:14px;font-weight:500;padding:11px;border-radius:10px;cursor:pointer;margin-bottom:.75rem;">
          Entrar
        </button>
        <a href="index.html"
          style="display:block;font-size:12px;color:#6b6b78;font-family:DM Mono,monospace;text-decoration:none;">
          ← voltar ao hub
        </a>
      </div>`;

    document.body.appendChild(overlay);

    window._authCheck = function() {
      const pwd = document.getElementById('ov-pwd').value;
      const err = document.getElementById('ov-err');
      if(pwd === SENHA) {
        try { localStorage.setItem(KEY, btoa(SENHA)); } catch(e) {}
        overlay.remove();
        aplicarModoLogada();
      } else {
        err.textContent = 'senha incorreta';
        document.getElementById('ov-pwd').value = '';
        document.getElementById('ov-pwd').focus();
        setTimeout(()=>{ err.textContent=''; }, 2500);
      }
    };
  }

  // Aplica modo logada: checklist funciona normalmente
  function aplicarModoLogada() {
    document.body.classList.remove('guest-mode');
    // garante que rows são clicáveis
    document.querySelectorAll('.day-row, .row').forEach(r => {
      r.style.pointerEvents = '';
      r.style.opacity = '';
    });
  }

  // Aplica modo visitante: bloqueia interações
  function aplicarBloqueio() {
    document.body.classList.add('guest-mode');
  }

  // Injeta CSS de bloqueio
  const style = document.createElement('style');
  style.textContent = `
    body.guest-mode .day-row,
    body.guest-mode .row { cursor: not-allowed !important; pointer-events: none !important; opacity: .75; }
    body.guest-mode .chk-area { opacity: .3 !important; pointer-events: none !important; }
    body.guest-mode .reset-btn { opacity: .3; pointer-events: none; cursor: not-allowed; }
    body.guest-mode button[onclick*="tog"],
    body.guest-mode button[onclick*="reset"] { pointer-events: none; }
  `;
  document.head.appendChild(style);

  // Verifica autenticação ao carregar
  if(isLogada()) {
    aplicarModoLogada();
  } else {
    // Aguarda DOM carregar para injetar overlay
    if(document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', injetarOverlay);
    } else {
      injetarOverlay();
    }
  }
})();
