import { createRoot } from 'react-dom/client';
import App from './App';
import { applyPerfHints } from './lib/perf';
import './landing.css';

applyPerfHints();

createRoot(document.getElementById('root')!).render(<App />);
