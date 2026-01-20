import { useState } from 'react';
import { useApp } from '../../contexts/AppContextSupabase';
import { Copy, Download } from 'lucide-react';

const MONTH_NAMES = ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'];

export default function IdeenOverzicht() {
  const { data } = useApp();
  const [periodType, setPeriodType] = useState('dates');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [startMonth, setStartMonth] = useState(1);
  const [endMonth, setEndMonth] = useState(12);
  const [overview, setOverview] = useState('');
  const [copied, setCopied] = useState(false);

  const generateOverview = () => {
    let ideas = data.ideeen.items.filter(item => {
      const createdDate = new Date(item.createdAt);
      const dateStr = createdDate.toISOString().split('T')[0];

      if (periodType === 'dates') {
        return startDate && endDate && dateStr >= startDate && dateStr <= endDate;
      } else {
        const month = createdDate.getMonth() + 1;
        const itemYear = createdDate.getFullYear();
        return itemYear === year && month >= startMonth && month <= endMonth;
      }
    });

    const byCategory = {};
    const byStatus = { 'backlog': [], 'in-progress': [], 'completed': [], 'archived': [] };

    ideas.forEach(idea => {
      const category = data.ideeen.categories.find(c => c.id === idea.categoryId);
      const catName = category?.name || 'Onbekend';
      if (!byCategory[catName]) byCategory[catName] = [];
      byCategory[catName].push(idea);
      byStatus[idea.status].push(idea);
    });

    let text = '';
    text += '═══════════════════════════════════════════════════════\n';
    text += '            IDEEËN PERIODE OVERZICHT\n';
    text += '═══════════════════════════════════════════════════════\n\n';

    if (periodType === 'dates') {
      text += `Periode: ${new Date(startDate).toLocaleDateString('nl-NL')} - ${new Date(endDate).toLocaleDateString('nl-NL')}\n`;
    } else {
      text += `Periode: ${MONTH_NAMES[startMonth - 1]} - ${MONTH_NAMES[endMonth - 1]}, ${year}\n`;
    }
    text += `Totaal ideeën: ${ideas.length}\n`;
    text += `Backlog: ${byStatus.backlog.length} | In Progress: ${byStatus['in-progress'].length} | Voltooid: ${byStatus.completed.length} | Gearchiveerd: ${byStatus.archived.length}\n\n`;
    text += '═══════════════════════════════════════════════════════\n\n';

    ['backlog', 'in-progress', 'completed', 'archived'].forEach(status => {
      const statusItems = byStatus[status];
      if (statusItems.length === 0) return;

      const statusLabels = { 'backlog': '📋 BACKLOG', 'in-progress': '🚀 IN PROGRESS', 'completed': '✅ VOLTOOID', 'archived': '📦 GEARCHIVEERD' };
      text += `\n${statusLabels[status]} (${statusItems.length})\n`;
      text += `${'─'.repeat(55)}\n\n`;

      statusItems.forEach((idea, idx) => {
        const cat = data.ideeen.categories.find(c => c.id === idea.categoryId);
        text += `${idx + 1}. ${idea.title}\n`;
        text += `   📁 ${cat?.name || 'Onbekend'}\n`;
        if (idea.description) {
          text += `   └─ ${idea.description}\n`;
        }
        if (idea.tags && idea.tags.length > 0) {
          text += `   🏷️  ${idea.tags.join(', ')}\n`;
        }
        text += `   📅 ${new Date(idea.createdAt).toLocaleDateString('nl-NL')}\n\n`;
      });
    });

    text += '\n═══════════════════════════════════════════════════════\n';
    text += `           Gegenereerd op ${new Date().toLocaleDateString('nl-NL')}\n`;
    text += '═══════════════════════════════════════════════════════\n';

    setOverview(text);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(overview);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([overview], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ideeen-overzicht-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Selecteer Periode</h2>
        <div className="flex gap-2 mb-4">
          <button onClick={() => setPeriodType('dates')} className={`px-4 py-2 rounded-lg ${periodType === 'dates' ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Datums</button>
          <button onClick={() => setPeriodType('months')} className={`px-4 py-2 rounded-lg ${periodType === 'months' ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Maanden</button>
        </div>

        {periodType === 'dates' ? (
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Van datum</label><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input-field" /></div>
            <div><label className="block text-sm font-medium mb-1">Tot datum</label><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input-field" /></div>
          </div>
        ) : (
          <div className="space-y-4">
            <div><label className="block text-sm font-medium mb-1">Jaar</label><input type="number" value={year} onChange={(e) => setYear(parseInt(e.target.value))} className="input-field" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium mb-1">Van maand</label><select value={startMonth} onChange={(e) => setStartMonth(parseInt(e.target.value))} className="input-field">{MONTH_NAMES.map((name, idx) => <option key={idx} value={idx + 1}>{name}</option>)}</select></div>
              <div><label className="block text-sm font-medium mb-1">Tot maand</label><select value={endMonth} onChange={(e) => setEndMonth(parseInt(e.target.value))} className="input-field">{MONTH_NAMES.map((name, idx) => <option key={idx} value={idx + 1}>{name}</option>)}</select></div>
            </div>
          </div>
        )}

        <button onClick={generateOverview} className="btn-primary mt-4 w-full">Genereer Overzicht</button>
      </div>

      {overview && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Gegenereerd Overzicht</h2>
            <div className="flex gap-2">
              <button onClick={handleCopy} className="btn-secondary flex items-center gap-2"><Copy size={18} />{copied ? 'Gekopieerd!' : 'Kopiëren'}</button>
              <button onClick={handleDownload} className="btn-secondary flex items-center gap-2"><Download size={18} />Downloaden</button>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 max-h-[600px] overflow-y-auto">
            <pre className="font-mono text-sm whitespace-pre-wrap text-gray-800 dark:text-gray-200">{overview}</pre>
          </div>
          <div className="mt-3 text-sm text-gray-500">{overview.length} karakters</div>
        </div>
      )}
    </div>
  );
}
