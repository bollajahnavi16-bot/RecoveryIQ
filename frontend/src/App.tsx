import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DemoModal } from './components/DemoModal';
import { TransactionDrawer } from './components/TransactionDrawer';
import { NLAssistantDrawer } from './components/NLAssistantDrawer';

import { OverviewPage } from './pages/OverviewPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { AIDecisionsPage } from './pages/AIDecisionsPage';
import { RecoveryQueuePage } from './pages/RecoveryQueuePage';
import { ExperimentsPage } from './pages/ExperimentsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AuditPage } from './pages/AuditPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [isDemoOpen, setIsDemoOpen] = useState<boolean>(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);
  const [selectedTxnId, setSelectedTxnId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-surface-900 flex flex-col font-sans">
      <Navbar
        onOpenDemo={() => setIsDemoOpen(true)}
        onToggleAssistant={() => setIsAssistantOpen(prev => !prev)}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
        />

        <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full space-y-6">
          {currentTab === 'overview' && <OverviewPage onSelectTransaction={setSelectedTxnId} />}
          {currentTab === 'transactions' && <TransactionsPage onSelectTransaction={setSelectedTxnId} />}
          {currentTab === 'decisions' && <AIDecisionsPage />}
          {currentTab === 'queue' && <RecoveryQueuePage />}
          {currentTab === 'experiments' && <ExperimentsPage />}
          {currentTab === 'analytics' && <AnalyticsPage />}
          {currentTab === 'audit' && <AuditPage />}
          {currentTab === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Slide-over Transaction Detail Drawer */}
      <TransactionDrawer
        transactionId={selectedTxnId}
        onClose={() => setSelectedTxnId(null)}
      />

      {/* 90-Second Competition Demo Modal */}
      <DemoModal
        isOpen={isDemoOpen}
        onClose={() => setIsDemoOpen(false)}
        onSelectTransaction={(id) => {
          setIsDemoOpen(false);
          setSelectedTxnId(id);
        }}
      />

      {/* Natural Language Assistant Drawer */}
      <NLAssistantDrawer
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
      />
    </div>
  );
}

export default App;
