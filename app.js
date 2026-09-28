"use strict";

const CFM_PDF = "https://sistemas.cfm.org.br/normas/arquivos/resolucoes/BR/2026/2454_2026.pdf";
const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
const appState = {
  role:null, index:0, time:420, phase:"home", openClues:new Set(), seenClues:new Set(),
  markedRows:new Set(), picks:[], answerOrder:[], overlay:true, decisions:[]
};

const chapters = {
  doctor:[
    {
      id:"note", scene:"note", time:420, kicker:"CAPÍTULO 01 · CONSULTÓRIO",
      title:"O rascunho parece pronto", intro:"O Copiloto transformou anotações em um resumo. Você está entre consultas e o prontuário precisa ser fechado.",
      sceneCaption:"A rapidez ajuda. O conteúdo ainda precisa ser conferido.",
      evidenceTitle:"Compare antes de assinar",
      clues:[
        {id:"original", icon:"≡", title:"Anotação original", summary:"Abrir o registro de origem", detail:"Anotação fictícia: queixa no tornozelo direito há três dias. Alergia a dipirona informada. O resumo precisa preservar esses fatos."},
        {id:"scope", icon:"◎", title:"Papel do Copiloto", summary:"O que ele fez?", detail:"A ferramenta produziu um rascunho. Ela não confirmou os fatos com o paciente nem assumiu a responsabilidade pelo prontuário."},
        {id:"record", icon:"⌁", title:"Registro do uso", summary:"O que precisa ficar claro?", detail:"Quando a IA apoia uma decisão médica, o uso precisa ser registrado no prontuário. O registro deve corresponder ao que de fato foi feito."}
      ],
      question:"O que você faz com esse resumo?", help:"Toque nas linhas suspeitas da cena e consulte as pistas antes de decidir.",
      choices:[
        {id:"revise", label:"Confiro e corrijo antes de registrar", minutes:9, quality:"strong", title:"O rascunho virou apoio, não piloto automático", text:"Você preservou o ganho de tempo e manteve controle sobre a versão final. Compare sempre o texto gerado com a fonte e com o caso."},
        {id:"sign", label:"Registro o texto como chegou", minutes:2, quality:"weak", title:"A aparência de pronto escondeu uma lacuna", text:"Um resumo plausível pode trocar ou omitir informações. Assinar sem conferir não demonstra uso crítico da ferramenta."},
        {id:"manual", label:"Deixo a IA de lado e registro manualmente", minutes:13, quality:"partial", title:"Você preservou o controle da informação", text:"Recusar a ferramenta é uma opção. Vale investigar por que ela não parece confiável e comunicar o problema à instituição."}
      ],
      sourceLabel:"Supervisão, análise crítica e registro do apoio à decisão",
      audit:"O prontuário exige revisão humana de qualquer rascunho gerado."
    },
    {
      id:"image", scene:"image", time:600, kicker:"CAPÍTULO 02 · IMAGEM",
      title:"Um sinal na radiografia", intro:"O Copiloto marca uma região de uma imagem ilustrativa. O alerta chama atenção, mas não conhece sozinho todo o contexto.",
      sceneCaption:"Esta imagem é ilustrativa. A missão avalia o processo de decisão, não um diagnóstico.",
      evidenceTitle:"O que sustenta o alerta?",
      clues:[
        {id:"original", icon:"◌", title:"Imagem original", summary:"Ver sem a marcação", detail:"Compare a imagem sem o destaque para perceber o quanto a marcação influencia sua atenção. A ilustração não permite concluir um diagnóstico."},
        {id:"context", icon:"✳", title:"Contexto da pessoa", summary:"História e avaliação clínica", detail:"Um alerta visual precisa ser confrontado com história, exame, hipótese clínica e qualidade da imagem."},
        {id:"tool", icon:"▥", title:"Limites da ferramenta", summary:"Finalidade e validação", detail:"Antes de confiar, confira finalidade pretendida, população de validação e desempenho em situações semelhantes. A marcação não informa isso."}
      ],
      question:"Qual é seu próximo passo?", help:"Você pode desligar a marcação e abrir as pistas na ordem que preferir.",
      choices:[
        {id:"review", label:"Confronto imagem, contexto e limites da IA", minutes:12, quality:"strong", title:"O alerta entrou no raciocínio, sem comandá-lo", text:"Você tratou a marcação como informação adicional. Se persistir dúvida, buscar outra avaliação ou não usar a sugestão são caminhos legítimos."},
        {id:"follow", label:"Sigo o alerta sem conferir o contexto", minutes:3, quality:"weak", title:"O sinal ganhou peso demais", text:"Uma marcação não substitui avaliação clínica. A decisão médica precisa considerar o conjunto de evidências."},
        {id:"ignore", label:"Ignoro o alerta sem examiná-lo", minutes:3, quality:"partial", title:"A autonomia continua, mas faltou examinar o sinal", text:"Você pode rejeitar a recomendação da IA. É mais sólido fazê-lo depois de avaliá-la criticamente e registrar o fundamento da conduta."}
      ],
      sourceLabel:"Autonomia e julgamento médico sobre recomendações de IA",
      audit:"O destaque da IA é informação, não diagnóstico."
    },
    {
      id:"patient", scene:"patient", time:840, kicker:"CAPÍTULO 03 · CONVERSA",
      title:"O paciente pergunta", intro:"A pessoa viu uma resposta de IA e quer saber se o alerta do sistema significa que há um problema grave.",
      sceneCaption:"A tecnologia entrou na conversa. A relação de cuidado continua humana.",
      evidenceTitle:"Antes de responder",
      clues:[
        {id:"question", icon:"?", title:"A pergunta real", summary:"O que preocupa a pessoa?", detail:"Ela quer entender a própria situação e saber quanto confiar na resposta automática. Primeiro, acolha a dúvida."},
        {id:"transparency", icon:"◉", title:"Transparência", summary:"Explique o papel da IA", detail:"Quando a IA participa do cuidado, informe sua função em linguagem clara. A tecnologia apoia; a decisão e a comunicação clínica permanecem humanas."},
        {id:"privacy", icon:"◇", title:"Dados compartilhados", summary:"O que foi enviado à ferramenta?", detail:"É útil descobrir quais informações a pessoa forneceu à ferramenta e orientar com cuidado sobre privacidade, sem repreensão."}
      ],
      question:"Como você responde?", help:"Escolha uma abordagem de conversa, sem transformar a saída da IA em diagnóstico.",
      choices:[
        {id:"dialogue", label:"Acolho, explico a IA e avalio o caso", minutes:11, quality:"strong", title:"A IA virou ponto de partida para diálogo", text:"Você explicou o papel da ferramenta, preservou a relação com o paciente e recolocou contexto, evidência e julgamento no centro."},
        {id:"delegate", label:"Deixo o sistema enviar a conclusão", minutes:2, quality:"weak", title:"A comunicação clínica foi delegada", text:"Diagnóstico, prognóstico e decisão terapêutica não devem ser comunicados pela IA sem mediação humana."},
        {id:"dismiss", label:"Peço que ignore tudo que a IA disse", minutes:4, quality:"partial", title:"A preocupação do paciente ficou sem resposta", text:"A saída da IA pode estar errada, mas a pessoa precisa ser ouvida. Explique os limites da ferramenta e avalie a situação clínica."}
      ],
      sourceLabel:"Informação ao paciente e mediação humana na comunicação",
      audit:"Transparência e escuta também fazem parte do uso responsável."
    },
    {
      id:"incident", scene:"incident", time:1050, kicker:"CAPÍTULO 04 · RETORNO",
      title:"O mesmo alerta reaparece", intro:"A equipe relata alertas inconsistentes da ferramenta em outros atendimentos. Ainda não se conhece a causa.",
      sceneCaption:"Uma falha potencial é assunto da equipe, da instituição e do cuidado.",
      evidenceTitle:"O que já se sabe?",
      clues:[
        {id:"pattern", icon:"◴", title:"Padrão observado", summary:"Casos e contexto", detail:"Três relatos semelhantes apareceram em poucos dias. É preciso verificar se existe padrão, impacto e relação com a ferramenta."},
        {id:"governance", icon:"⚑", title:"Canal institucional", summary:"Quem acompanha?", detail:"A instituição precisa ter responsáveis por avaliar risco, qualidade e incidentes ligados ao uso de IA."},
        {id:"care", icon:"✚", title:"Cuidado imediato", summary:"Prioridade clínica", detail:"Enquanto a causa é investigada, mantenha supervisão humana e proteja as pessoas potencialmente afetadas."}
      ],
      question:"Como você age agora?", help:"Pense no atendimento atual e no que a equipe precisa saber.",
      choices:[
        {id:"escalate", label:"Revejo os casos e aciono a governança", minutes:15, quality:"strong", title:"A dúvida virou ação responsável", text:"Você combina proteção no atendimento com avaliação institucional da ferramenta. O acompanhamento não termina na compra ou implantação."},
        {id:"continue", label:"Continuo usando como antes", minutes:2, quality:"weak", title:"O sinal de problema ficou sem resposta", text:"Relatos de falha pedem investigação, comunicação e revisão dos controles, especialmente quando podem afetar decisões clínicas."},
        {id:"stop-alone", label:"Paro de usar sem informar a equipe", minutes:5, quality:"partial", title:"Você se protegeu, mas a equipe ficou sem o alerta", text:"Interromper o próprio uso pode ser prudente. Compartilhar o problema com o canal responsável permite investigar e proteger outros atendimentos."}
      ],
      sourceLabel:"Monitoramento institucional e supervisão humana",
      audit:"Incidentes exigem resposta além da decisão individual."
    }
  ],
  manager:[
    {
      id:"vendor", scene:"vendor", time:420, kicker:"CAPÍTULO 01 · PROPOSTA",
      title:"O número que impressiona", intro:"Dois fornecedores oferecem apoio com IA. Um exibe 94% em material de vendas; o outro traz validação independente e plano de acompanhamento.",
      sceneCaption:"Dados fictícios para o jogo. Um número isolado não conta toda a história.",
      evidenceTitle:"Abra os dossiês",
      clues:[
        {id:"a", icon:"A", title:"Solução A", summary:"94% no material comercial", detail:"O fornecedor não mostra validação independente, desempenho por subgrupo nem teste com população semelhante à atendida pela cooperativa."},
        {id:"b", icon:"B", title:"Solução B", summary:"89% em estudo apresentado", detail:"Há validação independente, descrição da população testada, resultados separados e proposta de monitoramento após implantação."},
        {id:"purpose", icon:"◎", title:"Finalidade real", summary:"Qual problema resolver?", detail:"Antes de comparar produtos, a cooperativa precisa definir tarefa, público, risco, supervisão e como medirá benefício e dano."}
      ],
      question:"Como avançar com a contratação?", help:"Compare a qualidade da evidência e o uso pretendido.",
      choices:[
        {id:"pilot", label:"Defino critérios e testo em escala pequena", minutes:15, quality:"strong", title:"A proposta virou hipótese testável", text:"Você não escolheu pelo maior número. O próximo passo é validar adequação local, riscos e acompanhamento antes de ampliar."},
        {id:"buy-a", label:"Contrato a maior taxa anunciada", minutes:4, quality:"weak", title:"O percentual dominou a decisão", text:"Uma média divulgada sem contexto pode esconder limitações importantes. Exija evidência, finalidade clara e plano de monitoramento."},
        {id:"reject", label:"Descarto qualquer uso de IA", minutes:4, quality:"partial", title:"A cooperativa evitou riscos, mas não investigou valor", text:"Recusar uma ferramenta sem base adequada é legítimo. Uma avaliação estruturada ajuda a separar promessa frágil de possibilidade útil."}
      ],
      sourceLabel:"Avaliação preliminar de risco, validação e governança",
      audit:"Compra responsável começa por finalidade, evidência e acompanhamento."
    },
    {
      id:"risk", scene:"risk", time:660, kicker:"CAPÍTULO 02 · RISCO",
      title:"Duas automações, impactos diferentes", intro:"A equipe propõe um resumo administrativo e o envio automático de uma conclusão diagnóstica ao paciente.",
      sceneCaption:"O grau de autonomia e o impacto sobre pessoas mudam a decisão.",
      evidenceTitle:"Critérios para comparar",
      clues:[
        {id:"purpose", icon:"▤", title:"Finalidade", summary:"O que cada sistema faz?", detail:"Um resumo administrativo revisado por pessoas tem finalidade diferente de uma comunicação clínica automática."},
        {id:"autonomy", icon:"◐", title:"Supervisão", summary:"Quem confere antes da ação?", detail:"Quanto mais o sistema age sozinho, maior o cuidado exigido. A comunicação de diagnóstico precisa de mediação humana."},
        {id:"data", icon:"◇", title:"Dados e impacto", summary:"O que pode acontecer?", detail:"Considere sensibilidade das informações, alcance do sistema, contexto de uso e possível efeito sobre o cuidado e direitos do paciente."}
      ],
      question:"Qual encaminhamento faz sentido?", help:"O objetivo é identificar o que pode ser estudado e o que precisa ser redesenhado.",
      choices:[
        {id:"separate", label:"Avalio o resumo e bloqueio o envio automático", minutes:14, quality:"strong", title:"Você separou apoio de delegação", text:"O resumo pode ser avaliado com controles; a comunicação de conclusão clínica não deve sair sem mediação médica."},
        {id:"launch", label:"Libero os dois fluxos no piloto", minutes:3, quality:"weak", title:"O piloto manteve uma delegação indevida", text:"A supervisão não é detalhe posterior. Um envio automático de conclusão diagnóstica precisa ser redesenhado antes de qualquer teste com pacientes."},
        {id:"stop-all", label:"Suspendo ambos sem avaliação", minutes:5, quality:"partial", title:"Você conteve risco, mas misturou usos distintos", text:"A diferença de finalidade e autonomia importa. Avaliar cada uso separadamente ajuda a desenhar controles proporcionais."}
      ],
      sourceLabel:"Avaliação de risco e comunicação clínica com mediação humana",
      audit:"Nem toda aplicação de IA tem a mesma finalidade ou risco."
    },
    {
      id:"roadmap", scene:"roadmap", time:840, kicker:"CAPÍTULO 03 · COOPERATIVA",
      title:"Três prioridades, uma primeira etapa", intro:"A diretoria dispõe de recursos para iniciar três frentes. Você precisa escolher por onde a cooperativa aprende com segurança.",
      sceneCaption:"Uma boa estratégia conecta pessoas, regras, dados e testes.",
      evidenceTitle:"O que considerar",
      clues:[
        {id:"people", icon:"♙", title:"Equipe", summary:"Capacitação e autonomia", detail:"Médicos e equipes precisam entender finalidade, limites, riscos e como reportar problemas."},
        {id:"rules", icon:"▣", title:"Governança", summary:"Responsáveis e revisão", detail:"Critérios de adoção, supervisão, avaliação de risco e acompanhamento não podem ficar implícitos."},
        {id:"pilot", icon:"◌", title:"Aprendizagem", summary:"Começar e medir", detail:"Um piloto delimitado permite observar resultados e corrigir problemas antes de ampliar o uso."}
      ],
      question:"Em que você investe primeiro?", help:"Selecione exatamente três frentes. Há mais de uma combinação defensável.",
      picks:[
        {id:"training", label:"Capacitar cooperados", icon:"✳"},
        {id:"governance", label:"Definir governança", icon:"▣"},
        {id:"pilot", label:"Testar em pequena escala", icon:"◌"},
        {id:"data", label:"Organizar dados", icon:"▦"},
        {id:"marketing", label:"Anunciar a inovação", icon:"↗"}
      ],
      sourceLabel:"Governança, capacitação e monitoramento institucional",
      audit:"A capacidade da cooperativa importa tanto quanto a ferramenta."
    },
    {
      id:"incident", scene:"incident", time:1050, kicker:"CAPÍTULO 04 · OPERAÇÃO",
      title:"O piloto mostra um padrão inesperado", intro:"A equipe relata recomendações inconsistentes em parte dos atendimentos. A causa ainda está sendo analisada.",
      sceneCaption:"Monitorar significa poder ajustar, pausar e explicar.",
      evidenceTitle:"O que chega à gestão?",
      clues:[
        {id:"signal", icon:"◴", title:"Relatos da equipe", summary:"Vários casos semelhantes", detail:"Os relatos indicam possível padrão. Eles precisam ser documentados, analisados e ligados à versão da ferramenta e ao contexto de uso."},
        {id:"control", icon:"⚑", title:"Controles atuais", summary:"O que pode ser interrompido?", detail:"Identifique quem pode pausar o sistema, como proteger atendimentos em curso e como comunicar a equipe."},
        {id:"measure", icon:"▤", title:"Impacto", summary:"Quem pode ter sido afetado?", detail:"A análise deve priorizar segurança das pessoas, revisão de casos e atualização da avaliação de risco."}
      ],
      question:"Qual resposta você coordena?", help:"Escolha o primeiro movimento institucional.",
      choices:[
        {id:"respond", label:"Protejo atendimentos e investigo o padrão", minutes:15, quality:"strong", title:"A governança entrou em ação", text:"Você trata o sinal como questão de segurança, comunica a equipe e usa o monitoramento para decidir se pausa ou ajusta o uso."},
        {id:"hide", label:"Espero a próxima reunião mensal", minutes:2, quality:"weak", title:"A resposta ficou lenta para o risco", text:"Relatos de inconsistência precisam de triagem e acompanhamento oportunos, especialmente quando podem afetar decisões clínicas."},
        {id:"pause", label:"Pauso tudo sem investigar", minutes:6, quality:"partial", title:"A pausa protege, mas faltou aprender", text:"Pausar pode ser prudente. Documentar, revisar os casos e investigar a causa ajuda a decidir o próximo passo com responsabilidade."}
      ],
      sourceLabel:"Governança, auditoria e monitoramento contínuo",
      audit:"Um sistema em uso continua exigindo avaliação."
    }
  ]
};
function clean(value) {
  return String(value).replace(/[&<>"']/g, function(char) {
    return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char];
  });
}
function announce(message) {
  $("#announcer").textContent = "";
  window.setTimeout(function() { $("#announcer").textContent = message; }, 20);
}
function focusTitle(selector) {
  var target = $(selector);
  target.setAttribute("tabindex", "-1");
  target.focus({preventScroll:true});
}
function showView(name) {
  if (name !== "game" && $("#evidenceDialog").open) closeEvidence();
  $("#homeView").hidden = name !== "home";
  $("#gameView").hidden = name !== "game";
  $("#resultView").hidden = name !== "result";
  appState.phase = name;
  document.body.classList.toggle("game-active", name === "game");
  window.scrollTo({top:0,behavior:"instant"});
  if (name === "home") focusTitle("#homeTitle");
  if (name === "game") focusTitle("#chapterTitle");
  if (name === "result") focusTitle("#resultTitle");
}
function currentChapter() {
  return chapters[appState.role][appState.index];
}
function updateHUD() {
  $("#roleLabel").textContent = appState.role === "doctor" ? "VISÃO MÉDICA" : "VISÃO DA GESTÃO";
  $("#chapterCount").textContent = "CAPÍTULO " + String(appState.index + 1).padStart(2, "0") + "/04";
  $("#progressFill").style.width = ((appState.index + 1) / 4 * 100) + "%";
  $("#progressLabel").textContent = "Progresso: capítulo " + (appState.index + 1) + " de 4";
  var hours = Math.floor(appState.time / 60) % 24;
  var minutes = appState.time % 60;
  $("#gameClock").textContent = String(hours).padStart(2,"0") + ":" + String(minutes).padStart(2,"0");
}
function spend(minutes) {
  appState.time += minutes;
  updateHUD();
}
function startRole(role) {
  appState.role = role;
  appState.index = 0;
  appState.time = 420;
  appState.decisions = [];
  startChapter();
}
function shuffledOptions(options) {
  var order = options.slice();
  for (var i = order.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var item = order[i];
    order[i] = order[j];
    order[j] = item;
  }
  return order;
}
function primaryBrief(chapter) {
  var doctor = {
    note:"A IA gerou um rascunho para o prontuário. Você precisa fechá-lo.",
    image:"A IA destacou uma área da imagem. A avaliação ainda depende do contexto.",
    patient:"A pessoa trouxe uma resposta de IA e quer saber se ela está certa.",
    incident:"Relatos semelhantes indicam uma possível falha na ferramenta em uso."
  };
  var manager = {
    vendor:"Duas soluções prometem desempenho. A cooperativa precisa decidir como avaliá-las.",
    risk:"Um fluxo resume texto; outro enviaria uma conclusão clínica automaticamente.",
    roadmap:"A cooperativa tem recursos para iniciar três frentes de implantação.",
    incident:"A equipe relata recomendações inconsistentes durante o piloto."
  };
  return (appState.role === "doctor" ? doctor : manager)[chapter.id] || chapter.intro;
}
function startChapter() {
  var chapter = currentChapter();
  if ($("#evidenceDialog").open) $("#evidenceDialog").close();
  document.body.classList.remove("evidence-open");
  setEvidenceTab("clues");
  appState.openClues = new Set();
  appState.seenClues = new Set();
  appState.markedRows = new Set();
  appState.picks = [];
  appState.answerOrder = shuffledOptions(chapter.picks || chapter.choices);
  appState.overlay = true;
  appState.time = Math.max(appState.time, chapter.time);
  $("#gameView").style.setProperty("--chapter-scene", 'url("assets/scenes/' + chapter.scene + '.webp?v=scene-3")');
  $("#chapterKicker").textContent = chapter.kicker;
  $("#chapterTitle").textContent = chapter.title;
  $("#chapterIntro").textContent = primaryBrief(chapter);
  $("#evidenceDialogIntro").textContent = chapter.intro;
  $("#evidenceTitle").textContent = chapter.evidenceTitle;
  $("#decisionTitle").textContent = chapter.question;
  $("#decisionHelp").textContent = chapter.picks ? chapter.help : "";
  $("#decisionPanel").hidden = false;
  $("#feedbackPanel").hidden = true;
  $("#nextChapter").innerHTML = appState.index === 3 ? "Ver minha auditoria <span aria-hidden=\"true\">→</span>" : "Próximo capítulo <span aria-hidden=\"true\">→</span>";
  renderScene(chapter);
  renderEvidence(chapter);
  renderDecision(chapter);
  updateHUD();
  showView("game");
  announce("Capítulo " + (appState.index + 1) + ". " + chapter.title);
}
function sceneContent(chapter) {
  var descriptions = {
    note:"Médica confere um rascunho e uma anotação no consultório.",
    image:"Médica examina uma imagem ilustrativa em uma estação de trabalho.",
    patient:"Médica conversa diretamente com uma paciente no consultório.",
    vendor:"Duas propostas fictícias estão sobre uma mesa de reunião.",
    risk:"Gestor examina dois fluxos de uso de IA em monitores.",
    roadmap:"Gestor e equipe discutem uma implantação em etapas.",
    incident:"Médica e gestor analisam relatos durante o piloto."
  };
  var html = '<div class="scene-visual"><img class="scene-art" src="assets/scenes/' +
    clean(chapter.scene) + '.webp?v=scene-3" alt="' + clean(descriptions[chapter.scene]) +
    '" decoding="async">' +
    '<span class="scene-badge"><span aria-hidden="true">●</span> CENA FICTÍCIA</span>';
  if (chapter.scene === "image") {
    html += '<div class="image-commentary">DESTAQUE SUGERIDO PELA IA<small>SIMULAÇÃO · SEM VALOR DIAGNÓSTICO</small></div>' +
      '<button class="xray-toggle" type="button" data-action="overlay" aria-pressed="true">Ocultar comentário da IA</button>';
  }
  if (chapter.scene === "patient") {
    html += '<div class="scene-quote">“O aplicativo já sabe o que eu tenho?”</div>';
  }
  html += '</div>';
  if (chapter.scene === "note") {
    html += '<div class="note-paper" aria-label="Rascunho de prontuário gerado por IA">' +
      '<button type="button" class="note-row" data-action="mark-row" data-row="0" aria-pressed="' + appState.markedRows.has(0) + '"><b>01</b><span>Paciente relata dor no tornozelo esquerdo há três dias.</span></button>' +
      '<button type="button" class="note-row" data-action="mark-row" data-row="1" aria-pressed="' + appState.markedRows.has(1) + '"><b>02</b><span>Sem alergias registradas.</span></button>' +
      '<button type="button" class="note-row" data-action="mark-row" data-row="2" aria-pressed="' + appState.markedRows.has(2) + '"><b>03</b><span>Resumo criado automaticamente.</span></button>' +
      '<button type="button" class="note-row" data-action="mark-row" data-row="3" aria-pressed="' + appState.markedRows.has(3) + '"><b>04</b><span>Orientação sugerida: revisar e assinar.</span></button>' +
      '<small>Toque nas linhas que merecem conferência.</small></div>';
  }
  html += '<div class="scene-copy"><h2 class="scene-title">' + clean(chapter.title) +
    '</h2><p class="scene-caption">' + clean(chapter.sceneCaption) + '</p></div>';
  return html;
}
function renderScene(chapter) {
  $("#scenePanel").className = "scene-panel " + chapter.scene + "-scene";
  $("#scenePanel").innerHTML = '<div class="scene-inner">' + sceneContent(chapter) + '</div>';
  $$(".note-row").forEach(function(row) {
    row.classList.toggle("suspect", appState.markedRows.has(Number(row.dataset.row)));
  });
}
function renderEvidence(chapter) {
  var html = chapter.clues.map(function(clue) {
    var open = appState.openClues.has(clue.id);
    return '<button type="button" class="evidence-item' + (open ? ' open' : '') + '" data-action="clue" data-id="' + clean(clue.id) + '" aria-expanded="' + open + '"><span class="e-icon" aria-hidden="true">' + clean(clue.icon) + '</span><span><strong>' + clean(clue.title) + '</strong><small>' + clean(clue.summary) + '</small></span></button>' +
      (open ? '<div class="evidence-detail">' + clean(clue.detail) + '</div>' : '');
  }).join("");
  $("#evidenceTriggerCount").textContent = appState.seenClues.size + " de " + chapter.clues.length + " pistas vistas";
  $("#evidenceContent").innerHTML = html + '<p class="evidence-hint">' + appState.seenClues.size + ' de ' + chapter.clues.length + ' pistas consultadas · consulte ao menos 2 para sustentar a decisão. Cada nova pista avança 3 minutos fictícios.</p>';
}
function renderDecision(chapter) {
  $("#decisionChoices").classList.toggle("roadmap-choices",Boolean(chapter.picks));
  if (chapter.picks) {
    var picks = appState.answerOrder.map(function(pick) {
      var selected = appState.picks.includes(pick.id);
      return '<button type="button" class="pick-button' + (selected ? ' selected' : '') + '" data-action="pick" data-id="' + clean(pick.id) + '" aria-pressed="' + selected + '"><span>' + clean(pick.icon) + ' &nbsp; ' + clean(pick.label) + '</span><span class="tick" aria-hidden="true">' + (selected ? "✓" : "+") + '</span></button>';
    }).join("");
    $("#decisionChoices").innerHTML = '<div class="pick-grid">' + picks + '</div><p class="pick-status" role="status">' + appState.picks.length + ' de 3 frentes selecionadas</p><button class="primary-button pick-confirm" type="button" data-action="confirm-picks"' + (appState.picks.length === 3 ? "" : " disabled") + '>Confirmar prioridades <span aria-hidden="true">→</span></button>';
  } else {
    $("#decisionChoices").innerHTML = appState.answerOrder.map(function(choice, index) {
      return '<button type="button" class="choice-button" data-action="choice" data-id="' + clean(choice.id) + '"><span class="choice-number">OPÇÃO 0' + (index + 1) + '</span><span>' + clean(choice.label) + '</span></button>';
    }).join("");
  }
}
function revealFeedback(chapter, result) {
  $("#decisionPanel").hidden = true;
  $("#feedbackPanel").hidden = false;
  $("#feedbackTitle").textContent = result.title;
  $("#feedbackText").textContent = result.text;
  $("#feedbackDetails").innerHTML = '<span>' + appState.seenClues.size + ' de ' + chapter.clues.length + ' pistas consultadas</span><span>' + clean(chapter.sourceLabel) + '</span>';
  $("#feedbackSource").href = CFM_PDF;
  $("#feedbackPanel").scrollIntoView({behavior:document.documentElement.classList.contains("reduce-motion") ? "instant" : "smooth",block:"start"});
  window.setTimeout(function() { focusTitle("#feedbackTitle"); }, 150);
  announce(result.title);
}
function choose(id) {
  if (appState.phase !== "game" || $("#decisionPanel").hidden) return;
  var chapter = currentChapter();
  var choice = chapter.choices.find(function(item) { return item.id === id; });
  if (!choice) return;
  var quality = choice.quality;
  var title = choice.title;
  var explanation = choice.text;
  var investigation = appState.seenClues.size;
  if (quality === "strong" && investigation < 2) {
    quality = "partial";
    explanation += " Você chegou a uma ação defensável, mas deixou pistas importantes sem consultar.";
  }
  if (chapter.id === "note" && choice.id === "revise" && (!appState.markedRows.has(0) || !appState.markedRows.has(1))) {
    quality = "partial";
    explanation += " No rascunho, o lado do tornozelo e a alergia mereciam sua atenção.";
  }
  appState.decisions.push({
    chapter:chapter.title,
    choice:choice.label,
    quality:quality,
    evidence:investigation,
    total:chapter.clues.length,
    note:chapter.audit,
    outcome:title,
    feedback:explanation
  });
  spend(choice.minutes);
  revealFeedback(chapter,{title:title,text:explanation});
}
function togglePick(id) {
  if (appState.phase !== "game" || $("#decisionPanel").hidden) return;
  var chapter = currentChapter();
  if (!chapter.picks || !chapter.picks.some(function(item) { return item.id === id; })) return;
  var index = appState.picks.indexOf(id);
  if (index >= 0) appState.picks.splice(index,1);
  else if (appState.picks.length < 3) appState.picks.push(id);
  renderDecision(chapter);
  var selected = $('#decisionChoices [data-id="' + id + '"]');
  if (selected) selected.focus({preventScroll:true});
}
function confirmPicks() {
  if (appState.phase !== "game" || $("#decisionPanel").hidden || appState.picks.length !== 3) return;
  var chapter = currentChapter();
  var selections = appState.picks;
  var hasGovernance = selections.includes("governance");
  var hasPilot = selections.includes("pilot");
  var hasPeopleOrData = selections.includes("training") || selections.includes("data");
  var quality = hasGovernance && hasPilot && hasPeopleOrData ? "strong" : (hasGovernance || hasPilot ? "partial" : "weak");
  if (quality === "strong" && appState.seenClues.size < 2) quality = "partial";
  var title = quality === "strong" ? "Você construiu uma base para aprender com segurança" : quality === "partial" ? "A direção existe, mas há uma lacuna" : "A estreia veio antes da preparação";
  var explanation = quality === "strong" ? "Governança e teste delimitado criam um ciclo de aprendizagem. Capacitação ou dados organizados sustentam esse ciclo." :
    quality === "partial" ? "Revise quem decide, como o uso será testado e como os resultados serão monitorados. Sem essas peças, a expansão fica frágil." :
    "Anunciar uma ferramenta antes de definir controles e testar o uso pode criar expectativas que a cooperativa ainda não consegue sustentar.";
  var labels = selections.map(function(id) { return chapter.picks.find(function(pick) { return pick.id === id; }).label; });
  appState.decisions.push({
    chapter:chapter.title,
    choice:labels.join(" · "),
    quality:quality,
    evidence:appState.seenClues.size,
    total:chapter.clues.length,
    note:chapter.audit,
    outcome:title,
    feedback:explanation
  });
  spend(12);
  revealFeedback(chapter,{title:title,text:explanation});
}
function nextChapter() {
  if ($("#feedbackPanel").hidden) return;
  if (appState.index === 3) {
    renderResult();
  } else {
    appState.index += 1;
    startChapter();
  }
}
function qualityLabel(quality) {
  return quality === "strong" ? "Escolha sustentada" : quality === "partial" ? "Ponto de atenção" : "Decisão a rever";
}
function exportResultText() {
  if (appState.phase !== "result" || appState.decisions.length !== 4) return;
  var role = appState.role === "doctor" ? "Percurso médico" : "Percurso da gestão";
  var lines = [
    "COOMTOCE IA QUEST V3",
    "Auditoria pessoal de decisões",
    role + " · " + new Date().toLocaleDateString("pt-BR"),
    "",
    $("#resultLead").textContent,
    ""
  ];
  appState.decisions.forEach(function(item,index) {
    lines.push(
      String(index + 1).padStart(2,"0") + " · " + item.chapter,
      "Escolha: " + item.choice,
      "Leitura do jogo: " + qualityLabel(item.quality),
      "Pistas consultadas: " + item.evidence + " de " + item.total,
      "Consequência: " + item.outcome,
      item.feedback,
      "Para refletir: " + item.note,
      ""
    );
  });
  lines.push("TRÊS PRÓXIMOS PASSOS");
  $$("#takeawayList li").forEach(function(item,index) {
    lines.push((index + 1) + ". " + item.textContent.trim());
  });
  lines.push("", "Este relatório descreve apenas escolhas feitas no jogo. Não é avaliação clínica, certificação ou parecer jurídico.");
  lines.push("Resolução CFM nº 2.454/2026: " + CFM_PDF);
  var blob = new Blob(["\uFEFF" + lines.join("\r\n")], {type:"text/plain;charset=utf-8"});
  var url = URL.createObjectURL(blob);
  var link = document.createElement("a");
  link.href = url;
  link.download = "ia-quest-resultado-" + (appState.role === "doctor" ? "medico" : "gestao") + "-" + new Date().toISOString().slice(0,10) + ".txt";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(function() { URL.revokeObjectURL(url); }, 1000);
  announce("Resumo do resultado baixado.");
}
function renderResult() {
  var attention = appState.decisions.filter(function(item) { return item.quality !== "strong"; });
  $("#resultLead").textContent = attention.length === 0 ?
    "Você investigou cada situação e fez escolhas sustentadas. A auditoria reúne o raciocínio exercitado e os pontos que merecem atenção no mundo real." :
    "Sua jornada expôs escolhas difíceis e pontos que pedem revisão. Use a auditoria para voltar às evidências e discutir decisões possíveis com sua equipe.";
  $("#resultMeta").textContent = (appState.role === "doctor" ? "Percurso médico" : "Percurso da gestão") + " · " + new Date().toLocaleDateString("pt-BR");
  $("#auditList").innerHTML = appState.decisions.map(function(item,index) {
    return '<article class="audit-item"><span class="audit-node" aria-hidden="true">' + String(index+1).padStart(2,"0") + '</span><div><h3>' + clean(item.chapter) + '</h3><p class="audit-choice">' + clean(item.choice) + '</p><span class="audit-quality ' + clean(item.quality) + '">' + qualityLabel(item.quality) + '</span><p>' + item.evidence + ' de ' + item.total + ' pistas consultadas</p><p class="audit-feedback">' + clean(item.feedback) + '</p><p class="audit-note">' + clean(item.note) + '</p></div></article>';
  }).join("");
  var points = appState.role === "doctor" ? [
    "Confronte saídas da IA com a fonte, o contexto e sua avaliação clínica.",
    "Explique ao paciente quando e como a IA foi utilizada no cuidado.",
    "Registre o apoio da IA à decisão e comunique padrões de falha à instituição."
  ] : [
    "Defina finalidade, responsáveis e critérios de risco antes da contratação.",
    "Valide com a população e o fluxo reais em um piloto delimitado.",
    "Prepare supervisão, registro de incidentes e revisão contínua do uso."
  ];
  $("#takeawayList").innerHTML = points.map(function(point) { return "<li>" + clean(point) + "</li>"; }).join("");
  showView("result");
  announce("Fim do percurso. Auditoria de decisões disponível.");
}
document.addEventListener("click", function(event) {
  var roleButton = event.target.closest("[data-role]");
  if (roleButton) { startRole(roleButton.dataset.role); return; }
  var actionButton = event.target.closest("[data-action]");
  if (!actionButton) return;
  var action = actionButton.dataset.action;
  if (action === "clue") {
    var clue = actionButton.dataset.id;
    if (!appState.seenClues.has(clue)) {
      appState.seenClues.add(clue);
      spend(3);
    }
    appState.openClues = appState.openClues.has(clue) ? new Set() : new Set([clue]);
    renderEvidence(currentChapter());
    var newButton = $('#evidenceContent [data-id="' + clue + '"]');
    if (newButton) newButton.focus({preventScroll:true});
    return;
  }
  if (action === "mark-row") {
    var row = Number(actionButton.dataset.row);
    if (appState.markedRows.has(row)) appState.markedRows.delete(row);
    else appState.markedRows.add(row);
    actionButton.classList.toggle("suspect",appState.markedRows.has(row));
    actionButton.setAttribute("aria-pressed",String(appState.markedRows.has(row)));
    return;
  }
  if (action === "overlay") {
    appState.overlay = !appState.overlay;
    $("#scenePanel").classList.toggle("overlay-off",!appState.overlay);
    actionButton.setAttribute("aria-pressed",String(appState.overlay));
    actionButton.textContent = appState.overlay ? "Ocultar comentário da IA" : "Mostrar comentário da IA";
    return;
  }
  if (action === "choice") { choose(actionButton.dataset.id); return; }
  if (action === "pick") { togglePick(actionButton.dataset.id); return; }
  if (action === "confirm-picks") { confirmPicks(); }
});
function setEvidenceTab(tab) {
  var dialog = $("#evidenceDialog");
  dialog.dataset.tab = tab;
  $("#evidenceTabClues").setAttribute("aria-selected", String(tab === "clues"));
  $("#evidenceTabScene").setAttribute("aria-selected", String(tab === "scene"));
}
function closeEvidence() {
  var dialog = $("#evidenceDialog");
  if (dialog.open) dialog.close();
  document.body.classList.remove("evidence-open");
  if (appState.phase === "game" && !$("#decisionPanel").hidden) $("#openEvidence").focus({preventScroll:true});
}
$("#openEvidence").addEventListener("click", function() {
  setEvidenceTab("clues");
  document.body.classList.add("evidence-open");
  $("#evidenceDialog").showModal();
  $("#evidenceTabClues").focus({preventScroll:true});
});
$("#closeEvidence").addEventListener("click", closeEvidence);
$("#returnToDecision").addEventListener("click", closeEvidence);
$("#evidenceDialog").addEventListener("close", function() {
  document.body.classList.remove("evidence-open");
  if (appState.phase === "game" && !$("#decisionPanel").hidden) $("#openEvidence").focus({preventScroll:true});
});
$("#evidenceDialog").addEventListener("click", function(event) {
  if (event.target === this) closeEvidence();
});
$("#evidenceTabClues").addEventListener("click", function() { setEvidenceTab("clues"); });
$("#evidenceTabScene").addEventListener("click", function() { setEvidenceTab("scene"); });
$("#exportPdf").addEventListener("click",function() { if (appState.phase === "result") window.print(); });
$("#exportText").addEventListener("click",exportResultText);
$("#nextChapter").addEventListener("click",nextChapter);
$("#leaveGame").addEventListener("click",function() { showView("home"); });
$("#playOther").addEventListener("click",function() { startRole(appState.role === "doctor" ? "manager" : "doctor"); });
$("#restart").addEventListener("click",function() { showView("home"); });
$("#brandHome").addEventListener("click",function(event) { event.preventDefault(); showView("home"); });
$("#motionButton").addEventListener("click",function() {
  var enabled = document.documentElement.classList.toggle("reduce-motion");
  this.setAttribute("aria-pressed",String(enabled));
  this.textContent = enabled ? "Ativar movimento" : "Reduzir movimento";
  try { localStorage.setItem("iaQuestReduceMotion",String(enabled)); } catch(error) {}
});
try {
  if (localStorage.getItem("iaQuestReduceMotion") === "true") {
    document.documentElement.classList.add("reduce-motion");
    $("#motionButton").setAttribute("aria-pressed","true");
    $("#motionButton").textContent = "Ativar movimento";
  }
} catch(error) {}
