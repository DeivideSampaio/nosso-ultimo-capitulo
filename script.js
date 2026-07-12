/* ==========================================
   NOSSO ÚLTIMO CAPÍTULO
   SCRIPT.JS COMPLETO - INTEGRADO COM FETCH
========================================== */

//==============================
// DATA FINAL (Cronômetro Principal)
//==============================
const DATA_FINAL_GERAL = new Date("2026-07-14T20:00:00");

//==============================
// ELEMENTOS DE NAVEGAÇÃO E INTERFACE
//==============================
const telaPrincipal = document.getElementById("tela-principal");
const conteudoDinamico = document.getElementById("conteudo-dinamico");
const btnVoltar = document.getElementById("btnVoltar");

const hora1 = document.getElementById("hora1");
const hora2 = document.getElementById("hora2");
const minutos = document.getElementById("minutos");
const segundos = document.getElementById("segundos");

const intro = document.getElementById("intro");
const btnComecar = document.getElementById("btnComecar");

const musica = document.getElementById("musica");
const btnMusica = document.getElementById("btnMusica");

//==============================
// INTRO
//==============================
if(btnComecar){
    btnComecar.addEventListener("click",()=>{
        intro.classList.add("hide");
        musica.play().catch(()=>{});
    });
}

//==============================
// MÚSICA
//==============================
let tocando = false;

if(btnMusica){
    btnMusica.addEventListener("click",()=>{
        if(!tocando){
            musica.play().catch(()=>{});
            btnMusica.innerHTML="🔇";
            tocando=true;
        }else{
            musica.pause();
            btnMusica.innerHTML="🎵";
            tocando=false;
        }
    });
}

//==============================
// CARREGAMENTO DINÂMICO VIA FETCH
//==============================
function carregarPaginaCapitulo(nomeArquivo) {
    const url = `capitulos/${nomeArquivo}.html`;

    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error("Erro ao carregar");
            return response.text();
        })
        .then(html => {
            conteudoDinamico.innerHTML = html;
            
            // Adiciona a classe que oculta os contadores/cards e ativa o espaço de leitura
            telaPrincipal.classList.add("esconder-subelementos");
            document.getElementById("container-leitura").style.display = "block";
            
            window.scrollTo({ top: 0, behavior: 'smooth' });
        })
        .catch(err => {
            console.error(err);
            alert("Não foi possível abrir o capítulo no momento.");
        });
}

// Evento para voltar à listagem inicial de cards
if(btnVoltar) {
    btnVoltar.addEventListener("click", () => {
        telaPrincipal.classList.remove("esconder-subelementos");
        document.getElementById("container-leitura").style.display = "none";
        conteudoDinamico.innerHTML = "";
    });
}

// Configura o clique no Capítulo I (que já começa com a classe .liberado)
const cap1 = document.getElementById("cap1");
if(cap1) {
    cap1.onclick = () => carregarPaginaCapitulo("cap1");
}

//==============================
// CONTADOR PRINCIPAL
//==============================
function atualizarContadorPrincipal(){
    const agora = new Date();
    const diferenca = DATA_FINAL_GERAL - agora;

    if(diferenca <= 0){
        // Quando o contador geral zera, abre o capítulo final na mesma tela
        carregarPaginaCapitulo("final");
        return;
    }

    const horas = Math.floor(diferenca / (1000 * 60 * 60));
    const mins = Math.floor((diferenca % (1000 * 60 * 60)) / (1000 * 60));
    const segs = Math.floor((diferenca % (1000 * 60)) / 1000);

    const h = String(horas).padStart(2,"0");

    if(hora1){
        hora1.textContent=h[0];
        hora2.textContent=h[1];
        minutos.textContent=String(mins).padStart(2,"0");
        segundos.textContent=String(segs).padStart(2,"0");
    }

    if(horas>=10){
        hora1.classList.add("blur");
    }else{
        hora1.classList.remove("blur");
    }

    const frase = document.querySelector(".textoContador");
    if(frase){
        if(horas>48){
            frase.innerHTML="Algumas palavras precisam esperar o momento certo.";
        }else if(horas>24){
            frase.innerHTML="Estamos nos aproximando do último capítulo.";
        }else if(horas>10){
            frase.innerHTML="Cada hora revela um novo pedaço da história.";
        }else if(horas>1){
            frase.innerHTML="Está quase na hora...";
        }else{
            frase.innerHTML="Chegou o momento.";
        }
    }
}

setInterval(atualizarContadorPrincipal, 1000);
atualizarContadorPrincipal();

//==============================
// LIBERAÇÃO SEQUENCIAL DOS CAPÍTULOS
//==============================
const TEMPO_ENTRE_CAPITULOS = 8 * 60 * 60 * 1000;

// Vincula o ID de cada card ao nome exato do arquivo correspondente dentro da pasta capitulos/
const capitulosSequenciais = [
    { id: "cap2", arquivo: "cap2", libera: null }, 
    { id: "cap3", arquivo: "cap3", libera: null }, 
    { id: "cap4", arquivo: "cap4", libera: null }, 
    { id: "cap5", arquivo: "cap5", libera: null },
    { id: "cap6", arquivo: "final", libera: null }
];

function definirDatasLiberacao() {
    let tempoInicial;

    // Verifica se já existe uma data de início salva no navegador do usuário
    if (localStorage.getItem("inicioJornada")) {
        // Se existir, recupera ela
        tempoInicial = parseInt(localStorage.getItem("inicioJornada"));
    } else {
        // Se for o primeiro acesso, captura o momento atual e salva na memória do navegador
        tempoInicial = new Date().getTime();
        localStorage.setItem("inicioJornada", tempoInicial);
    }

    // Define a data de liberação do primeiro capítulo da sequência (cap2) baseado no primeiro acesso definitivo
    capitulosSequenciais[0].libera = new Date(tempoInicial + TEMPO_ENTRE_CAPITULOS);

    // Define as datas dos capítulos subsequentes em cascata
    for(let i = 1; i < capitulosSequenciais.length; i++) {
        const dataAnterior = capitulosSequenciais[i - 1].libera.getTime();
        capitulosSequenciais[i].libera = new Date(dataAnterior + TEMPO_ENTRE_CAPITULOS);
    }
}


definirDatasLiberacao();

function atualizarCapitulos(){
    const agora = new Date();
    let proximo = null;

    for(let i = 0; i < capitulosSequenciais.length; i++){
        if(agora < capitulosSequenciais[i].libera){
            proximo = capitulosSequenciais[i];
            break;
        }
    }

    capitulosSequenciais.forEach((cap, index) => {
        const card = document.getElementById(cap.id);
        if(!card) return;

        const status = card.querySelector(".status");

        if(agora >= cap.libera){
            card.classList.remove("bloqueado");
            card.classList.add("liberado");
            card.style.pointerEvents = "auto";
            status.innerHTML = "✅ Disponível";

            // Vincula dinamicamente a chamada ajax ao clicar no card liberado
            card.onclick = () => carregarPaginaCapitulo(cap.arquivo);
        } 
        else if(proximo && proximo.id === cap.id){
            card.classList.remove("liberado");
            card.classList.add("bloqueado");
            card.style.pointerEvents = "none";
            card.onclick = null;

            const diff = cap.libera - agora;
            const horas = Math.floor(diff / 1000 / 60 / 60);
            const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const segundos = Math.floor((diff % (1000 * 60)) / 1000);

            status.innerHTML = `
                ⏳ Próximo capítulo em
                <span class="tempo">
                    ${String(horas).padStart(2,"0")}h
                    ${String(minutos).padStart(2,"0")}m
                    ${String(segundos).padStart(2,"0")}s
                </span>
            `;
        } 
        else {
            card.classList.remove("liberado");
            card.classList.add("bloqueado");
            card.style.pointerEvents = "none";
            card.onclick = null;
            status.innerHTML = "🔒 Em breve";
        }
    });
}

setInterval(atualizarCapitulos, 1000);
atualizarCapitulos();

//==============================
// ANIMAÇÃO NOS CARDS
//==============================
const cards = document.querySelectorAll(".card");
cards.forEach(card => {
    card.addEventListener("mouseenter", () => {
        card.style.transform = "translateY(-6px)";
    });
    card.addEventListener("mouseleave", () => {
        card.style.transform = "translateY(0px)";
    });
});

//==============================
// EFEITO DIGITAÇÃO (opcional)
//==============================
const textos = document.querySelectorAll(".typewriter");
textos.forEach(el => {
    const texto = el.innerHTML;
    el.innerHTML = "";
    let i = 0;
    function escrever() {
        if(i < texto.length) {
            el.innerHTML += texto.charAt(i);
            i++;
            setTimeout(escrever, 35);
        }
    }
    escrever();
});
