import { useState } from 'react';
import { useApp } from '../../contexts/AppContextSupabase';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function DebugConsole() {
    const { debugLogs } = useApp();
    const [isExpanded, setIsExpanded] = useState(false);

    if (!isExpanded) {
        return (
            <button
                onClick={() => setIsExpanded(true)}
                className="fixed bottom-0 right-0 bg-black text-green-400 px-4 py-2 rounded-tl-lg font-mono text-xs z-50 border-t-2 border-l-2 border-green-600 shadow-lg"
            >
                ▲ Show Debug Log
            </button>
        );
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-black bg-opacity-90 text-green-400 h-48 font-mono text-xs z-50 border-t-2 border-green-600 flex flex-col shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between px-4 py-1 bg-gray-900 border-b border-gray-800">
                <span className="font-bold text-white">Debug Console (Latest 50 events)</span>
                <div className="flex gap-2">
                    <button
                        onClick={() => window.location.reload()}
                        className="text-xs bg-red-900 hover:bg-red-700 text-white px-2 py-0.5 rounded"
                    >
                        Hard Refresh
                    </button>
                    <button
                        onClick={() => setIsExpanded(false)}
                        className="text-gray-400 hover:text-white"
                    >
                        <ChevronDown size={16} />
                    </button>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
                {debugLogs.length === 0 ? (
                    <div className="opacity-50 italic">Waiting for events...</div>
                ) : (
                    <div className="flex flex-col-reverse">
                        {debugLogs.map((log, i) => (
                            <div key={i} className="border-b border-gray-800 pb-0.5">{log}</div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
