// Conjunto de Primos até 100 (exceto 2)
const P100 = [
    3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47,
    53, 59, 61, 67, 71, 73, 79, 83, 89, 97
];

const MAX_PRIMO = 97;

// Raízes Digitais Válidas dos Primos de P100 > 3
const RD_PRIMOS_MAIORES_QUE_3 = [1, 2, 4, 5, 7, 8];

// Mapeamento das Tabelas
const TABELA_SO = { 
    1: { 1: 2, 2: 3, 4: 5, 5: 6, 7: 8, 8: 9 }, 
    2: { 1: 3, 2: 4, 4: 6, 5: 7, 7: 9, 8: 1 }, 
    4: { 1: 5, 2: 6, 4: 8, 5: 9, 7: 2, 8: 3 }, 
    5: { 1: 6, 2: 7, 4: 9, 5: 1, 7: 3, 8: 4 },
    7: { 1: 8, 2: 9, 4: 2, 5: 3, 7: 5, 8: 6 },
    8: { 1: 9, 2: 1, 4: 3, 5: 4, 7: 6, 8: 7 }
};

const TABELA_PR = { 
    1: { 1: 1, 2: 2, 4: 4, 5: 5, 7: 7, 8: 8 },
    2: { 1: 2, 2: 4, 4: 8, 5: 1, 7: 5, 8: 7 }, 
    4: { 1: 4, 2: 8, 4: 7, 5: 2, 7: 1, 8: 5 }, 
    5: { 1: 5, 2: 1, 4: 2, 5: 7, 7: 8, 8: 4 },
    7: { 1: 7, 2: 5, 4: 1, 5: 8, 7: 4, 8: 2 },
    8: { 1: 8, 2: 7, 4: 5, 5: 4, 7: 2, 8: 1 }
};

let chaveSecreta = {
    n: null,
    p: null,
    q: null,
    username: '',
    password: ''
};

// --- Funções Auxiliares ---

function calcularRaizDigital(n) {
    let soma = n;
    while (soma > 9) {
        let temp = 0;
        let strSoma = String(soma);
        for (let i = 0; i < strSoma.length; i++) {
            temp += parseInt(strSoma[i]);
        }
        soma = temp;
    }
    return soma;
}

function log(mensagem, limpar = false) {
    const logDiv = document.getElementById('log-quebra');
    const p = document.createElement('p');
    p.textContent = `[${new Date().toLocaleTimeString()}] ${mensagem}`;
    
    if (limpar) {
        logDiv.innerHTML = '';
    }
    logDiv.appendChild(p);
    logDiv.scrollTop = logDiv.scrollHeight; 
}

function isPrimoP100(num) {
    return P100.includes(num);
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Constrói o conjunto das somas (S) para um conjunto de Raízes Digitais (d)
 * de forma didática e eficiente.
 * @param {number[]} rdSomasArray - Conjunto das Raízes Digitais da Soma (d).
 * @param {number} n - Chave pública n.
 * @returns {object} - {conjuntoS: number[], logSomas: string[]}
 */
function gerarConjuntoSomas(rdSomasArray, n) {
    let conjuntoS = [];
    let logSomas = [];
    const maxS = n + MAX_PRIMO; 

    rdSomasArray.forEach(rd => {
        let termosLog = [];
        let soma = rd;
        
        // Se a RD é 9 (ou 0), o menor valor é 9
        if (rd === 0 || rd === 9) soma = 9;

        // Garante que o primeiro termo seja pelo menos 2 (p+q deve ser > 2)
        while (soma < 2) {
            soma += 9;
        }

        while (soma < maxS) { 
            // Otimização: p+q deve ser maior que 2 * sqrt(n) (se não, delta < 0)
            if (soma > Math.sqrt(4 * n)) { 
                conjuntoS.push(soma);
                if (termosLog.length < 6) { // Limita o log para 6 termos
                    termosLog.push(soma);
                }
            } else if (termosLog.length < 6) {
                termosLog.push(soma);
            }
            soma += 9;
        }
        
        let logStr = `{${termosLog.join(',')}`;
        if (conjuntoS.length > 6) {
             logStr += ',...}';
        } else {
             logStr += '}';
        }
        logSomas.push(`  RD = ${rd}: ${logStr}`);
    });

    conjuntoS = [...new Set(conjuntoS)]; 
    conjuntoS.sort((a, b) => a - b);
    
    return { conjuntoS, logSomas };
}

// --- Geração de Chave ---

function gerarChaveAleatoria() {
    let n, p, q, rd_n;

    do {
        let idx_p = Math.floor(Math.random() * P100.length);
        let idx_q = Math.floor(Math.random() * P100.length);
        
        p = P100[idx_p];
        q = P100[idx_q];
        n = p * q;
        rd_n = calcularRaizDigital(n);

        // Se n é múltiplo de 3, um dos fatores TEM que ser 3.
        if (rd_n % 3 === 0 && p !== 3 && q !== 3) {
            n = 0; 
            continue;
        }
    } while (n < 100 || n > (MAX_PRIMO * MAX_PRIMO)); 

    document.getElementById('input-n').value = n;
    log(`Chave pública 'n' gerada: ${n} (fatores: ${p}, ${q}). RD(n) = ${rd_n}.`);
    
    chaveSecreta.n = n;
    chaveSecreta.p = p;
    chaveSecreta.q = q;
}

// --- Lógica Principal ---

async function iniciarQuebra() {
    const n = parseInt(document.getElementById('input-n').value);
    const username = document.getElementById('input-username').value.trim();
    const password = document.getElementById('input-password').value.trim();
    const aviso = document.getElementById('aviso-login');

    if (isNaN(n) || n < 9 || n > (MAX_PRIMO * MAX_PRIMO)) {
        aviso.textContent = `Chave n inválida. Por favor, GERE uma chave primeiro.`;
        return;
    }
    if (username === '' || password === '') {
        aviso.textContent = "Preencha o Username e a Senha para simular a criação da chave.";
        return;
    }

    chaveSecreta.username = username;
    chaveSecreta.password = password;

    if (chaveSecreta.n !== n) {
        chaveSecreta.n = n;
        chaveSecreta.p = null; 
        chaveSecreta.q = null; 
    }

    document.getElementById('login-section').style.display = 'none';
    document.getElementById('quebra-section').style.display = 'block';
    
    const raizDigitalN = calcularRaizDigital(n);
    
    document.getElementById('display-n').textContent = n;
    document.getElementById('display-raiz').textContent = raizDigitalN;
    
    await quebrarChave(n, raizDigitalN);
}

async function quebrarChave(n, raizDigitalN) {
    log(`Início da Criptoanálise para n = ${n}.`, true);
    await delay(500);
    
    log(`Passo 1: Calculando RD(n) = ${raizDigitalN}. O produto RD(p) * RD(q) deve ser ${raizDigitalN}.`);
    await delay(1000);

    log(`Passo 2: Mapeando Raízes da Soma (RD(p+q)) a partir de RD(n).`);
    
    let possiveisRaizesSoma = new Set();

    if (raizDigitalN % 3 === 0) {
        log(`  RD(n) é múltiplo de 3. Um dos fatores é 3. A RD do outro fator é RD(n/3).`);
        const rd_outro_fator = calcularRaizDigital(Math.floor(n / 3)); // Math.floor() pois n é p*q
        
        // RD da Soma = RD(3 + RD(n/3))
        const rd_soma_manual = calcularRaizDigital(3 + rd_outro_fator);
        possiveisRaizesSoma.add(rd_soma_manual);

    } else {
        log(`  RD(n) não é múltiplo de 3. Mapeando pares (RDp, RDq) em {1, 2, 4, 5, 7, 8} e usando a tabela 'so':`);
        
        for (const rd_p_str of RD_PRIMOS_MAIORES_QUE_3) {
            const rd_p = parseInt(rd_p_str);
            for (const rd_q_str of RD_PRIMOS_MAIORES_QUE_3) {
                const rd_q = parseInt(rd_q_str);
                
                // Verifica o Produto na Tabela PR
                const resultado_pr = TABELA_PR[rd_p][rd_q];
                
                if (resultado_pr === raizDigitalN) {
                    // Mapeia para a Raiz Digital da Soma na Tabela SO
                    const rd_soma = TABELA_SO[rd_p][rd_q];
                    possiveisRaizesSoma.add(rd_soma);
                }
            }
        }
    }

    const rdSomasArray = Array.from(possiveisRaizesSoma).sort((a,b) => a-b);
    log(`  Raízes Digitais da Soma (d) encontradas: D = {${rdSomasArray.join(', ')}}.`);
    await delay(1500);
    
    log(`Passo 3: Construindo o Conjunto S de Somas (p+q) a partir dessas RDs.`);
    const { conjuntoS, logSomas } = gerarConjuntoSomas(rdSomasArray, n);
    
    logSomas.forEach(l => log(l));
    await delay(1500);

    log(`Passo 4: Resolvendo a Equação Quadrática x² - S*x + n = 0.`);
    
    let p_final = 0;
    let q_final = 0;
    let chaveQuebrada = false;

    for (let i = 0; i < conjuntoS.length; i++) {
        const S = conjuntoS[i];
        
        const delta = (S * S) - (4 * n);

        log(`\n-> Testando Soma S = ${S}:`);
        await delay(300);

        if (delta < 0) continue; 

        const sqrtDelta = Math.sqrt(delta);

        if (sqrtDelta !== Math.floor(sqrtDelta)) continue; 

        log(`  DELTA = ${delta}. Raiz Quadrada exata: ${sqrtDelta}. Possível!`);

        p_final = (S + sqrtDelta) / 2;
        q_final = (S - sqrtDelta) / 2;

        log(`  Raízes encontradas: p = ${p_final} e q = ${q_final}.`);
        await delay(500);

        // Condição de Quebra: p e q são inteiros, p*q=n, e p,q são primos em P100.
        if (Number.isInteger(p_final) && Number.isInteger(q_final) && p_final * q_final === n && isPrimoP100(p_final) && isPrimoP100(q_final)) {
            chaveQuebrada = true;
            log(`\n\n🎉 SUCESSO! CHAVE QUEBRADA! Fatores p=${p_final} e q=${q_final} encontrados.`);
            break;
        } else {
            log(`  ERRO: Não são fatores primos válidos. Próxima tentativa...`);
            await delay(500);
        }
    }

    // Exibe o resultado final
    if (chaveQuebrada) {
        document.getElementById('display-p').textContent = p_final;
        document.getElementById('display-q').textContent = q_final;
        document.getElementById('display-username-final').textContent = chaveSecreta.username;
        document.getElementById('display-senha-final').textContent = chaveSecreta.password; 
        document.getElementById('resultado-final').style.display = 'block';
    } else {
        log(`\n\nFIM DA BUSCA. A chave n=${n} não pôde ser quebrada com este algoritmo.`, false);
    }
}

// --- Funções de Interface ---

function resetarPagina() {
    document.getElementById('input-n').value = '';
    document.getElementById('input-username').value = '';
    document.getElementById('input-password').value = '';
    document.getElementById('aviso-login').textContent = '';
    document.getElementById('quebra-section').style.display = 'none';
    document.getElementById('login-section').style.display = 'block';
    document.getElementById('log-quebra').innerHTML = '';
    document.getElementById('resultado-final').style.display = 'none';
    chaveSecreta = { n: null, p: null, q: null, username: '', password: '' };
}
