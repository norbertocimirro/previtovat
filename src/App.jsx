import React, { useState } from 'react';

const SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const CHARACTERISTIC_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";

export default function App() {
  const [status, setStatus] = useState('Desconectado');
  const [dados, setDados] = useState('-- mmHg | -- s');

  const conectarBluetooth = async () => {
    try {
      setStatus('Procurando Previto VAT...');
      
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: 'Previto' }],
        optionalServices: [SERVICE_UUID]
      });

      setStatus('Conectando ao servidor GATT...');
      const server = await device.gatt.connect();

      setStatus('Acessando Serviço Médico...');
      const service = await server.getPrimaryService(SERVICE_UUID);

      setStatus('Sincronizando Dados...');
      const characteristic = await service.getCharacteristic(CHARACTERISTIC_UUID);

      await characteristic.startNotifications();

      characteristic.addEventListener('characteristicvaluechanged', (event) => {
        const value = event.target.value;
        const decoder = new TextDecoder('utf-8');
        setDados(decoder.decode(value));
      });

      setStatus('Conectado e Monitorando! 🟢');
    } catch (error) {
      console.error(error);
      setStatus('Erro: ' + error.message);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif', textAlign: 'center', backgroundColor: '#f4f4f9', minHeight: '100vh' }}>
      
      <h1 style={{ color: '#1a1a2e' }}>Painel Tático: Previto VAT v2.0</h1>
      <p style={{ color: status.includes('Conectado') ? 'green' : '#666', fontWeight: 'bold' }}>
        Status: {status}
      </p>
      
      <button
        onClick={conectarBluetooth}
        style={{ 
          padding: '12px 24px', 
          fontSize: '16px', 
          backgroundColor: '#16213e', 
          color: '#fff', 
          border: 'none',
          borderRadius: '8px', 
          cursor: 'pointer',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}
      >
        📡 Conectar Dispositivo BLE
      </button>

      <div style={{ 
        marginTop: '3rem', 
        padding: '3rem', 
        backgroundColor: '#fff',
        border: '2px solid #e0e0e0', 
        borderRadius: '16px',
        maxWidth: '500px',
        margin: '3rem auto',
        boxShadow: '0 10px 20px rgba(0,0,0,0.05)'
      }}>
        <p style={{ margin: 0, color: '#888', textTransform: 'uppercase', letterSpacing: '2px' }}>Pressão | Tempo de Resposta</p>
        <h2 style={{ fontSize: '3rem', margin: '10px 0', color: '#e43f5a' }}>
          {dados}
        </h2>
      </div>

    </div>
  );
}
