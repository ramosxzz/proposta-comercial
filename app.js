/**
 * SolarProposals - Gerador de Propostas Solares Premium
 * Lógica Javascript principal atualizada para suportar slides tipo Canva e vídeos de fundo do telhado.
 */

// Estado global da Proposta Ativa
let proposalData = {
    clientName: 'vilmar',
    clientLocation: 'Santa Cruz do Sul - RS',
    currentBill: 350.00,
    monthlyConsumption: 380,
    minimumTax: 50.00,
    systemGeneration: 300,
    systemSize: 3.50,
    panelQty: 8,
    panelPower: 550,
    panelSpecs: 'Dah Solar 550W Monocristalino',
    inverterSpecs: 'Microinversor APsystems QT2D',
    investmentVal: 12500.00,
    paybackYears: 3.5,
    projectImageUrl: '',
    projectImageBase64: '',
    projectVideoUrl: '',
    projectVideoBase64: '',
    consultantName: 'Vilmar Solar',
    consultantPhone: '51999999999'
};

// Histórico de projetos salvos em localStorage
let savedProjects = {};

// Arquivos originais da sessão (necessários para exportar vídeo no HTML baixado)
let sessionVideoFile = null;
let sessionImageFile = null;

const EXPORT_MEDIA_SLOT_1 = '<!--SOLARPRO_MEDIA_SLOT_1-->';
const EXPORT_MEDIA_SLOT_2 = '<!--SOLARPRO_MEDIA_SLOT_2-->';

// Elementos DOM importantes
const DOM = {
    form: document.getElementById('proposal-form'),
    sidebar: document.getElementById('admin-sidebar'),
    container: document.getElementById('client-proposal-container'),
    floatingShowBtn: document.getElementById('btn-admin-floating-show'),
    previewToggleBtn: document.getElementById('btn-preview-toggle'),
    
    // Inputs do formulário
    inputClientName: document.getElementById('client_name'),
    inputClientLocation: document.getElementById('client_location'),
    inputCurrentBill: document.getElementById('current_bill'),
    inputMonthlyConsumption: document.getElementById('monthly_consumption'),
    inputMinimumTax: document.getElementById('minimum_tax'),
    inputSystemGeneration: document.getElementById('system_generation'),
    inputSystemSize: document.getElementById('system_size'),
    inputPanelQty: document.getElementById('panel_qty'),
    inputPanelPower: document.getElementById('panel_power'),
    inputPanelSpecs: document.getElementById('panel_specs'),
    inputInverterSpecs: document.getElementById('inverter_specs'),
    inputInvestmentVal: document.getElementById('investment_val'),
    inputPaybackYears: document.getElementById('payback_years'),
    
    inputVideoUrl: document.getElementById('project_video_url'),
    inputVideoFile: document.getElementById('project_video_file'),
    inputVideoStatus: document.getElementById('video-upload-status'),
    
    inputImageUrl: document.getElementById('project_image_url'),
    inputImageFile: document.getElementById('project_image_file'),
    inputImageStatus: document.getElementById('file-upload-status'),
    
    inputConsultantName: document.getElementById('consultant_name'),
    inputConsultantPhone: document.getElementById('consultant_phone'),
    
    // Elementos de Renderização (Cliente)
    renderClientName: document.getElementById('render-client-name'),
    renderHeroSubtitle: document.getElementById('render-hero-subtitle'),
    
    renderCurrentBill: document.getElementById('render-current-bill'),
    renderMonthlyConsumption: document.getElementById('render-monthly-consumption'),
    renderMinimumTax: document.getElementById('render-minimum-tax'),
    renderSystemGeneration: document.getElementById('render-system-generation'),
    renderMonthlySaving: document.getElementById('render-monthly-saving'),
    
    // Containers de Mídia (Slides)
    slide1MediaBg: document.getElementById('slide1-media-bg'),
    slide2MediaBg: document.getElementById('slide2-media-bg'),
    
    renderSystemSize: document.getElementById('render-system-size'),
    renderPanelQty: document.getElementById('render-panel-qty'),
    renderPanelPower: document.getElementById('render-panel-power'),
    renderPanelSpecs: document.getElementById('render-panel-specs'),
    renderInverterSpecs: document.getElementById('render-inverter-specs'),
    
    renderPaybackStat: document.getElementById('render-payback-stat'),
    renderInvestmentDisplay: document.getElementById('render-investment-display'),
    
    renderRoiBar1: document.getElementById('render-roi-bar-1'),
    renderRoiBar2: document.getElementById('render-roi-bar-2'),
    renderRoiBar3: document.getElementById('render-roi-bar-3'),
    renderRoiBar4: document.getElementById('render-roi-bar-4'),
    
    renderConsultantName: document.getElementById('render-consultant-name'),
    whatsappCtaButton: document.getElementById('whatsapp-cta-button'),
    
    // Projetos salvos
    selectSavedProjects: document.getElementById('saved-projects-select'),
    btnLoadProject: document.getElementById('btn-load-project'),
    btnDeleteProject: document.getElementById('btn-delete-project'),
    
    // Ações de exportação
    btnCopyLink: document.getElementById('btn-copy-link'),
    btnExportHtml: document.getElementById('btn-export-html')
};

/* ==========================================================================
   INICIALIZAÇÃO DA APLICAÇÃO
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Carregar banco de dados de projetos local
    loadProjectsFromLocalStorage();
    
    // 2. Verificar se há dados codificados na URL
    const urlParams = new URLSearchParams(window.location.search);
    const encodedData = urlParams.get('p');
    
    if (encodedData) {
        try {
            const decoded = decodeProposalData(encodedData);
            proposalData = decoded;
            // Oculta sidebar administrativo
            DOM.sidebar.classList.add('collapsed');
            DOM.container.style.marginLeft = '0';
            DOM.floatingShowBtn.classList.remove('hidden');
        } catch (e) {
            console.error('Falha ao decodificar dados da URL:', e);
        }
    }
    
    // 3. Preencher formulário administrativo com os dados ativos
    populateAdminForm();
    
    // 4. Renderizar a proposta nos slides
    renderProposal();
    
    // 5. Configurar ouvintes de eventos
    setupEventListeners();
    
    // 6. Ativar animações de rolagem
    initScrollAnimations();
});

/* ==========================================================================
   CONFIGURAÇÃO DE EVENTOS
   ========================================================================== */
function setupEventListeners() {
    // Ouvinte de mudança em tempo real para os inputs
    DOM.form.addEventListener('input', (e) => {
        updateActiveStateFromForm();
        renderProposal();
    });
    
    // Upload de Vídeo Local
    DOM.inputVideoFile.addEventListener('change', handleVideoUpload);
    
    // Upload de Imagem Local
    DOM.inputImageFile.addEventListener('change', handleImageUpload);
    
    // Salvar Projeto
    DOM.form.addEventListener('submit', (e) => {
        e.preventDefault();
        saveProjectToLocalStorage();
    });
    
    // Carregar Projeto
    DOM.btnLoadProject.addEventListener('click', loadSelectedProject);
    
    // Excluir Projeto
    DOM.btnDeleteProject.addEventListener('click', deleteSelectedProject);
    
    // Alternar visualização limpa
    DOM.previewToggleBtn.addEventListener('click', togglePreviewMode);
    DOM.floatingShowBtn.addEventListener('click', togglePreviewMode);
    
    // Copiar Link
    DOM.btnCopyLink.addEventListener('click', copyShareableLink);
    
    // Exportar HTML autônomo
    DOM.btnExportHtml.addEventListener('click', () => {
        exportStandaloneHTML().catch((err) => {
            console.error(err);
            alert('Erro ao exportar HTML. Tente novamente ou use um vídeo menor.');
            if (DOM.btnExportHtml.dataset.originalHtml) {
                DOM.btnExportHtml.innerHTML = DOM.btnExportHtml.dataset.originalHtml;
                delete DOM.btnExportHtml.dataset.originalHtml;
            }
            DOM.btnExportHtml.disabled = false;
        });
    });
}

/* ==========================================================================
   CÁLCULOS E REATIVIDADE
   ========================================================================== */
function updateActiveStateFromForm() {
    proposalData.clientName = DOM.inputClientName.value;
    proposalData.clientLocation = DOM.inputClientLocation.value;
    proposalData.currentBill = parseFloat(DOM.inputCurrentBill.value) || 0;
    proposalData.monthlyConsumption = parseInt(DOM.inputMonthlyConsumption.value) || 0;
    proposalData.minimumTax = parseFloat(DOM.inputMinimumTax.value) || 0;
    proposalData.systemGeneration = parseInt(DOM.inputSystemGeneration.value) || 0;
    proposalData.systemSize = parseFloat(DOM.inputSystemSize.value) || 0;
    proposalData.panelQty = parseInt(DOM.inputPanelQty.value) || 0;
    proposalData.panelPower = parseInt(DOM.inputPanelPower.value) || 0;
    proposalData.panelSpecs = DOM.inputPanelSpecs.value;
    proposalData.inverterSpecs = DOM.inputInverterSpecs.value;
    proposalData.investmentVal = parseFloat(DOM.inputInvestmentVal.value) || 0;
    proposalData.paybackYears = parseFloat(DOM.inputPaybackYears.value) || 0;
    
    proposalData.projectVideoUrl = DOM.inputVideoUrl.value;
    proposalData.projectImageUrl = DOM.inputImageUrl.value;
    
    proposalData.consultantName = DOM.inputConsultantName.value;
    proposalData.consultantPhone = DOM.inputConsultantPhone.value;
}

function populateAdminForm() {
    DOM.inputClientName.value = proposalData.clientName;
    DOM.inputClientLocation.value = proposalData.clientLocation;
    DOM.inputCurrentBill.value = proposalData.currentBill.toFixed(2);
    DOM.inputMonthlyConsumption.value = proposalData.monthlyConsumption;
    DOM.inputMinimumTax.value = proposalData.minimumTax.toFixed(2);
    DOM.inputSystemGeneration.value = proposalData.systemGeneration;
    DOM.inputSystemSize.value = proposalData.systemSize.toFixed(2);
    DOM.inputPanelQty.value = proposalData.panelQty;
    DOM.inputPanelPower.value = proposalData.panelPower;
    DOM.inputPanelSpecs.value = proposalData.panelSpecs;
    DOM.inputInverterSpecs.value = proposalData.inverterSpecs;
    DOM.inputInvestmentVal.value = proposalData.investmentVal.toFixed(2);
    DOM.inputPaybackYears.value = proposalData.paybackYears.toFixed(1);
    
    DOM.inputVideoUrl.value = proposalData.projectVideoUrl;
    DOM.inputImageUrl.value = proposalData.projectImageUrl;
    
    DOM.inputConsultantName.value = proposalData.consultantName;
    DOM.inputConsultantPhone.value = proposalData.consultantPhone;
    
    if (proposalData.projectVideoBase64) {
        DOM.inputVideoStatus.textContent = "Vídeo salvo em memória!";
    } else if (proposalData.projectVideoUrl) {
        DOM.inputVideoStatus.textContent = "Vídeo via link externo. O exportador tentará embutir no HTML; se falhar, use upload do .mp4.";
    } else {
        DOM.inputVideoStatus.textContent = "Nenhum vídeo. Faça upload do .mp4 para aparecer no HTML exportado.";
    }
    DOM.inputImageStatus.textContent = proposalData.projectImageBase64 ? "Imagem salva em memória!" : "Nenhuma imagem selecionada";
}

// Upload de Vídeo Local com conversão para visualização de sessão e compressão/Base64 na memória
async function handleVideoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    sessionVideoFile = file;
    DOM.inputVideoStatus.textContent = "Processando vídeo...";

    if (proposalData.tempVideoObjectUrl) {
        URL.revokeObjectURL(proposalData.tempVideoObjectUrl);
    }
    proposalData.tempVideoObjectUrl = URL.createObjectURL(file);

    const playable = await testVideoPlayable(proposalData.tempVideoObjectUrl);
    if (!playable) {
        URL.revokeObjectURL(proposalData.tempVideoObjectUrl);
        proposalData.tempVideoObjectUrl = "";
        proposalData.projectVideoBase64 = "";
        sessionVideoFile = null;
        DOM.inputVideoFile.value = "";
        DOM.inputVideoStatus.textContent = "Formato incompatível. Converta o vídeo para MP4 H.264 antes de exportar.";
        renderProposal();
        return;
    }

    fileToDataUrl(file, 'video/mp4')
        .then((dataUrl) => {
            proposalData.projectVideoBase64 = dataUrl;
            DOM.inputVideoStatus.textContent = "Vídeo pronto para exportar no HTML.";
            DOM.inputVideoUrl.value = "";
            proposalData.projectVideoUrl = "";
            renderProposal();
        })
        .catch(() => {
            proposalData.projectVideoBase64 = "";
            DOM.inputVideoStatus.textContent = "Prévia ok — exportação usará o arquivo original.";
            renderProposal();
        });
}

function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    sessionImageFile = file;
    DOM.inputImageStatus.textContent = "Processando imagem...";

    fileToDataUrl(file, 'image/jpeg')
        .then((dataUrl) => {
            proposalData.projectImageBase64 = dataUrl;
            DOM.inputImageStatus.textContent = "Imagem carregada com sucesso!";
            DOM.inputImageUrl.value = "";
            proposalData.projectImageUrl = "";
            renderProposal();
        })
        .catch(() => {
            DOM.inputImageStatus.textContent = "Erro ao carregar.";
        });
}

/* ==========================================================================
   RENDERIZAÇÃO DOS SLIDES E CÁLCULOS
   ========================================================================== */
function renderProposal() {
    // 1. Hero / Dados Básicos do Slide 1
    DOM.renderClientName.textContent = proposalData.clientName;
    
    const monthlySaving = Math.max(0, proposalData.currentBill - proposalData.minimumTax);
    
    DOM.renderSystemGeneration.textContent = proposalData.systemGeneration;
    DOM.renderMonthlySaving.textContent = formatCurrency(monthlySaving);
    
    // 2. Custos e Consumo do Slide 2
    DOM.renderCurrentBill.textContent = formatCurrency(proposalData.currentBill);
    DOM.renderMonthlyConsumption.textContent = proposalData.monthlyConsumption;
    
    // 3. Ficha Técnica do Slide 3
    DOM.renderSystemSize.textContent = proposalData.systemSize.toFixed(2);
    DOM.renderPanelQty.textContent = proposalData.panelQty;
    DOM.renderPanelPower.textContent = proposalData.panelPower;
    DOM.renderPanelSpecs.textContent = proposalData.panelSpecs;
    DOM.renderInverterSpecs.textContent = proposalData.inverterSpecs;
    DOM.renderMinimumTax.textContent = formatCurrency(proposalData.minimumTax);
    
    // 4. Investimento e Gráfico ROI
    DOM.renderInvestmentDisplay.textContent = formatCurrency(proposalData.investmentVal);
    DOM.renderPaybackStat.textContent = proposalData.paybackYears.toFixed(1);
    
    const annualSaving = monthlySaving * 12;
    const economy5Years = annualSaving * 5;
    const economy10Years = annualSaving * 10;
    const economy15Years = annualSaving * 15;
    const economy25Years = annualSaving * 25;
    
    const maxVal = economy25Years || 1;
    
    DOM.renderRoiBar1.style.height = `${Math.max(10, (economy5Years / maxVal) * 100)}%`;
    DOM.renderRoiBar1.querySelector('.bar-money').textContent = formatCompactCurrency(economy5Years);
    
    DOM.renderRoiBar2.style.height = `${Math.max(20, (economy10Years / maxVal) * 100)}%`;
    DOM.renderRoiBar2.querySelector('.bar-money').textContent = formatCompactCurrency(economy10Years);
    
    DOM.renderRoiBar3.style.height = `${Math.max(35, (economy15Years / maxVal) * 100)}%`;
    DOM.renderRoiBar3.querySelector('.bar-money').textContent = formatCompactCurrency(economy15Years);
    
    DOM.renderRoiBar4.style.height = `100%`;
    DOM.renderRoiBar4.querySelector('.bar-money').textContent = formatCompactCurrency(economy25Years);
    
    // 5. Injetar Mídia de Fundo (Vídeo ou Imagem) nos Slides 1 e 2
    renderSlideMedia(DOM.slide1MediaBg, true);  // Slide 1 - Fundo do telhado do cliente
    renderSlideMedia(DOM.slide2MediaBg, false); // Slide 2 - Telhado ou Ilustração
    
    // 6. WhatsApp CTA
    DOM.renderConsultantName.textContent = proposalData.consultantName;
    const message = `Olá! Vi a proposta comercial solar do ${proposalData.clientName} e gostaria de dar início ao projeto!`;
    DOM.whatsappCtaButton.href = `https://api.whatsapp.com/send?phone=${proposalData.consultantPhone}&text=${encodeURIComponent(message)}`;
}

/**
 * Injeta vídeo ou imagem de fundo de forma responsiva no slide
 */
function renderSlideMedia(container, prioritizeVideo = true) {
    // 1. Identificar as mídias disponíveis
    const videoSource = proposalData.tempVideoObjectUrl || proposalData.projectVideoBase64 || getDirectMediaUrl(proposalData.projectVideoUrl);
    const imageSource = proposalData.projectImageBase64 || getDirectMediaUrl(proposalData.projectImageUrl);
    
    // Se queremos priorizar o vídeo e ele existe
    if (prioritizeVideo && videoSource) {
        container.innerHTML = '';

        const video = document.createElement('video');
        video.className = 'slide-video-bg';
        video.setAttribute('autoplay', '');
        video.setAttribute('muted', '');
        video.setAttribute('loop', '');
        video.setAttribute('playsinline', '');
        video.setAttribute('webkit-playsinline', '');
        video.muted = true;
        video.playsInline = true;
        video.src = videoSource;

        const overlay = document.createElement('div');
        overlay.className = 'media-overlay-gradient';

        container.appendChild(video);
        container.appendChild(overlay);

        const playBgVideo = () => {
            video.play().catch(() => {});
        };
        video.addEventListener('loadeddata', playBgVideo);
        if (video.readyState >= 2) playBgVideo();
        return;
    }
    
    // Se não há vídeo, ou não priorizamos, e existe imagem
    if (imageSource) {
        container.innerHTML = '';

        const img = document.createElement('img');
        img.src = imageSource;
        img.className = 'slide-image-bg';
        img.alt = 'Imagem do Telhado do Cliente';

        const overlay = document.createElement('div');
        overlay.className = 'media-overlay-gradient';

        container.appendChild(img);
        container.appendChild(overlay);
        return;
    }
    
    // Fallback: Desenho geométrico dos painéis solares (SVG do CSS)
    container.innerHTML = `
        <div class="media-overlay-gradient"></div>
        <div class="media-placeholder-graphic">
            <div class="solar-panel-grid-art ${prioritizeVideo ? '' : 'blue-tint'}"></div>
        </div>
    `;
}

/* ==========================================================================
   PERSISTÊNCIA LOCAL (LOCALSTORAGE)
   ========================================================================== */
async function saveProjectToLocalStorage() {
    const key = proposalData.clientName.trim();
    if (!key) return;
    
    // Salva cópia profunda dos dados. Remove referências de Blob URLs (Object URLs) que expiram
    const toSave = JSON.parse(JSON.stringify(proposalData));
    toSave.tempVideoObjectUrl = ""; 

    // Salva vídeo no IndexedDB (sem limite de tamanho) para persistir entre sessões
    if (toSave.projectVideoBase64) {
        await saveVideoToIndexedDB(key, toSave.projectVideoBase64);
    }
    // Remove o base64 do localStorage (muito grande) — será carregado do IndexedDB depois
    toSave.projectVideoBase64 = '';
    
    savedProjects[key] = toSave;

    try {
        localStorage.setItem('solar_proposals_db', JSON.stringify(savedProjects));
    } catch (e) {
        // Se mesmo sem o vídeo ainda não couber, algo está errado
        alert('Não foi possível salvar no histórico (armazenamento cheio).');
        return;
    }
    
    updateProjectsDropdown();
    DOM.selectSavedProjects.value = key;
    
    const temVideo = proposalData.projectVideoBase64 ? ' (vídeo salvo para exportação futura)' : '';
    alert(`Projeto "${key}" salvo com sucesso no seu histórico local!${temVideo}`);
}

function loadProjectsFromLocalStorage() {
    const raw = localStorage.getItem('solar_proposals_db');
    if (raw) {
        try {
            savedProjects = JSON.parse(raw);
            updateProjectsDropdown();
        } catch(e) {
            console.error('Erro ao decodificar projetos do localStorage:', e);
        }
    }
}

function updateProjectsDropdown() {
    DOM.selectSavedProjects.innerHTML = '<option value="">-- Selecione para Carregar --</option>';
    
    Object.keys(savedProjects).sort().forEach(key => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = key;
        DOM.selectSavedProjects.appendChild(option);
    });
}

async function loadSelectedProject() {
    const key = DOM.selectSavedProjects.value;
    if (!key || !savedProjects[key]) {
        alert('Por favor, selecione um projeto válido.');
        return;
    }
    
    proposalData = JSON.parse(JSON.stringify(savedProjects[key]));
    // Limpa referências expiradas de sessão
    proposalData.tempVideoObjectUrl = "";
    sessionVideoFile = null;
    sessionImageFile = null;

    // Tenta recuperar vídeo do IndexedDB (persiste entre sessões, sem limite de tamanho)
    if (!proposalData.projectVideoBase64) {
        const savedVideo = await loadVideoFromIndexedDB(key);
        if (savedVideo) {
            proposalData.projectVideoBase64 = savedVideo;
        }
    }

    populateAdminForm();

    renderProposal();
}

function deleteSelectedProject() {
    const key = DOM.selectSavedProjects.value;
    if (!key || !savedProjects[key]) {
        alert('Selecione um projeto para excluir.');
        return;
    }
    
    if (confirm(`Tem certeza que deseja excluir o projeto de "${key}" do seu histórico?`)) {
        delete savedProjects[key];
        localStorage.setItem('solar_proposals_db', JSON.stringify(savedProjects));
        deleteVideoFromIndexedDB(key);
        updateProjectsDropdown();
        alert('Projeto removido.');
    }
}

/* ==========================================================================
   COMPARTILHAMENTO DE URL (BASE64)
   ========================================================================== */
function encodeProposalData(data) {
    const compact = {
        n: data.clientName,
        l: data.clientLocation,
        cb: data.currentBill,
        mc: data.monthlyConsumption,
        mt: data.minimumTax,
        sg: data.systemGeneration,
        sz: data.systemSize,
        pq: data.panelQty,
        pp: data.panelPower,
        ps: data.panelSpecs,
        is: data.inverterSpecs,
        iv: data.investmentVal,
        py: data.paybackYears,
        vu: data.projectVideoUrl, // Trafega links de vídeo em nuvem
        iu: data.projectImageUrl,
        cn: data.consultantName,
        cp: data.consultantPhone
    };
    
    const jsonStr = JSON.stringify(compact);
    return btoa(unescape(encodeURIComponent(jsonStr)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

function decodeProposalData(encoded) {
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
        base64 += '=';
    }
    
    const jsonStr = decodeURIComponent(escape(atob(base64)));
    const compact = JSON.parse(jsonStr);
    
    return {
        clientName: compact.n,
        clientLocation: compact.l,
        currentBill: compact.cb,
        monthlyConsumption: compact.mc,
        minimumTax: compact.mt,
        systemGeneration: compact.sg,
        systemSize: compact.sz,
        panelQty: compact.pq,
        panelPower: compact.pp,
        panelSpecs: compact.ps,
        inverterSpecs: compact.is,
        investmentVal: compact.iv,
        paybackYears: compact.py,
        projectVideoUrl: compact.vu || '',
        projectImageUrl: compact.iu || '',
        projectVideoBase64: '',
        projectImageBase64: '',
        consultantName: compact.cn,
        consultantPhone: compact.cp
    };
}

function copyShareableLink() {
    try {
        const hash = encodeProposalData(proposalData);
        const shareUrl = `${window.location.origin}${window.location.pathname}?p=${hash}`;
        
        navigator.clipboard.writeText(shareUrl).then(() => {
            alert('Link compartilhável copiado! Envie pelo WhatsApp para o seu cliente abrir a proposta de forma limpa.');
        }).catch(err => {
            prompt('Copie o link gerado abaixo:', shareUrl);
        });
    } catch(e) {
        alert('Erro ao gerar link.');
    }
}

/* ==========================================================================
   MODO VISUALIZAÇÃO LIMPA (PREVIEW)
   ========================================================================== */
function togglePreviewMode() {
    const isCollapsed = DOM.sidebar.classList.toggle('collapsed');
    
    if (isCollapsed) {
        DOM.container.style.marginLeft = '0';
        DOM.floatingShowBtn.classList.remove('hidden');
    } else {
        if (window.innerWidth > 1024) {
            DOM.container.style.marginLeft = 'var(--sidebar-width)';
        }
        DOM.floatingShowBtn.classList.add('hidden');
    }
}

/* ==========================================================================
   EXPORTAR PROPOSTA HTML AUTÔNOMA PREMIUM COM VÍDEO EMBUTIDO
   ========================================================================== */

function inferMediaMime(file, fallbackMime) {
    const currentMime = file.type || '';
    if (currentMime) return currentMime;

    const fileName = file.name || '';
    if (/\.(mp4|m4v)$/i.test(fileName)) return 'video/mp4';
    if (/\.webm$/i.test(fileName)) return 'video/webm';
    if (/\.mov$/i.test(fileName)) return 'video/quicktime';
    if (/\.png$/i.test(fileName)) return 'image/png';
    if (/\.(jpg|jpeg)$/i.test(fileName)) return 'image/jpeg';
    if (/\.webp$/i.test(fileName)) return 'image/webp';
    return fallbackMime || 'application/octet-stream';
}

function fileToDataUrl(file, fallbackMime = 'application/octet-stream') {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const raw = String(reader.result || '');
            const comma = raw.indexOf(',');
            if (comma === -1) {
                reject(new Error('data URL inválida'));
                return;
            }
            const base64 = raw.slice(comma + 1);
            const mime = inferMediaMime(file, fallbackMime);
            resolve(`data:${mime};base64,${base64}`);
        };
        reader.onerror = () => reject(reader.error || new Error('leitura do arquivo falhou'));
        reader.readAsDataURL(file);
    });
}

async function urlToDataUrl(url, fallbackMime = 'application/octet-stream') {
    const directUrl = getDirectMediaUrl(url);
    const response = await fetch(directUrl, { cache: 'no-store' });
    if (!response.ok) {
        throw new Error(`Falha ao baixar midia externa: ${response.status}`);
    }

    const blob = await response.blob();
    const fileName = directUrl.split('/').pop().split('?')[0] || 'media';
    const file = new File([blob], fileName, { type: blob.type || fallbackMime });
    return fileToDataUrl(file, fallbackMime);
}

function escapeHtmlAttribute(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function testVideoPlayable(src) {
    return new Promise((resolve) => {
        const video = document.createElement('video');
        let settled = false;
        const finish = (ok) => {
            if (settled) return;
            settled = true;
            video.removeAttribute('src');
            video.load();
            resolve(ok);
        };

        video.muted = true;
        video.preload = 'auto';
        video.playsInline = true;
        video.addEventListener('loadeddata', () => finish(video.videoWidth > 0 && video.videoHeight > 0), { once: true });
        video.addEventListener('error', () => finish(false), { once: true });
        setTimeout(() => finish(false), 8000);
        video.src = src;
        video.load();
    });
}

/* ==========================================================================
   INDEXEDDB PARA PERSISTIR VÍDEO BASE64 (LOCALSTORAGE LIMITADO A ~5MB)
   ========================================================================== */
const VIDEO_DB_NAME = 'SolarProposalsVideoDB';
const VIDEO_STORE_NAME = 'videos';

function openVideoDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(VIDEO_DB_NAME, 1);
        request.onupgradeneeded = () => {
            if (!request.result.objectStoreNames.contains(VIDEO_STORE_NAME)) {
                request.result.createObjectStore(VIDEO_STORE_NAME);
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function saveVideoToIndexedDB(key, base64) {
    if (!base64) return;
    try {
        const db = await openVideoDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(VIDEO_STORE_NAME, 'readwrite');
            tx.objectStore(VIDEO_STORE_NAME).put(base64, key);
            tx.oncomplete = () => { db.close(); resolve(); };
            tx.onerror = () => { db.close(); reject(tx.error); };
        });
    } catch (e) {
        console.warn('IndexedDB indisponível para salvar vídeo:', e);
    }
}

async function loadVideoFromIndexedDB(key) {
    try {
        const db = await openVideoDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(VIDEO_STORE_NAME, 'readonly');
            const req = tx.objectStore(VIDEO_STORE_NAME).get(key);
            req.onsuccess = () => { db.close(); resolve(req.result || ''); };
            req.onerror = () => { db.close(); reject(req.error); };
        });
    } catch (e) {
        console.warn('IndexedDB indisponível para carregar vídeo:', e);
        return '';
    }
}

async function deleteVideoFromIndexedDB(key) {
    try {
        const db = await openVideoDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(VIDEO_STORE_NAME, 'readwrite');
            tx.objectStore(VIDEO_STORE_NAME).delete(key);
            tx.oncomplete = () => { db.close(); resolve(); };
            tx.onerror = () => { db.close(); reject(tx.error); };
        });
    } catch (e) {
        console.warn('IndexedDB indisponível para remover vídeo:', e);
    }
}

function downloadBlob(blob, filename) {
    const link = document.createElement('a');
    const objectUrl = URL.createObjectURL(blob);
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // Arquivos grandes (HTML com vídeo embutido) precisam de tempo antes de revogar a URL
    setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
}

async function getExportStyles() {
    try {
        const res = await fetch(new URL('style.css', window.location.href).href, { cache: 'no-store' });
        if (res.ok) return await res.text();
    } catch (e) {
        console.warn('Não foi possível carregar style.css para exportação:', e);
    }

    let cssStyles = '';
    try {
        for (const sheet of document.styleSheets) {
            try {
                for (const rule of sheet.cssRules) {
                    cssStyles += rule.cssText + '\n';
                }
            } catch (e) {}
        }
    } catch (e) {}
    return cssStyles;
}

/**
 * Monta HTML da mídia como texto puro (sem parser do DOM) para embutir vídeo Base64 no arquivo.
 */
function buildSlideMediaHtmlString(videoSrc, imageSrc, prioritizeVideo) {
    const overlay = '<div class="media-overlay-gradient"></div>';
    const videoTag = (src) =>
        `<video autoplay muted loop playsinline webkit-playsinline class="slide-video-bg" src="${escapeHtmlAttribute(src)}"></video>`;

    if (!prioritizeVideo) {
        videoSrc = '';
    }

    if (prioritizeVideo && videoSrc) {
        return videoTag(videoSrc) + overlay;
    }
    if (imageSrc) {
        return `<img class="slide-image-bg" alt="Imagem do Telhado do Cliente" src="${escapeHtmlAttribute(imageSrc)}">${overlay}`;
    }
    const tint = prioritizeVideo ? '' : ' blue-tint';
    return `${overlay}<div class="media-placeholder-graphic"><div class="solar-panel-grid-art${tint}"></div></div>`;
}

/**
 * Resolve vídeo/imagem para o HTML exportado.
 */
async function resolveMediaForExport() {
    let videoSource = '';

    // Tenta converter arquivo da sessão (upload recente, mais confiável)
    if (sessionVideoFile) {
        try {
            videoSource = await fileToDataUrl(sessionVideoFile, 'video/mp4');
            proposalData.projectVideoBase64 = videoSource;
        } catch (e) {
            console.warn('Falha ao ler arquivo de vídeo da sessão:', e);
        }
    }

    // Se não conseguiu via arquivo, tenta base64 em memória
    if (!videoSource && proposalData.projectVideoBase64) {
        videoSource = proposalData.projectVideoBase64;
    }

    // Se ainda não tem, tenta converter blob URL da sessão
    if (!videoSource && proposalData.tempVideoObjectUrl) {
        try {
            const response = await fetch(proposalData.tempVideoObjectUrl);
            const blob = await response.blob();
            videoSource = await fileToDataUrl(new File([blob], 'video.mp4', { type: blob.type || 'video/mp4' }), 'video/mp4');
            proposalData.projectVideoBase64 = videoSource;
        } catch (e) {
            console.warn('Falha ao converter blob URL do vídeo:', e);
        }
    }

    // Último recurso: URL externa (precisa de internet no HTML exportado)
    if (!videoSource && proposalData.projectVideoUrl) {
        try {
            videoSource = await urlToDataUrl(proposalData.projectVideoUrl, 'video/mp4');
            proposalData.projectVideoBase64 = videoSource;
        } catch (e) {
            console.warn('Nao foi possivel embutir video externo; usando link direto:', e);
            videoSource = getDirectMediaUrl(proposalData.projectVideoUrl);
        }
    }

    let imageSource = '';
    if (sessionImageFile) {
        try {
            imageSource = await fileToDataUrl(sessionImageFile, 'image/jpeg');
            proposalData.projectImageBase64 = imageSource;
        } catch (e) {}
    }
    if (!imageSource && proposalData.projectImageBase64) {
        imageSource = proposalData.projectImageBase64;
    }
    if (!imageSource && proposalData.projectImageUrl) {
        try {
            imageSource = await urlToDataUrl(proposalData.projectImageUrl, 'image/jpeg');
            proposalData.projectImageBase64 = imageSource;
        } catch (e) {
            console.warn('Nao foi possivel embutir imagem externa; usando link direto:', e);
            imageSource = getDirectMediaUrl(proposalData.projectImageUrl);
        }
    }

    return { videoSource, imageSource };
}

async function exportStandaloneHTML() {
    const exportBtn = DOM.btnExportHtml;
    exportBtn.dataset.originalHtml = exportBtn.innerHTML;
    exportBtn.disabled = true;
    exportBtn.textContent = 'Preparando vídeo...';

    const { videoSource, imageSource } = await resolveMediaForExport();

    if (!videoSource && !imageSource) {
        exportBtn.innerHTML = exportBtn.dataset.originalHtml;
        delete exportBtn.dataset.originalHtml;
        exportBtn.disabled = false;
        alert('Nenhum vídeo ou imagem encontrado.\n\nFaça upload do vídeo (.mp4) na barra lateral e aguarde "Vídeo pronto para exportar" antes de baixar o HTML.');
        return;
    }

    if (videoSource && !(await testVideoPlayable(videoSource))) {
        exportBtn.innerHTML = exportBtn.dataset.originalHtml;
        delete exportBtn.dataset.originalHtml;
        exportBtn.disabled = false;
        alert('Este vídeo foi embutido, mas o navegador não consegue reproduzir o formato/codec dele.\n\nPara o HTML funcionar em qualquer computador, converta o arquivo para MP4 H.264 e faça o upload novamente.');
        return;
    }

    if (videoSource && videoSource.startsWith('data:') && videoSource.length > 45 * 1024 * 1024) {
        const proceed = confirm(
            'O vídeo é muito grande e o HTML pode demorar para abrir. Recomendamos um MP4 menor. Continuar?'
        );
        if (!proceed) {
            exportBtn.innerHTML = exportBtn.dataset.originalHtml;
            delete exportBtn.dataset.originalHtml;
            exportBtn.disabled = false;
            return;
        }
    }

    const slide1MediaHtml = buildSlideMediaHtmlString(videoSource, imageSource, true);
    const slide2MediaHtml = buildSlideMediaHtmlString('', imageSource, false);

    if (slide2MediaHtml.includes('<video')) {
        exportBtn.innerHTML = exportBtn.dataset.originalHtml;
        delete exportBtn.dataset.originalHtml;
        exportBtn.disabled = false;
        alert('Erro interno: o Slide 2 recebeu vídeo. Recarregue o gerador e tente exportar novamente.');
        return;
    }

    if (videoSource && !slide1MediaHtml.includes('<video')) {
        exportBtn.innerHTML = exportBtn.dataset.originalHtml;
        delete exportBtn.dataset.originalHtml;
        exportBtn.disabled = false;
        alert('Não foi possível montar o vídeo no HTML. Envie o arquivo .mp4 de novo.');
        return;
    }

    if (videoSource && videoSource.startsWith('data:') && !slide1MediaHtml.includes('data:')) {
        exportBtn.innerHTML = exportBtn.dataset.originalHtml;
        delete exportBtn.dataset.originalHtml;
        exportBtn.disabled = false;
        alert('Falha ao converter o vídeo. Tente um MP4 menor ou faça o upload novamente.');
        return;
    }

    const cssStyles = await getExportStyles();
    const mainClone = DOM.container.cloneNode(true);

    const slot1 = mainClone.querySelector('#slide1-media-bg');
    const slot2 = mainClone.querySelector('#slide2-media-bg');
    if (slot1) slot1.innerHTML = EXPORT_MEDIA_SLOT_1;
    if (slot2) slot2.innerHTML = EXPORT_MEDIA_SLOT_2;

    mainClone.querySelectorAll('.fade-in-up, .scale-in').forEach((el) => {
        el.classList.add('visible');
    });

    const bodyHtml = mainClone.outerHTML;
    const pos1 = bodyHtml.indexOf(EXPORT_MEDIA_SLOT_1);
    const pos2 = bodyHtml.indexOf(EXPORT_MEDIA_SLOT_2);

    if (videoSource && (pos1 === -1 || pos2 === -1)) {
        exportBtn.innerHTML = exportBtn.dataset.originalHtml;
        delete exportBtn.dataset.originalHtml;
        exportBtn.disabled = false;
        alert('Erro interno ao posicionar o vídeo no HTML. Recarregue a página e tente de novo.');
        return;
    }
    const htmlHead = `<!DOCTYPE html>
<html lang="pt-BR" class="dark">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Esse é o seu sistema solar...</title>
    <meta name="description" content="Proposta comercial interativa e simulador de economia com energia solar.">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;700;800&family=Outfit:wght@300;400;700;900&family=Playpen+Sans:wght@400;700&display=swap" rel="stylesheet">
    <style>
${cssStyles}
.client-proposal-container { margin-left: 0 !important; }
    </style>
</head>
<body>
`;
    const htmlFoot = `
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) entry.target.classList.add('visible');
                });
            }, { threshold: 0.15 });
            document.querySelectorAll('.fade-in-up, .scale-in').forEach((el) => {
                el.classList.remove('visible');
                observer.observe(el);
            });
            document.querySelectorAll('video').forEach((video) => {
                video.muted = true;
                video.play().catch(() => {});
            });
        });
    </script>
</body>
</html>`;

    const htmlFilename = `Proposta_Solar_Premium_${proposalData.clientName.replace(/\s+/g, '_')}.html`;

    let exportBlob;
    if (pos1 !== -1 && pos2 !== -1) {
        const before1 = bodyHtml.slice(0, pos1);
        const between = bodyHtml.slice(pos1 + EXPORT_MEDIA_SLOT_1.length, pos2);
        const after2 = bodyHtml.slice(pos2 + EXPORT_MEDIA_SLOT_2.length);
        exportBlob = new Blob(
            [htmlHead, before1, slide1MediaHtml, between, slide2MediaHtml, after2, htmlFoot],
            { type: 'text/html;charset=utf-8' }
        );
    } else {
        exportBlob = new Blob([htmlHead, bodyHtml, htmlFoot], { type: 'text/html;charset=utf-8' });
    }

    downloadBlob(exportBlob, htmlFilename);

    exportBtn.innerHTML = exportBtn.dataset.originalHtml;
    delete exportBtn.dataset.originalHtml;
    exportBtn.disabled = false;

    const videoNote = videoSource && videoSource.startsWith('data:')
        ? '\n\nO vídeo está embutido dentro deste único arquivo HTML.'
        : (videoSource ? '\n\nO vídeo usa link externo (precisa de internet).' : '');
    alert(`HTML exportado: ${htmlFilename}${videoNote}`);
}

/* ==========================================================================
   ANIMAÇÕES DE SCROLL
   ========================================================================== */
function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Forçar reprodução dos vídeos ao focar no slide
                const video = entry.target.querySelector('video');
                if (video) {
                    video.play().catch(() => {});
                }
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.fade-in-up, .scale-in, .presentation-slide').forEach(el => {
        observer.observe(el);
    });
}

/* ==========================================================================
   FORMATADORES & AUXILIARES
   ========================================================================== */
function formatCurrency(value) {
    return value.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function formatCompactCurrency(value) {
    if (value >= 1000) {
        return `R$ ${(value / 1000).toFixed(0)}k`;
    }
    return `R$ ${value.toFixed(0)}`;
}

/**
 * Converte links de compartilhamento do Dropbox e Google Drive em links diretos para streaming/download
 */
function getDirectMediaUrl(url) {
    if (!url) return '';
    let directUrl = url.trim();
    
    // Dropbox
    if (directUrl.includes('dropbox.com')) {
        directUrl = directUrl.replace('www.dropbox.com', 'dl.dropboxusercontent.com')
                             .replace('?dl=0', '')
                             .replace('?dl=1', '')
                             .replace('?raw=1', '');
    }
    
    // Google Drive
    else if (directUrl.includes('drive.google.com')) {
        const match = directUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || directUrl.match(/id=([a-zA-Z0-9_-]+)/);
        if (match && match[1]) {
            const fileId = match[1];
            directUrl = `https://docs.google.com/uc?export=download&id=${fileId}`;
        }
    }
    
    return directUrl;
}
