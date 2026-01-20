import { useState } from 'react';
import { useApp } from '../../contexts/AppContextSupabase';
import { Copy, Download } from 'lucide-react';

const MONTH_NAMES = ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'];

export default function VoedingOverzicht() {
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
    // Veiligheidscontrole
    if (!data.voeding || !data.voeding.meals) {
      setOverview('Voeding data is niet beschikbaar. Voeg eerst maaltijden toe in de Voeding module.');
      return;
    }

    const meals = data.voeding.meals;
    const targetKcal = data.voeding.targetKcal || 2000;

    // Filter dates in period
    let dates = Object.keys(meals).filter(dateStr => {
      if (periodType === 'dates') {
        return startDate && endDate && dateStr >= startDate && dateStr <= endDate;
      } else {
        const date = new Date(dateStr);
        const month = date.getMonth() + 1;
        const dateYear = date.getFullYear();
        return dateYear === year && month >= startMonth && month <= endMonth;
      }
    }).sort();

    let text = '';
    text += '═══════════════════════════════════════════════════════\n';
    text += '         VOEDING PERIODE OVERZICHT\n';
    text += '═══════════════════════════════════════════════════════\n\n';

    if (periodType === 'dates') {
      text += `Periode: ${new Date(startDate).toLocaleDateString('nl-NL')} - ${new Date(endDate).toLocaleDateString('nl-NL')}\n`;
    } else {
      text += `Periode: ${MONTH_NAMES[startMonth - 1]} - ${MONTH_NAMES[endMonth - 1]}, ${year}\n`;
    }
    text += `Dagelijks streefwaarde: ${targetKcal} kcal\n`;
    text += `Aantal dagen: ${dates.length}\n\n`;

    // Calculate totals
    const totalMeals = dates.reduce((sum, date) => sum + meals[date].meals.length, 0);
    const totalKcal = dates.reduce((sum, date) => {
      return sum + meals[date].meals.reduce((s, m) => s + (m.kcal || 0), 0);
    }, 0);
    const avgKcalPerDay = dates.length > 0 ? Math.round(totalKcal / dates.length) : 0;
    const totalTarget = targetKcal * dates.length;
    const percentageOfTarget = totalTarget > 0 ? Math.round((totalKcal / totalTarget) * 100) : 0;

    text += '📊 STATISTIEKEN\n';
    text += `${'─'.repeat(55)}\n\n`;
    text += `Totaal maaltijden: ${totalMeals}\n`;
    text += `Totaal kcal: ${totalKcal}\n`;
    text += `Gemiddeld kcal per dag: ${avgKcalPerDay}\n`;
    text += `Totaal streefwaarde: ${totalTarget} kcal\n`;
    text += `Percentage van streef: ${percentageOfTarget}%\n`;
    text += `Verschil: ${totalKcal - totalTarget > 0 ? '+' : ''}${totalKcal - totalTarget} kcal\n\n`;

    text += '═══════════════════════════════════════════════════════\n\n';

    // Daily breakdown
    text += '📅 DAGELIJKSE DETAILS\n';
    text += `${'─'.repeat(55)}\n\n`;

    dates.forEach(dateStr => {
      const dayData = meals[dateStr];
      const dayKcal = dayData.meals.reduce((sum, m) => sum + (m.kcal || 0), 0);
      const dayPercentage = Math.round((dayKcal / targetKcal) * 100);

      text += `${new Date(dateStr).toLocaleDateString('nl-NL', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}\n`;
      text += `Totaal: ${dayKcal} kcal (${dayPercentage}% van doel)\n\n`;

      // Group by meal type
      const byType = {};
      dayData.meals.forEach(meal => {
        if (!byType[meal.type]) byType[meal.type] = [];
        byType[meal.type].push(meal);
      });

      ['Ontbijt', 'Lunch', 'Diner', 'Snack', 'Drinken'].forEach(type => {
        if (byType[type]) {
          text += `  ${type}:\n`;
          byType[type].forEach(meal => {
            text += `    • ${meal.name} - ${meal.amount} ${meal.unit} (${meal.kcal} kcal)\n`;
            if (meal.notes) {
              text += `      └─ ${meal.notes}\n`;
            }
          });
          text += '\n';
        }
      });

      text += `${'-'.repeat(55)}\n\n`;
    });

    // Meal type analysis
    text += '\n📈 ANALYSE PER MAALTIJDTYPE\n';
    text += `${'─'.repeat(55)}\n\n`;

    const mealTypeStats = {};
    dates.forEach(dateStr => {
      meals[dateStr].meals.forEach(meal => {
        if (!mealTypeStats[meal.type]) {
          mealTypeStats[meal.type] = { count: 0, totalKcal: 0 };
        }
        mealTypeStats[meal.type].count++;
        mealTypeStats[meal.type].totalKcal += meal.kcal;
      });
    });

    Object.keys(mealTypeStats).sort().forEach(type => {
      const stats = mealTypeStats[type];
      const avgKcal = Math.round(stats.totalKcal / stats.count);
      text += `${type}:\n`;
      text += `  Aantal: ${stats.count}x\n`;
      text += `  Totaal: ${stats.totalKcal} kcal\n`;
      text += `  Gemiddeld: ${avgKcal} kcal\n\n`;
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
    a.download = `voeding-overzicht-${new Date().toISOString().split('T')[0]}.txt`;
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
