/**
 * Stats Card Component for Dashboard
 */

import React from 'react';
import './StatsCard.css';

const StatsCard = ({ title, value, icon, trend, color = 'blue', onClick }) => {
  const getColorStyles = () => {
    const colors = {
      blue: { bg: '#dbeafe', text: '#1e40af', icon: '#3b82f6' },
      green: { bg: '#d1fae5', text: '#065f46', icon: '#10b981' },
      purple: { bg: '#ede9fe', text: '#5b21b6', icon: '#8b5cf6' },
      orange: { bg: '#fed7aa', text: '#92400e', icon: '#f59e0b' },
      red: { bg: '#fee2e2', text: '#991b1b', icon: '#ef4444' }
    };
    return colors[color] || colors.blue;
  };
  
  const styles = getColorStyles();
  
  const formatValue = () => {
    if (typeof value === 'number') {
      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
      if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    }
    return value;
  };
  
  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend > 0) return '↑';
    if (trend < 0) return '↓';
    return '→';
  };
  
  const getTrendColor = () => {
    if (!trend) return '';
    if (trend > 0) return 'trend-positive';
    if (trend < 0) return 'trend-negative';
    return 'trend-neutral';
  };
  
  return (
    <div className="stats-card" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <div className="stats-header">
        <div className="stats-icon" style={{ backgroundColor: styles.bg, color: styles.icon }}>
          {icon}
        </div>
        {trend !== undefined && (
          <div className={`stats-trend ${getTrendColor()}`}>
            <span className="trend-icon">{getTrendIcon()}</span>
            <span className="trend-value">{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      
      <div className="stats-body">
        <div className="stats-value" style={{ color: styles.text }}>
          {formatValue()}
        </div>
        <div className="stats-title">{title}</div>
      </div>
    </div>
  );
};

export default StatsCard;