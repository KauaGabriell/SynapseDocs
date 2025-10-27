/**Importando Pacotes */
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import 'dotenv/config'

/**Inicializa a instância do Express */
const app = express();

const PORT = process.env.PORT /*Porta do servidor que vem do ENV */

/**Middlewares */ 
app.use(cors()); //Faz com que o frontend faça requisições para o backend
app.use(helmet()); //Adiciona camadas se segurança HTTP(Headers)
app.use(express.json()); //Express entenda JSON
app.use(express.urlencoded({extended: true}));


/**Rota Teste de Saúde da Api */
app.get('/api', (req, res) => {
    res.json({message: 'API FUNCIONANDO'})
})

/**Inicia o Servidor */
app.listen(PORT, () =>{
    console.log(`Servidor rodando em: http://localhost:${PORT}`);
})

