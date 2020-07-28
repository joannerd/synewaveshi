import React from 'react';

const History = ({ syneHistory, username }) => (
  <ul id="history">
    <h3>History</h3>
    {syneHistory.map(({ timestamp, value, user }, i) => {
      const alignClass = user === username ? 'right' : 'left';
      return (
        <li key={i}>
          <div className="time">{timestamp}</div>
          <p className="msg">{value}</p>
          <div className={`user ${alignClass}`}>{user}</div>
        </li>
      );
    })}
  </ul>
);

export default History;
