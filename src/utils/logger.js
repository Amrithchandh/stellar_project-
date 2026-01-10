export const logBehavioralEvent = (event, data) => {
  const sessionID = localStorage.getItem('study_session_id') || 'session_' + Date.now();
  if (!localStorage.getItem('study_session_id')) {
    localStorage.setItem('study_session_id', sessionID);
  }

  const logs = JSON.parse(localStorage.getItem('behavioral_logs') || '[]');
  const entry = {
    timestamp: new Date().toISOString(),
    sessionID,
    event,
    ...data
  };
  
  logs.push(entry);
  localStorage.setItem('behavioral_logs', JSON.stringify(logs));
  console.log('[Behavior Log]:', entry);
};

export const getBehavioralLogs = () => {
  return JSON.parse(localStorage.getItem('behavioral_logs') || '[]');
};

export const exportLogsCSV = () => {
  const logs = getBehavioralLogs();
  if (logs.length === 0) return '';
  
  const headers = Object.keys(logs[0]).join(',');
  const rows = logs.map(log => 
    Object.values(log).map(val => 
      typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val
    ).join(',')
  );
  
  return [headers, ...rows].join('\n');
};
