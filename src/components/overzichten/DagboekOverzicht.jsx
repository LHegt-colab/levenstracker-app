import { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Copy, Download } from 'lucide-react';
import { getDateString, formatDate } from '../../utils/dateHelpers';

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni',
  'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'
];

export default function DagboekOverzicht() {
  const { data } = useApp();
  const [periodType, setPeriodType] = useState('dates'); // dates, weeks, months
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startWeek, setStartWeek] = useState('');
  const [endWeek, setEndWeek] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [startMonth, setStartMonth] = useState(1);
  const [endMonth, setEndMonth] = useState(12);
  const [overview, setOverview] = useState('');
  const [copied, setCopied] = useState(false);

  const generateOverview = () => {
    let entries = [];

    // Verzamel alle dagboek entries binnen de periode
    Object.keys(data.dagboek).forEach(dateStr => {
      const dayData = data.dagboek[dateStr];
      if (!dayData.entries || dayData.entries.length === 0) return;

      let includeDate = false;

      if (periodType === 'dates') {
        if (startDate && endDate) {
          includeDate = dateStr >= startDate && dateStr <= endDate;
        }
      } else if (periodType === 'weeks') {
        if (startWeek && endWeek) {
          const date = new Date(dateStr);
          const weekNum = getWeekNumber(date);
          const dateYear = date.getFullYear();
          if (dateYear === year) {
            includeDate = weekNum >= parseInt(startWeek) && weekNum <= parseInt(endWeek);
          }
        }
      } else if (periodType === 'months') {
        const date = new Date(dateStr);
        const month = date.getMonth() + 1;
        const dateYear = date.getFullYear();
        if (dateYear === year) {
          includeDate = month >= startMonth && month <= endMonth;
        }
      }

      if (includeDate) {
        entries.push({ date: dateStr, dayData });
      }
    });

    // Sorteer op datum
    entries.sort((a, b) => a.date.localeCompare(b.date));

    // Genereer overzicht tekst
    let text = '';
    text += '═══════════════════════════════════════════════════════\n';
    text += '           DAGBOEK PERIODE OVERZICHT\n';
    text += '═══════════════════════════════════════════════════════\n\n';

    if (periodType === 'dates') {
      text += `Periode: ${formatDate(new Date(startDate), 'd MMMM yyyy')} - ${formatDate(new Date(endDate), 'd MMMM yyyy')}\n`;
    } else if (periodType === 'weeks') {
      text += `Periode: Week ${startWeek} - ${endWeek}, ${year}\n`;
    } else {
      text += `Periode: ${MONTH_NAMES[startMonth - 1]} - ${MONTH_NAMES[endMonth - 1]}, ${year}\n`;
    }
    text += `Totaal aantal dagen: ${entries.length}\n`;
    text += `Totaal aantal entries: ${entries.reduce((sum, e) => sum + e.dayData.entries.length, 0)}\n\n`;
    text += '═══════════════════════════════════════════════════════\n\n';

    entries.forEach(({ date, dayData }) => {
      text += `\n${'─'.repeat(55)}\n`;
      text += `📅 ${formatDate(new Date(date), 'EEEE, d MMMM yyyy').toUpperCase()}\n`;
      text += `${'─'.repeat(55)}\n\n`;

      // Dag samenvatting eerst (als die bestaat)
      if (dayData.daySummary) {
        text += '🔷 DAG OVERZICHT:\n\n';
        text += dayData.daySummary + '\n\n';
        text += `${'-'.repeat(55)}\n\n`;
      }

      // Dan alle individuele entries
      dayData.entries.forEach((entry, idx) => {
        if (dayData.entries.length > 1) {
          text += `📝 Entry ${idx + 1}/${dayData.entries.length}\n`;
          text += `Tijd: ${new Date(entry.timestamp).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}\n\n`;
        }

        if (entry.content) {
          text += entry.content + '\n\n';
        }

        // Metagegevens
        const meta = [];
        if (entry.mood) meta.push(`Stemming: ${entry.mood}/10`);
        if (entry.energy) meta.push(`Energie: ${entry.energy}/10`);
        if (entry.stress) meta.push(`Spanning: ${entry.stress}/10`);
        if (entry.sleep) meta.push(`Slaap: ${entry.sleep}/10`);

        if (meta.length > 0) {
          text += `📊 ${meta.join(' | ')}\n\n`;
        }

        if (entry.sport?.done) {
          text += `💪 Sport: ${entry.sport.activity}\n\n`;
        }

        if (entry.tags && entry.tags.length > 0) {
          text += `🏷️  Tags: ${entry.tags.join(', ')}\n\n`;
        }

        if (idx < dayData.entries.length - 1) {
          text += `${'.'.repeat(55)}\n\n`;
        }
      });
    });

    text += '\n═══════════════════════════════════════════════════════\n';
    text += `                    EINDE OVERZICHT\n`;
    text += `           Gegenereerd op ${new Date().toLocaleDateString('nl-NL')}\n`;
    text += '═══════════════════════════════════════════════════════\n';

    setOverview(text);
  };

  const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(overview);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([overview], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dagboek-overzicht-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Period Selection */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Selecteer Periode</h2>

        {/* Period Type Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setPeriodType('dates')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              periodType === 'dates'
                ? 'bg-primary text-white'
                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Datums
          </button>
          <button
            onClick={() => setPeriodType('weeks')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              periodType === 'weeks'
                ? 'bg-primary text-white'
                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Weken
          </button>
          <button
            onClick={() => setPeriodType('months')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              periodType === 'months'
                ? 'bg-primary text-white'
                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Maanden
          </button>
        </div>

        {/* Date Range Selection */}
        {periodType === 'dates' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Van datum</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tot datum</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input-field"
              />
            </div>
          </div>
        )}

        {/* Week Range Selection */}
        {periodType === 'weeks' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Jaar</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="input-field"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Van week</label>
                <input
                  type="number"
                  min="1"
                  max="53"
                  value={startWeek}
                  onChange={(e) => setStartWeek(e.target.value)}
                  className="input-field"
                  placeholder="1-53"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tot week</label>
                <input
                  type="number"
                  min="1"
                  max="53"
                  value={endWeek}
                  onChange={(e) => setEndWeek(e.target.value)}
                  className="input-field"
                  placeholder="1-53"
                />
              </div>
            </div>
          </div>
        )}

        {/* Month Range Selection */}
        {periodType === 'months' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Jaar</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="input-field"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Van maand</label>
                <select
                  value={startMonth}
                  onChange={(e) => setStartMonth(parseInt(e.target.value))}
                  className="input-field"
                >
                  {MONTH_NAMES.map((name, idx) => (
                    <option key={idx} value={idx + 1}>{name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tot maand</label>
                <select
                  value={endMonth}
                  onChange={(e) => setEndMonth(parseInt(e.target.value))}
                  className="input-field"
                >
                  {MONTH_NAMES.map((name, idx) => (
                    <option key={idx} value={idx + 1}>{name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        <button onClick={generateOverview} className="btn-primary mt-4 w-full">
          Genereer Overzicht
        </button>
      </div>

      {/* Overview Output */}
      {overview && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Gegenereerd Overzicht</h2>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="btn-secondary flex items-center gap-2"
              >
                <Copy size={18} />
                {copied ? 'Gekopieerd!' : 'Kopiëren'}
              </button>
              <button
                onClick={handleDownload}
                className="btn-secondary flex items-center gap-2"
              >
                <Download size={18} />
                Downloaden
              </button>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 max-h-[600px] overflow-y-auto">
            <pre className="font-mono text-sm whitespace-pre-wrap text-gray-800 dark:text-gray-200">
              {overview}
            </pre>
          </div>

          <div className="mt-3 text-sm text-gray-500">
            {overview.length} karakters
          </div>
        </div>
      )}
    </div>
  );
}
