import '@/components/Status/Status.css';

const Status = ({active, loading}) => {
    return(
        <section className='status-container'>
            <div className='status-content'>
                <h2>Status WhatsApp</h2>
                <div className={`status ${active ? 'connected' : 'disconnected'}`}>
                    {active ? 'Conectado' : 'Desconectado'}
                </div>
            </div>
        </section>
    );
}

export default Status;