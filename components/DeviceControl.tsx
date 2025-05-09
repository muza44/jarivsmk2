import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Power, Thermometer, Video, Settings } from 'lucide-react';
import { AutomationService } from '@/lib/automation-service';

export default function DeviceControl() {
  const [devices, setDevices] = useState<any[]>([]);
  const [automations, setAutomations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const automationService = AutomationService.getInstance();

  useEffect(() => {
    const init = async () => {
      await automationService.initialize();
      loadDevices();
      loadAutomations();
    };
    init();
  }, []);

  const loadDevices = async () => {
    setLoading(true);
    try {
      const deviceList = automationService.getDevices();
      setDevices(deviceList);
    } catch (error) {
      setError('Erro ao carregar dispositivos');
      console.error('Erro ao carregar dispositivos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAutomations = async () => {
    try {
      const automationList = automationService.getAutomations();
      setAutomations(automationList);
    } catch (error) {
      console.error('Erro ao carregar automações:', error);
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'light':
        return <Lightbulb className="text-yellow-400" size={24} />;
      case 'switch':
        return <Power className="text-blue-400" size={24} />;
      case 'thermostat':
        return <Thermometer className="text-red-400" size={24} />;
      case 'camera':
        return <Video className="text-green-400" size={24} />;
      default:
        return <Settings className="text-gray-400" size={24} />;
    }
  };

  const handleDeviceAction = async (deviceId: string, action: string, params: any) => {
    try {
      await automationService.updateDeviceState(deviceId, { ...params, action });
      loadDevices(); // Recarrega a lista de dispositivos
    } catch (error) {
      console.error('Erro ao executar ação:', error);
    }
  };

  const toggleAutomation = async (automationId: string, enabled: boolean) => {
    try {
      await automationService.toggleAutomation(automationId, enabled);
      loadAutomations(); // Recarrega a lista de automações
    } catch (error) {
      console.error('Erro ao alternar automação:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 bg-black/40 rounded-lg border border-cyan-400/20"
    >
      <h2 className="text-xl font-semibold text-cyan-400 mb-6">Controle de Dispositivos</h2>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400" />
        </div>
      ) : error ? (
        <div className="text-red-400 text-center py-8">{error}</div>
      ) : (
        <div className="space-y-6">
          {/* Lista de Dispositivos */}
          <div>
            <h3 className="text-lg font-medium text-cyan-300 mb-4">Dispositivos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {devices.map(device => (
                <div
                  key={device.id}
                  className="bg-black/20 p-4 rounded-lg border border-cyan-400/10"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getDeviceIcon(device.type)}
                      <div>
                        <h4 className="text-cyan-100 font-medium">{device.name}</h4>
                        <p className="text-cyan-400/60 text-sm">{device.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${
                        device.status === 'online' ? 'bg-green-400' : 'bg-red-400'
                      }`} />
                      <span className="text-cyan-400/60 text-sm">
                        {device.status === 'online' ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>

                  {/* Controles específicos por tipo de dispositivo */}
                  {device.type === 'light' && (
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleDeviceAction(device.id, 'toggle', { on: !device.state?.on })}
                        className="px-3 py-1 bg-cyan-400/20 hover:bg-cyan-400/30 rounded text-cyan-300"
                      >
                        {device.state?.on ? 'Desligar' : 'Ligar'}
                      </button>
                      {device.state?.on && (
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={device.state?.brightness || 0}
                          onChange={(e) => handleDeviceAction(device.id, 'brightness', { brightness: parseInt(e.target.value) })}
                          className="w-24"
                        />
                      )}
                    </div>
                  )}

                  {device.type === 'thermostat' && (
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleDeviceAction(device.id, 'temperature', { temperature: (device.state?.temperature || 20) - 1 })}
                        className="px-2 py-1 bg-cyan-400/20 hover:bg-cyan-400/30 rounded text-cyan-300"
                      >
                        -
                      </button>
                      <span className="text-cyan-100">
                        {device.state?.temperature || 20}°C
                      </span>
                      <button
                        onClick={() => handleDeviceAction(device.id, 'temperature', { temperature: (device.state?.temperature || 20) + 1 })}
                        className="px-2 py-1 bg-cyan-400/20 hover:bg-cyan-400/30 rounded text-cyan-300"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Lista de Automações */}
          <div>
            <h3 className="text-lg font-medium text-cyan-300 mb-4">Automações</h3>
            <div className="space-y-3">
              {automations.map(automation => (
                <div
                  key={automation.id}
                  className="bg-black/20 p-4 rounded-lg border border-cyan-400/10"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-cyan-100 font-medium">{automation.name}</h4>
                      <p className="text-cyan-400/60 text-sm">
                        Gatilho: {automation.trigger.type}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleAutomation(automation.id, !automation.enabled)}
                      className={`px-3 py-1 rounded ${
                        automation.enabled
                          ? 'bg-green-400/20 text-green-300'
                          : 'bg-red-400/20 text-red-300'
                      }`}
                    >
                      {automation.enabled ? 'Ativo' : 'Inativo'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
} 