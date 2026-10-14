import { useEffect, useState } from "react";
import web3 from "./lib/web3";
import mediaContract from "./contracts/media_contract";
import lighthouse from '@lighthouse-web3/sdk';
import './Media.css';

const Media = () => {

    const storageUrl = 'https://remote-asp-ooh71.lighthouseweb3.xyz/ipfs/';

    const apiKey = '36292a33.a0d8c4f83b5d4e66b23bebbc5184dca2';

    const [account, setAccount] = useState('');
    const [fileName, setFileName] = useState('');
    const [file, setFile] = useState(null);
    const [files, setFiles] = useState([]);

    const loadFiles = async () => {
        const result = await mediaContract.methods.get_files().call();
        const list = result
            .map((item, idx) => ({ ...item, idx }))
            .filter((item) => !item.deleted);
        setFiles(list);
    }

    useEffect(() => {
        const loadAccounts = async () => {
            const accounts = await web3.eth.getAccounts();
            if (accounts.length > 0) {
                setAccount(accounts[0]);
            }
        }

        loadAccounts();
        loadFiles();
        const handleChangedAccount = (accounts) => {
            setAccount(accounts[0]);
        }

        window.ethereum.on("accountsChanged", handleChangedAccount);

        return () => {
            window.ethereum.removeListener("accountsChanged", handleChangedAccount);
        }

    }, [])

    const createFile = async (e) => {
        e.preventDefault();
        if (!file) return;
        const uploadedResult = await lighthouse.upload([file], apiKey);

        await mediaContract.methods.new_file(uploadedResult.data.Hash, fileName).send({ from: account });
        e.target.reset();
        setFile(null);
        setFileName('');
        await loadFiles();
    }

    const deleteFile = async (idx) => {
        await mediaContract.methods.delete_file(idx).send({ from: account });
        await loadFiles();
    }

    return (
        <div>
            <h1>Account: {account}</h1>
            <form onSubmit={createFile}>
                <input type="text" onChange={(e) => setFileName(e.target.value)} placeholder="Set name for file" />
                <input type="file" onChange={(e) => setFile(e.target.files[0])} />
                <button type="submit">Upload file</button>
            </form>
            <div className="cards">
                {files.map((item) => (
                    <div className="card" key={item.idx}>
                        <img src={`${storageUrl}${item.cid}`} alt={item.name} />
                        <h4>{item.name}</h4>
                        <p>{item.creator}</p>
                        <p>{new Date(Number(item.timestamp) * 1000).toLocaleString()}</p>
                        {item.creator.toLowerCase() === account.toLowerCase() && (
                            <button onClick={() => deleteFile(item.idx)}>Delete</button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Media;
