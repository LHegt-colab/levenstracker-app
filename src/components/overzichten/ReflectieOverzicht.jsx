import { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Copy, Download } from 'lucide-react';

const MONTH_NAMES = ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'];

export default function ReflectieOverzicht() {
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
    let text = '';
    text += '═══════════════════════════════════════════════════════\n';
    text += '         REFLECTIE PERIODE OVERZICHT\n';
    text += '═══════════════════════════════════════════════════════\n\n';

    if (periodType === 'dates') {
      text += `Periode: ${new Date(startDate).toLocaleDateString('nl-NL')} - ${new Date(endDate).toLocaleDateString('nl-NL')}\n\n`;
    } else {
      text += `Periode: ${MONTH_NAMES[startMonth - 1]} - ${MONTH_NAMES[endMonth - 1]}, ${year}\n\n`;
    }
    text += '═══════════════════════════════════════════════════════\n\n';

    // Daily reflections
    const dailyDates = Object.keys(data.reflecties.daily).filter(dateStr => {
      if (periodType === 'dates') {
        return startDate && endDate && dateStr >= startDate && dateStr <= endDate;
      } else {
        const date = new Date(dateStr);
        const month = date.getMonth() + 1;
        const dateYear = date.getFullYear();
        return dateYear === year && month >= startMonth && month <= endMonth;
      }
    }).sort();

    if (dailyDates.length > 0) {
      text += '📅 DAGELIJKSE REFLECTIES\n';
      text += `${'─'.repeat(55)}\n\n`;

      dailyDates.forEach(dateStr => {
        const refl = data.reflecties.daily[dateStr];
        text += `${new Date(dateStr).toLocaleDateString('nl-NL', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}\n\n`;

        if (refl.gratitude && refl.gratitude.length > 0) {
          text += '🙏 Dankbaarheid:\n';
          refl.gratitude.forEach(g => text += `   • ${g}\n`);
          text += '\n';
        }
        if (refl.highlights) text += `✨ Hoogtepunten:\n${refl.highlights}\n\n`;
        if (refl.challenges) text += `⚡ Uitdagingen:\n${refl.challenges}\n\n`;
        if (refl.learnings) text += `📚 Geleerd:\n${refl.learnings}\n\n`;
        if (refl.tomorrow) text += `🎯 Focus morgen:\n${refl.tomorrow}\n\n`;

        text += `${'-'.repeat(55)}\n\n`;
      });
    }

    // Weekly reflections
    const weeklyRefl = data.reflecties.weekly.filter(w => w.year === year).sort((a, b) => a.weekNumber - b.weekNumber);
    if (weeklyRefl.length > 0) {
      text += '\n📆 WEKELIJKSE REFLECTIES\n';
      text += `${'─'.repeat(55)}\n\n`;

      weeklyRefl.forEach(refl => {
        text += `Week ${refl.weekNumber}, ${refl.year}\n\n`;
        if (refl.wins && refl.wins.length > 0) {
          text += '🏆 Wins:\n';
          refl.wins.forEach(w => text += `   • ${w}\n`);
          text += '\n';
        }
        if (refl.challenges) text += `⚡ Uitdagingen:\n${refl.challenges}\n\n`;
        if (refl.learnings) text += `📚 Geleerd:\n${refl.learnings}\n\n`;
        if (refl.habits) text += `💪 Gewoontes:\n${refl.habits}\n\n`;
        if (refl.nextWeekFocus) text += `🎯 Volgende week:\n${refl.nextWeekFocus}\n\n`;
        text += `${'-'.repeat(55)}\n\n`;
      });
    }

    // Monthly reflections
    const monthlyRefl = data.reflecties.monthly.filter(m => {
      if (periodType === 'months') {
        return m.year === year && m.month >= startMonth && m.month <= endMonth;
      }
      return m.year === year;
    }).sort((a, b) => a.month - b.month);

    if (monthlyRefl.length > 0) {
      text += '\n📊 MAANDELIJKSE REFLECTIES\n';
      text += `${'─'.repeat(55)}\n\n`;

      monthlyRefl.forEach(refl => {
        text += `${MONTH_NAMES[refl.month - 1]} ${refl.year}\n\n`;
        if (refl.achievements && refl.achievements.length > 0) {
          text += '🏆 Prestaties:\n';
          refl.achievements.forEach(a => text += `   • ${a}\n`);
          text += '\n';
        }
        if (refl.challenges) text += `⚡ Uitdagingen:\n${refl.challenges}\n\n`;
        if (refl.growthAreas) text += `🌱 Groei:\n${refl.growthAreas}\n\n`;
        if (refl.nextMonthGoals && refl.nextMonthGoals.length > 0) {
          text += '🎯 Doelen volgende maand:\n';
          refl.nextMonthGoals.forEach(g => text += `   • ${g}\n`);
          text += '\n';
        }
        if (refl.overall) text += `💭 Algemeen:\n${refl.overall}\n\n`;
        text += `${'-'.repeat(55)}\n\n`;
      });
    }

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
    a.download = `reflectie-overzicht-${new Date().toISOString().split('T')[0]}.txt`;
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
