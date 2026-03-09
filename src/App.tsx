import { useState } from 'react';
import { UserProvider } from './contexts/UserContext';
import { useUser } from './contexts/UserContext';
import HomePage from './pages/HomePage';
import KanjiListPage from './pages/KanjiListPage';
import KanjiDetailPage from './pages/KanjiDetailPage';
import QuizPage from './pages/QuizPage';
import DashboardPage from './pages/DashboardPage';
import DictionaryPage from './pages/DictionaryPage';
import StoryMapPage from './pages/StoryMapPage';
import NotificationPopup from './components/NotificationPopup';
import './index.css';

import type { GameMode, TimeAttackConfig } from './types';

type Page =
  | { name: 'home' }
  | { name: 'kanjiList'; grade: number }
  | { name: 'kanjiDetail'; character: string; grade: number }
  | { name: 'quiz'; grade: number; gameMode?: GameMode; timeConfig?: TimeAttackConfig; storyNodeId?: string }
  | { name: 'dashboard' }
  | { name: 'dictionary' }
  | { name: 'storymap' };

function AppContent() {
  const [page, setPage] = useState<Page>({ name: 'home' });
  const [history, setHistory] = useState<Page[]>([]);
  const { user, dispatch } = useUser();

  const navigate = (p: Page) => {
    setHistory(prev => [...prev, page]); // 現在のページを履歴に追加
    setPage(p);
  };

  const replacePage = (p: Page) => {
    setPage(p);
  };

  const goBack = () => {
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setHistory(h => h.slice(0, -1));
      setPage(prev);
    } else {
      setPage({ name: 'home' });
    }
  };

  return (
    <div className="app">
      <div className="app-background" />
      <NotificationPopup />

      {/* ナビゲーション */}
      <nav className="nav-bar">
        <div className="container">
          <button className="nav-logo" onClick={() => navigate({ name: 'home' })}>
            <span>📚</span>
            <span>カンジマスター</span>
          </button>
          <div className="nav-links">
            <button
              className={`nav-link ${page.name === 'home' ? 'active' : ''}`}
              onClick={() => navigate({ name: 'home' })}
            >
              <span className="icon">🏠</span>
              <span>ホーム</span>
            </button>
            <button
              className={`nav-link ${page.name === 'dictionary' ? 'active' : ''}`}
              onClick={() => navigate({ name: 'dictionary' })}
            >
              <span className="icon">📖</span>
              <span>辞書</span>
            </button>
            <button
              className={`nav-link ${page.name === 'dashboard' ? 'active' : ''}`}
              onClick={() => navigate({ name: 'dashboard' })}
            >
              <span className="icon">📊</span>
              <span>マイページ</span>
            </button>
            <button
              className="nav-link"
              onClick={() => dispatch({ type: 'TOGGLE_THEME' })}
            >
              <span className="icon">{user.settings.theme === 'light' ? '🌙' : '☀️'}</span>
              <span>テーマ</span>
            </button>
          </div>
        </div>
      </nav>

      {/* メインコンテンツ */}
      <main className="page">
        <div className="container">
          {page.name === 'home' && (
            <HomePage
              onSelectGrade={(g: number) => navigate({ name: 'kanjiList', grade: g })}
              onStartQuiz={(g: number, mode?: GameMode, tc?: TimeAttackConfig) => navigate({ name: 'quiz', grade: g, gameMode: mode, timeConfig: tc })}
              onNavigateToStory={() => navigate({ name: 'storymap' })}
            />
          )}
          {page.name === 'kanjiList' && (
            <KanjiListPage
              grade={page.grade}
              onSelectKanji={(char) => navigate({ name: 'kanjiDetail', character: char, grade: page.grade })}
              onBack={goBack}
              onStartQuiz={() => navigate({ name: 'quiz', grade: page.grade })}
            />
          )}
          {page.name === 'kanjiDetail' && (
            <KanjiDetailPage
              character={page.character}
              grade={page.grade}
              onBack={goBack}
            />
          )}
          {page.name === 'quiz' && (
            <QuizPage
              key={page.storyNodeId ? `quiz-${page.storyNodeId}` : 'quiz'}
              grade={page.grade}
              gameMode={page.gameMode}
              timeConfig={page.timeConfig}
              storyNodeId={page.storyNodeId}
              onBack={goBack}
              onNextStoryNode={(nodeId) => replacePage({ name: 'quiz', grade: page.grade, gameMode: 'story', storyNodeId: nodeId })}
            />
          )}
          {page.name === 'dashboard' && (
            <DashboardPage
              onBack={goBack}
              onSelectKanji={(char, grade) => navigate({ name: 'kanjiDetail', character: char, grade })}
            />
          )}
          {page.name === 'dictionary' && (
            <DictionaryPage
              onSelectKanji={(char, grade) => navigate({ name: 'kanjiDetail', character: char, grade })}
              onBack={goBack}
            />
          )}
          {page.name === 'storymap' && (
            <StoryMapPage
              onBack={goBack}
              onStartBattle={(nodeId: string, grade: number) => navigate({ name: 'quiz', grade, gameMode: 'story', storyNodeId: nodeId })}
            />
          )}
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}

export default App;
