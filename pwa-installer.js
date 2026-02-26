// ==========================================
// 📱 PWA INSTALLER - Install App Button
// ==========================================

let deferredPrompt = null;

// ==========================================
// 🔍 Detectar beforeinstallprompt
// ==========================================
window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredPrompt = event;
  console.log('✅ PWA install prompt disponível');

  enableInstallButton();
});

// ==========================================
// 📥 Handle Install Button Click
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  const installBtn = document.getElementById('installBtn');
  if (!installBtn) return;

  installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) {
      console.warn('⚠️ Install prompt não disponível');
      if (window.showMessage) {
        window.showMessage('Seu navegador não suporta instalação de apps', 'warning');
      }
      return;
    }

    // Mostrar prompt
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    console.log(`📱 Resposta do usuário: ${outcome}`);
    deferredPrompt = null;
    installBtn.style.display = 'none';

    if (outcome === 'accepted') {
      console.log('✅ App instalado com sucesso!');
      if (window.showMessage) {
        window.showMessage('App instalado com sucesso!', 'success');
      }
    } else {
      console.log('❌ Instalação cancelada');
    }
  });
});

// ==========================================
// 🔍 Verificar se já está instalado
// ==========================================
function checkIfInstalled() {
  const installBtn = document.getElementById('installBtn');
  if (!installBtn) return;

  if (window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches) {
    installBtn.style.display = 'none';
    console.log('📱 App já está instalado');
  }
}

// Evento disparado quando app é instalado
window.addEventListener('appinstalled', () => {
  console.log('🎉 Evento appinstalled disparado');
  const installBtn = document.getElementById('installBtn');
  if (installBtn) installBtn.style.display = 'none';
});

// ==========================================
// 🚀 Registrar Service Worker
// ==========================================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log('✅ Service Worker registrado:', registration.scope);

        // Atualizar SW a cada 1 min
        setInterval(() => registration.update(), 60000);
      })
      .catch((error) => {
        console.error('❌ Erro ao registrar Service Worker:', error);
      });

    // Reload automático quando SW novo assumir
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });
  });
} else {
  console.warn('⚠️ Service Worker não suportado');
}

// ==========================================
// 🔗 Função para habilitar botão
// ==========================================
function enableInstallButton() {
  const installBtn = document.getElementById('installBtn');
  if (installBtn && deferredPrompt) {
    installBtn.style.display = 'inline-flex';
    console.log('📱 Botão de instalação habilitado');
  }
}

window.enableInstallButton = enableInstallButton;
