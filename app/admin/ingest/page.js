'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export default function IngestionDashboard() {
    const [selectedCities, setSelectedCities] = useState(['Moab, UT', 'Las Vegas, NV', 'Miami, FL', 'Lake Havasu, AZ']);
    const [selectedCategories, setSelectedCategories] = useState(['offroad', 'water']);
    const [dryRun, setDryRun] = useState(true);
    const [isRunning, setIsRunning] = useState(false);
    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState(null);
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [customCityInput, setCustomCityInput] = useState('');

    const consoleEndRef = useRef(null);

    const [citiesList, setCitiesList] = useState([
        'Moab, UT',
        'Las Vegas, NV',
        'Miami, FL',
        'Lake Havasu, AZ',
        'Denver, CO',
        'Salt Lake City, UT',
        'San Diego, CA',
        'Tahoe City, CA',
        'Key West, FL',
        'Page, AZ',
        'Jackson Hole, WY',
        'Destin, FL',
        'Brainerd, MN',
        'Phoenix, AZ',
        'Scottsdale, AZ',
        'Orlando, FL',
        'Fort Lauderdale, FL',
        'Tampa, FL',
        'Anchorage, AK'
    ]);

    const availableCategories = [
        { id: 'offroad', label: '🏍️ Offroad (Dirt bikes, UTVs, ATVs)' },
        { id: 'water', label: '🚤 Water (Boats, Jet skis, PWCs)' }
    ];

    // Scroll to bottom of console logs when they change
    useEffect(() => {
        if (consoleEndRef.current) {
            consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs]);

    const handleCityToggle = (city) => {
        setSelectedCities(prev => 
            prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city]
        );
    };

    const handleCategoryToggle = (cat) => {
        setSelectedCategories(prev => 
            prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
        );
    };

    const handleAddCustomCity = (e) => {
        e.preventDefault();
        const trimmed = customCityInput.trim();
        if (!trimmed) return;

        // Check if already in the list
        const lowerList = citiesList.map(c => c.toLowerCase());
        const matchIndex = lowerList.indexOf(trimmed.toLowerCase());
        
        let targetName = trimmed;
        if (matchIndex === -1) {
            setCitiesList(prev => [...prev, trimmed]);
        } else {
            targetName = citiesList[matchIndex];
        }

        if (!selectedCities.includes(targetName)) {
            setSelectedCities(prev => [...prev, targetName]);
        }
        setCustomCityInput('');
    };

    const startIngestion = async () => {
        if (selectedCities.length === 0 || selectedCategories.length === 0) {
            alert('Please select at least one city and one category.');
            return;
        }

        setIsRunning(true);
        setLogs([]);
        setStats(null);
        setProgress({ current: 0, total: selectedCities.length * selectedCategories.length });

        try {
            const response = await fetch('/api/admin/ingest', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    cities: selectedCities,
                    categories: selectedCategories,
                    dryRun: dryRun
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to start ingestion');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let done = false;
            let buffer = '';
            let currentStep = 0;

            while (!done) {
                const { value, done: readerDone } = await reader.read();
                done = readerDone;
                if (value) {
                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop(); // Keep incomplete line

                    for (const line of lines) {
                        if (line.trim()) {
                            try {
                                const parsed = JSON.parse(line);
                                if (parsed.type === 'log') {
                                    setLogs(prev => [...prev, parsed.message]);
                                    
                                    // Update progress step when processing new city/category
                                    if (parsed.message.includes('Processing:')) {
                                        currentStep++;
                                        setProgress(prev => ({ ...prev, current: currentStep }));
                                    }
                                } else if (parsed.type === 'done') {
                                    setStats(parsed.result.stats);
                                    setIsRunning(false);
                                    setProgress(prev => ({ ...prev, current: prev.total }));
                                } else if (parsed.type === 'error') {
                                    setLogs(prev => [...prev, `❌ Stream Error: ${parsed.message}`]);
                                    setIsRunning(false);
                                }
                            } catch (e) {
                                // Ignore json parsing errors of half-completed lines
                            }
                        }
                    }
                }
            }
        } catch (error) {
            setLogs(prev => [...prev, `❌ Critical Error: ${error.message}`]);
            setIsRunning(false);
        }
    };

    return (
        <div className="ingest-container">
            <header className="admin-header">
                <div className="breadcrumbs">
                    <Link href="/admin">Admin Dashboard</Link> &gt; <span>Powersports Ingest Agent</span>
                </div>
                <h1>🤖 Ingestion Command Center</h1>
                <p className="subtitle">Automatically crawl, enrich, and import powersports listings from across the country.</p>
            </header>

            <div className="dashboard-grid">
                {/* Control Panel Card */}
                <div className="panel card">
                    <h2>Configuration</h2>
                    
                    <div className="section">
                        <h3>1. Select Cities to Target</h3>
                        <div className="grid-checkboxes">
                            {citiesList.map(city => (
                                <label key={city} className={`checkbox-label ${selectedCities.includes(city) ? 'checked' : ''}`}>
                                    <input
                                        type="checkbox"
                                        checked={selectedCities.includes(city)}
                                        onChange={() => handleCityToggle(city)}
                                        disabled={isRunning}
                                    />
                                    {city}
                                </label>
                            ))}
                        </div>
                        <form onSubmit={handleAddCustomCity} className="custom-city-form">
                            <input
                                type="text"
                                value={customCityInput}
                                onChange={(e) => setCustomCityInput(e.target.value)}
                                placeholder="Add custom city (e.g. Brainerd, MN)"
                                disabled={isRunning}
                                className="custom-city-input"
                            />
                            <button type="submit" disabled={isRunning || !customCityInput.trim()} className="custom-city-btn">
                                Add
                            </button>
                        </form>
                    </div>

                    <div className="section">
                        <h3>2. Categories</h3>
                        <div className="list-checkboxes">
                            {availableCategories.map(cat => (
                                <label key={cat.id} className={`checkbox-label ${selectedCategories.includes(cat.id) ? 'checked' : ''}`}>
                                    <input
                                        type="checkbox"
                                        checked={selectedCategories.includes(cat.id)}
                                        onChange={() => handleCategoryToggle(cat.id)}
                                        disabled={isRunning}
                                    />
                                    {cat.label}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="section">
                        <h3>3. Run Mode</h3>
                        <label className={`checkbox-label mode-select ${dryRun ? 'dry-mode' : 'live-mode'}`}>
                            <input
                                type="checkbox"
                                checked={dryRun}
                                onChange={(e) => setDryRun(e.target.checked)}
                                disabled={isRunning}
                            />
                            <div>
                                <strong>{dryRun ? '🧪 Dry Run Mode Enabled' : '🚀 Live Import Mode Enabled'}</strong>
                                <span className="helper-text">
                                    {dryRun 
                                        ? 'Queries OpenAI and performs geocoding without inserting records.' 
                                        : 'Adds listing records directly into the live marketplace database.'}
                                </span>
                            </div>
                        </label>
                    </div>

                    <button 
                        onClick={startIngestion} 
                        disabled={isRunning} 
                        className={`action-btn ${isRunning ? 'running' : ''}`}
                    >
                        {isRunning ? '🤖 Processing...' : 'Start Ingestion Agent'}
                    </button>
                </div>

                {/* Log & Progress Card */}
                <div className="feed card">
                    <h2>Agent Feed</h2>

                    {isRunning && (
                        <div className="progress-section">
                            <div className="progress-meta">
                                <span>Progress: {progress.current} / {progress.total} jobs</span>
                                <span>{Math.round((progress.current / (progress.total || 1)) * 100)}%</span>
                            </div>
                            <div className="progress-bar-bg">
                                <div 
                                    className="progress-bar-fill" 
                                    style={{ width: `${(progress.current / (progress.total || 1)) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    )}

                    {stats && (
                        <div className="stats-results animate-fade-in">
                            <div className="stat-pill success">
                                <span>Imported:</span> <strong>{stats.imported}</strong>
                            </div>
                            <div className="stat-pill skip">
                                <span>Skipped:</span> <strong>{stats.skipped}</strong>
                            </div>
                            <div className="stat-pill fail">
                                <span>Failed:</span> <strong>{stats.failed}</strong>
                            </div>
                        </div>
                    )}

                    <div className="console-wrapper">
                        <div className="console-header">
                            <div className="dots">
                                <span className="dot red"></span>
                                <span className="dot yellow"></span>
                                <span className="dot green"></span>
                            </div>
                            <span className="title">agent_terminal.log</span>
                        </div>
                        <div className="console-body">
                            {logs.length === 0 ? (
                                <p className="placeholder">System idle. Select parameters and click start to run agent.</p>
                            ) : (
                                logs.map((log, index) => (
                                    <div key={index} className="log-line">
                                        <span className="timestamp">[{new Date().toLocaleTimeString()}]</span> {log}
                                    </div>
                                ))
                            )}
                            <div ref={consoleEndRef} />
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .ingest-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding-bottom: 5rem;
                }
                .breadcrumbs {
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                    margin-bottom: 0.5rem;
                }
                .breadcrumbs Link {
                    color: var(--primary-color);
                    text-decoration: none;
                }
                .admin-header h1 {
                    font-size: 2rem;
                    color: var(--text-primary);
                    margin-bottom: 0.5rem;
                }
                .subtitle {
                    color: var(--text-secondary);
                    font-size: 0.95rem;
                }

                .dashboard-grid {
                    display: grid;
                    grid-template-columns: 1fr 1.2fr;
                    gap: 2rem;
                    margin-top: 2rem;
                }
                @media (max-width: 900px) {
                    .dashboard-grid {
                        grid-template-columns: 1fr;
                    }
                }

                .card {
                    background: white;
                    border: 1px solid var(--border-color);
                    border-radius: 16px;
                    padding: 2rem;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.02);
                }
                .card h2 {
                    font-size: 1.25rem;
                    color: var(--text-primary);
                    margin-bottom: 1.5rem;
                    border-bottom: 1px solid var(--border-color);
                    padding-bottom: 0.75rem;
                }

                .section {
                    margin-bottom: 1.5rem;
                }
                .section h3 {
                    font-size: 0.9rem;
                    color: var(--text-secondary);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-bottom: 0.75rem;
                }

                .grid-checkboxes {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 0.75rem;
                }
                .custom-city-form {
                    display: flex;
                    gap: 0.5rem;
                    margin-top: 1rem;
                }
                .custom-city-input {
                    flex: 1;
                    padding: 0.6rem 0.8rem;
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    font-size: 0.9rem;
                    background: #f8fafc;
                    transition: border-color 0.2s, background-color 0.2s;
                }
                .custom-city-input:focus {
                    outline: none;
                    border-color: #3b82f6;
                    background: white;
                }
                .custom-city-btn {
                    padding: 0.6rem 1rem;
                    border: none;
                    background: #3b82f6;
                    color: white;
                    border-radius: 8px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background-color 0.2s, transform 0.1s;
                }
                .custom-city-btn:hover:not(:disabled) {
                    background: #2563eb;
                }
                .custom-city-btn:disabled {
                    background: #cbd5e1;
                    cursor: not-allowed;
                }
                .list-checkboxes {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .checkbox-label {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.75rem;
                    border: 1px solid var(--border-color);
                    border-radius: 10px;
                    cursor: pointer;
                    font-size: 0.9rem;
                    font-weight: 500;
                    transition: all 0.2s ease;
                    background: #f8fafc;
                }
                .checkbox-label:hover {
                    background: #f1f5f9;
                    border-color: #cbd5e1;
                }
                .checkbox-label.checked {
                    background: #f0fdf4;
                    border-color: #86efac;
                    color: #166534;
                }
                .checkbox-label input {
                    width: 16px;
                    height: 16px;
                    accent-color: #22c55e;
                }

                .mode-select {
                    display: flex;
                    align-items: flex-start;
                    padding: 1rem;
                }
                .mode-select strong {
                    display: block;
                    font-size: 0.9rem;
                    margin-bottom: 0.15rem;
                }
                .helper-text {
                    font-size: 0.75rem;
                    color: #64748b;
                    display: block;
                }
                .checkbox-label.dry-mode.checked {
                    background: #eff6ff;
                    border-color: #bfdbfe;
                    color: #1e40af;
                }
                .checkbox-label.live-mode.checked {
                    background: #fef2f2;
                    border-color: #fecaca;
                    color: #991b1b;
                }

                .action-btn {
                    width: 100%;
                    padding: 1rem;
                    border: none;
                    background: #0f172a;
                    color: white;
                    border-radius: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    margin-top: 1rem;
                    box-shadow: 0 4px 12px rgba(15,23,42,0.15);
                }
                .action-btn:hover {
                    background: #1e293b;
                    transform: translateY(-2px);
                }
                .action-btn.running {
                    background: #64748b;
                    cursor: not-allowed;
                    transform: none;
                }

                /* Console Feed Styles */
                .progress-section {
                    margin-bottom: 1.5rem;
                }
                .progress-meta {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                    margin-bottom: 0.5rem;
                    font-weight: 500;
                }
                .progress-bar-bg {
                    height: 8px;
                    background: #e2e8f0;
                    border-radius: 50px;
                    overflow: hidden;
                }
                .progress-bar-fill {
                    height: 100%;
                    background: #3b82f6;
                    border-radius: 50px;
                    transition: width 0.3s ease;
                }

                .stats-results {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }
                .stat-pill {
                    padding: 0.5rem 1rem;
                    border-radius: 50px;
                    font-size: 0.85rem;
                    display: flex;
                    gap: 0.5rem;
                }
                .stat-pill.success { background: #dcfce7; color: #166534; }
                .stat-pill.skip { background: #f1f5f9; color: #475569; }
                .stat-pill.fail { background: #fee2e2; color: #991b1b; }

                .console-wrapper {
                    background: #0f172a;
                    border-radius: 12px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.15);
                    overflow: hidden;
                    border: 1px solid #1e293b;
                }
                .console-header {
                    background: #1e293b;
                    padding: 0.75rem 1rem;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    border-bottom: 1px solid #334155;
                }
                .dots {
                    display: flex;
                    gap: 0.5rem;
                }
                .dot {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                }
                .dot.red { background: #ef4444; }
                .dot.yellow { background: #f59e0b; }
                .dot.green { background: #10b981; }
                .console-header .title {
                    color: #94a3b8;
                    font-family: monospace;
                    font-size: 0.8rem;
                }
                .console-body {
                    padding: 1.25rem;
                    height: 350px;
                    overflow-y: auto;
                    font-family: 'Courier New', Courier, monospace;
                    font-size: 0.85rem;
                    color: #e2e8f0;
                    line-height: 1.5;
                }
                .log-line {
                    margin-bottom: 0.5rem;
                    white-space: pre-wrap;
                }
                .timestamp {
                    color: #64748b;
                    margin-right: 0.5rem;
                }
                .placeholder {
                    color: #64748b;
                    text-align: center;
                    padding-top: 8rem;
                    font-style: italic;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fadeIn 0.3s forwards ease-out;
                }
            `}</style>
        </div>
    );
}
