(() => {
    const html = document.documentElement;
    const key = 'ee-theme';
    function apply(theme){
      if(theme === 'light'){ html.classList.add('light'); html.classList.remove('dark'); }
      else { html.classList.add('dark'); html.classList.remove('light'); }
    }
    const saved = localStorage.getItem(key) || 'dark';
    apply(saved);
    document.getElementById('themeToggle')?.addEventListener('click', () => {
      const next = html.classList.contains('dark') ? 'light' : 'dark';
      localStorage.setItem(key, next);
      apply(next);
    });
  })();