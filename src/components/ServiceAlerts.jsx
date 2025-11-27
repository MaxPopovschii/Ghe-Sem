// Componente per alert scioperi e interruzioni servizio
import React from 'react';
import { AlertTriangle, X, Info } from 'lucide-react';
import useStore from '../store/useStore';

const ServiceAlerts = () => {
  const { serviceAlerts } = useStore();
  const [dismissedAlerts, setDismissedAlerts] = React.useState([]);

  if (serviceAlerts.length === 0) return null;

  const visibleAlerts = serviceAlerts.filter(
    alert => !dismissedAlerts.includes(alert.id)
  );

  if (visibleAlerts.length === 0) return null;

  const handleDismiss = (alertId) => {
    setDismissedAlerts([...dismissedAlerts, alertId]);
  };

  return (
    <div className="fixed top-16 left-4 right-4 z-[1001] space-y-2">
      {visibleAlerts.map(alert => (
        <AlertCard
          key={alert.id}
          alert={alert}
          onDismiss={() => handleDismiss(alert.id)}
        />
      ))}
    </div>
  );
};

const AlertCard = ({ alert, onDismiss }) => {
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'HIGH':
        return {
          bg: 'linear-gradient(135deg, rgba(227, 6, 19, 0.95), rgba(180, 5, 15, 0.95))',
          border: 'rgba(255, 255, 255, 0.3)',
        };
      case 'MEDIUM':
        return {
          bg: 'linear-gradient(135deg, rgba(255, 165, 0, 0.95), rgba(204, 132, 0, 0.95))',
          border: 'rgba(255, 255, 255, 0.3)',
        };
      default:
        return {
          bg: 'linear-gradient(135deg, rgba(59, 130, 246, 0.95), rgba(37, 99, 235, 0.95))',
          border: 'rgba(255, 255, 255, 0.3)',
        };
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'STRIKE':
        return <AlertTriangle className="text-white" size={24} />;
      default:
        return <Info className="text-white" size={24} />;
    }
  };

  const colors = getSeverityColor(alert.severity);

  return (
    <div
      className="rounded-xl p-4 backdrop-blur-md shadow-xl animate-in slide-in-from-top duration-300"
      style={{
        background: colors.bg,
        border: `2px solid ${colors.border}`,
      }}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getTypeIcon(alert.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-bold text-base mb-1">
            {alert.title}
          </h3>
          <p className="text-white/90 text-sm mb-2">
            {alert.description}
          </p>
          
          {alert.affectedLines && alert.affectedLines.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {alert.affectedLines.map((line, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-white/20 text-white text-xs rounded font-semibold"
                >
                  {line}
                </span>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={onDismiss}
          className="flex-shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X className="text-white" size={20} />
        </button>
      </div>
    </div>
  );
};

export default ServiceAlerts;
