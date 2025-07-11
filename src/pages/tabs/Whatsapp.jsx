import Button from "@/components/Button";
import ConfirmModal from '@/pages/modals/Confirm'
import { useState } from "react";

const WhatsappPage = ({ connected, setConnected, loading, setLoading }) => {
  const [open, setOpen] = useState(false);
  const handleConnect = async () => {
    setLoading(true);
    try {
      const response = await window.electronAPI.whatsappConnect();
      console.log(response);
    } catch (error) {
      window.electronAPI.sendLog(`Erro ao conectar: ${error.message || error}`);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      const response = await window.electronAPI.whatsappDisconnect();
      console.log(response);
    } catch (error) {
      window.electronAPI.sendLog(`Erro ao desconectar: ${error.message || error}`);
    }
    setLoading(false);
  };

  const handleClearSession = async () => {
    setOpen(false);
    try {
      await window.electronAPI.clearWhatsappSession();
    } catch (error) {
      window.electronAPI.sendLog(`Erro ao limpar sessão: ${error.message || error}`);
    }
  }

  const handleCancelConnection = async () => {
    setLoading(true);
    try {
      await window.electronAPI.cancelWhatsappConnection();
    } catch (error) {
      window.electronAPI.sendLog(`Erro ao cancelar conexão: ${error.message || error}`);
    }
    setLoading(false);
  }

  return (
    <>
      <article>
        <h1>WhatsApp</h1>
        <p>Envie mensagens automáticas!</p>
      </article>
      <Button message={loading && !connected ? "Cancelar Conexão" : "Conectar ao WhatsApp"} disable={connected} onClick={loading && !connected
        ? handleCancelConnection
        : handleConnect} />
      <Button message={"Desconectar"} disable={!connected || loading} onClick={handleDisconnect} />
      <Button message={"Limpar Sessão"} disable={connected || loading} onClick={() => { setOpen(true) }} />
      <ConfirmModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onClickFunction={handleClearSession}
      />
    </>
  );
}
export default WhatsappPage;