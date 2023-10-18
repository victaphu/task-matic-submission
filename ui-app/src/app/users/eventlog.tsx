import React from 'react';

function EventLog({ events } : { events: any[]}) {
  return (
    <div className="bg-gray-900 text-white p-4 rounded-lg mt-4">
      <h2 className="text-2xl font-semibold mb-4">Event Log</h2>
      <div className="space-y-4">
        {events.map((event, index) => (
          <div key={index} className="bg-gray-800 p-3 rounded-lg">
            <p className="text-sm text-gray-400">{event.taskId}</p>
            <p className="text-lg font-semibold">{event.title}</p>
            <p className="text-gray-300">{event.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EventLog;