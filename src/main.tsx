import { render } from 'solid-js/web';

import { I18nProvider } from '@lib/i18n';
import '@/styles.css';
import App from '@/App';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element not found');
}

render(
  () => (
    <I18nProvider>
      <App />
    </I18nProvider>
  ),
  root,
);
