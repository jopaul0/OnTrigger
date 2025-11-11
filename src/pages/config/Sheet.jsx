import Button from "@/components/Button";
import InputText from "@/components/InputText";
import { useState, useEffect } from 'react';
import ConfirmModal from "@/pages/modals/Confirm";
import { ErrorModal, SuccessModal } from "@/components/Modal"

export default function SheetPage() {
    const [value, setValue] = useState('');
    const [open, setOpen] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(false);
    const [currentId, setCurrentId] = useState('');

    useEffect(() => {
        window.electronAPI.getSheetId().then((id) => {
            setCurrentId(id);
        });
    }, []);

    const handleSaveIdSheet = () => {
        setOpen(false);
        if (!value) {
            setError(true);
            return;
        }

        window.electronAPI.saveSheetId(value);
        setSuccess(true);
        setCurrentId(value);
        setValue('');
    };

    return (
        <div className="page-content">
            <div className="left">
                <h2>Configuração da Planilha</h2>
                <p>
                    Para que o sistema funcione corretamente, é necessário ter uma planilha no Google Sheets com colunas específicas na ordem certa: Nome da Organização, Nome do Pessoa, Data do Aniversário e o Número do Whatsapp.
                </p>
                <p>
                    O campo de data de nascimento deve estar no formato <strong>dd/mm/aaaa</strong>, e o número de telefone deve conter apenas os dígitos, começando com o <strong>DDI</strong> (ex: 5599999999999).
                </p>
                <p>
                    Não se esqueça de compartilhar a planilha com a conta de serviço utilizada no sistema, garantindo assim o acesso à leitura dos dados.
                </p>
            </div>
            <div className="right">
                <h2>Como obter o ID da planilha</h2>
                <p>
                    Para que o sistema acesse corretamente sua planilha, você deve informar o <strong>ID da planilha</strong>.
                </p>
                <p>
                    Exemplo de URL:
                    <br />
                    <code>https://docs.google.com/spreadsheets/d/<strong>1AbcD1234EFgHijKLmNopQrStuVWxyz7890</strong>/edit#gid=0</code>
                </p>

                <p>
                    Nesse caso, o trecho em negrito é o ID.
                </p>
                <p style={{backgroundColor:'#1d424b', padding:'.5rem', borderRadius:'10px', margin:'20px 0', fontSize:'14px'}}>
                    ID atual:<br /> <strong>{currentId || 'Nenhum ID definido'}</strong>
                </p>
                <form>
                    <InputText
                        label="ID da Planilha"
                        placeholder="Digite o ID"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        name="id"
                    />

                    <Button
                        message={'Enviar ID'}
                        onClick={(e) => {
                            e.preventDefault();
                            setOpen(true);
                        }}
                    />

                </form>
            </div>
            <ConfirmModal
                isOpen={open}
                onClose={() => setOpen(false)}
                onClickFunction={handleSaveIdSheet}
            />
            <SuccessModal isOpen={success} onClose={() => setSuccess(false)} message="ID atualizado com sucesso!" />
            <ErrorModal isOpen={error} onClose={() => setError(false)} message="Ocorreu um erro." />
        </div>
    );
}
