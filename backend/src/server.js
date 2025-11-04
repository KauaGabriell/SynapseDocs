/**Importando Pacotes */
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import 'dotenv/config'
import session from 'express-session';
import passport from 'passport'

/**Importanto arquivos */
import db from './models/index.js'
import passportConfig from './config/passport.js'
import authRoutes from './routes/authRoutes.js'

/**Inicializa a instância do Express */
const app = express();

const PORT = process.env.PORT /*Porta do servidor que vem do ENV */

passportConfig(passport);

/**Middlewares */ 
app.use(cors()); //Faz com que o frontend faça requisições para o backend
app.use(helmet()); //Adiciona camadas se segurança HTTP(Headers)
app.use(express.json()); //Express entenda JSON
app.use(express.urlencoded({extended: true}));
app.use(session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session())



/**Rota Teste de Saúde da Api */
app.get('/api', (req, res) => {
    res.json({message: 'API FUNCIONANDO'})
})
//Rota de autenticação(/github e /github/callback);
app.use('/api/auth', authRoutes);

/**Inicia o Servidor */
app.listen(PORT, async () =>{
    try {
        await db.sequelize.authenticate();
        await db.sequelize.sync({force: true});
        console.log('Base de dados carregada com sucesso!')
        console.log(`Servidor rodando em: http://localhost:${PORT}`);
    } catch (error) {
        console.log(`Erro ao carregar base de dados: ${error}`)
    }
})

