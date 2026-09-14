// script.js - Lógica principal do sistema

// ============ 1. ATUALIZAR DASHBOARD ============
function atualizarDashboard() {
  const total = viaturas.length;
  const emOperacao = viaturas.filter(v => v.status === 'Em operação').length;
  const emManutencao = viaturas.filter(v => v.status === 'Em manutenção').length;
  const indisponivel = viaturas.filter(v => v.status === 'Indisponível').length;

  // Atualizar os cards do dashboard
  document.querySelectorAll('.card-valor')[0].textContent = total;
  document.querySelectorAll('.card-valor')[1].textContent = emOperacao;
  document.querySelectorAll('.card-valor')[2].textContent = emManutencao;
  document.querySelectorAll('.card-valor')[3].textContent = indisponivel;
}

// ============ 2. GRÁFICO DE STATUS (Pizza/Donut) ============
function criarGraficoStatus() {
  const emOperacao = viaturas.filter(v => v.status === 'Em operação').length;
  const emManutencao = viaturas.filter(v => v.status === 'Em manutenção').length;
  const indisponivel = viaturas.filter(v => v.status === 'Indisponível').length;

  const ctx = document.getElementById('graficoStatus');
  if (!ctx) return;

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Em Operação', 'Em Manutenção', 'Indisponível'],
      datasets: [{
        data: [emOperacao, emManutencao, indisponivel],
        backgroundColor: ['#22c55e', '#eab308', '#ef4444'],
        borderWidth: 2,
        borderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' },
        title: { display: false }
      }
    }
  });
}

// ============ 3. GRÁFICO DE MANUTENÇÕES POR MÊS (Barras) ============
function criarGraficoManutencoes() {
  const ctx = document.getElementById('graficoManutencoes');
  if (!ctx) return;

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: manutencoesPorMes.labels,
      datasets: [{
        label: 'Manutenções',
        data: manutencoesPorMes.data,
        backgroundColor: '#3b82f6',
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    }
  });
}

// ============ 4. PREENCHER TABELA DE VIATURAS ============
function preencherTabelaViaturas() {
  const tbody = document.getElementById('tbodyViaturas');
  if (!tbody) return;

  tbody.innerHTML = viaturas.map(v => {
    let cor = '#22c55e';
    if (v.status === 'Em manutenção') cor = '#eab308';
    if (v.status === 'Indisponível') cor = '#ef4444';

    return `
      <tr>
        <td>${v.numero}</td>
        <td>${v.placa}</td>
        <td>${v.modelo}</td>
        <td>${v.ano}</td>
        <td>${v.km.toLocaleString('pt-BR')} km</td>
        <td>${v.unidade}</td>
        <td><span style="color:${cor}; font-weight:600;">●</span> ${v.status}</td>
        <td>
          <button onclick="editarViatura('${v.numero}')" style="background:#3b82f6;color:#fff;border:none;padding:4px 8px;border-radius:4px;cursor:pointer;">Editar</button>
          <button onclick="excluirViatura('${v.numero}')" style="background:#ef4444;color:#fff;border:none;padding:4px 8px;border-radius:4px;cursor:pointer;">Excluir</button>
        </td>
      </tr>
    `;
  }).join('');
}

// ============ 5. PREENCHER TABELA DE ORDENS DE SERVIÇO ============
function preencherTabelaOS() {
  const tbody = document.getElementById('tbodyOS');
  if (!tbody) return;

  tbody.innerHTML = ordensServico.map(os => `
    <tr>
      <td>${os.numero}</td>
      <td>${os.viatura}</td>
      <td>${os.data}</td>
      <td>${os.responsavel}</td>
      <td>${os.problema}</td>
      <td>R$ ${os.custo.toFixed(2)}</td>
      <td>${os.status}</td>
    </tr>
  `).join('');
}

// ============ 6. ALERTAS IMPORTANTES ============
function gerarAlertas() {
  const container = document.getElementById('listaAlertas');
  if (!container) return;

  const alertas = [];

  // Alerta de viaturas indisponíveis
  viaturas.filter(v => v.status === 'Indisponível').forEach(v => {
    alertas.push({ tipo: 'danger', msg: `🚨 ${v.numero} (${v.modelo}) está INDISPONÍVEL` });
  });

  // Alerta de viaturas em manutenção
  viaturas.filter(v => v.status === 'Em manutenção').forEach(v => {
    alertas.push({ tipo: 'warning', msg: `⚠️ ${v.numero} (${v.modelo}) está em manutenção` });
  });

  // Alerta de KM alto (> 70.000)
  viaturas.filter(v => v.km > 70000).forEach(v => {
    alertas.push({ tipo: 'info', msg: `📊 ${v.numero} precisa de revisão (${v.km.toLocaleString('pt-BR')} km)` });
  });

  if (alertas.length === 0) {
    container.innerHTML = '<p style="color:#22c55e;">✅ Nenhum alerta no momento</p>';
    return;
  }

  const cores = { danger: '#fee2e2', warning: '#fef3c7', info: '#dbeafe' };
  const bordas = { danger: '#ef4444', warning: '#eab308', info: '#3b82f6' };

  container.innerHTML = alertas.map(a => `
    <div style="background:${cores[a.tipo]}; border-left:4px solid ${bordas[a.tipo]}; padding:10px; margin:6px 0; border-radius:4px;">
      ${a.msg}
    </div>
  `).join('');
}

// ============ 7. MAPA DE RASTREAMENTO (Leaflet) ============
function criarMapa() {
  const mapEl = document.getElementById('mapa');
  if (!mapEl || typeof L === 'undefined') return;

  // Coordenadas de Blumenau - SC
  const mapa = L.map('mapa').setView([-26.9194, -49.0661], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(mapa);

  // Posições simuladas das viaturas
  const posicoes = [
    { numero: 'PM-001', lat: -26.9150, lng: -49.0700, status: 'Em operação' },
    { numero: 'PM-002', lat: -26.9230, lng: -49.0600, status: 'Em manutenção' },
    { numero: 'PM-003', lat: -26.9180, lng: -49.0650, status: 'Em operação' },
    { numero: 'PM-004', lat: -26.9250, lng: -49.0720, status: 'Indisponível' },
    { numero: 'PM-005', lat: -26.9120, lng: -49.0580, status: 'Em operação' }
  ];

  posicoes.forEach(p => {
    let cor = 'green';
    if (p.status === 'Em manutenção') cor = 'orange';
    if (p.status === 'Indisponível') cor = 'red';

    const icone = L.divIcon({
      className: 'custom-marker',
      html: `<div style="background:${cor}; width:20px; height:20px; border-radius:50%; border:3px solid #fff; box-shadow:0 0 6px rgba(0,0,0,0.4);"></div>`,
      iconSize: [20, 20]
    });

    L.marker([p.lat, p.lng], { icon: icone })
      .addTo(mapa)
      .bindPopup(`<b>${p.numero}</b><br>${p.status}`);
  });
}

// ============ 8. EXPORTAR PARA EXCEL (SheetJS) ============
function exportarExcel() {
  if (typeof XLSX === 'undefined') {
    alert('Biblioteca SheetJS não carregada');
    return;
  }

  const ws = XLSX.utils.json_to_sheet(viaturas);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Viaturas');
  XLSX.writeFile(wb, `frota_pm_${new Date().toISOString().split('T')[0]}.xlsx`);
}

// ============ 9. AÇÕES DE EDITAR/EXCLUIR ============
function editarViatura(numero) {
  alert(`Editar viatura ${numero} - implementar modal`);
}

function excluirViatura(numero) {
  if (confirm(`Tem certeza que deseja excluir a viatura ${numero}?`)) {
    alert(`Viatura ${numero} excluída (implementar persistência)`);
  }
}

// ============ 10. BUSCA/FILTRO ============
function filtrarViaturas() {
  const termo = document.getElementById('buscaViatura')?.value.toLowerCase() || '';
  const linhas = document.querySelectorAll('#tbodyViaturas tr');

  linhas.forEach(linha => {
    const texto = linha.textContent.toLowerCase();
    linha.style.display = texto.includes(termo) ? '' : 'none';
  });
}

// ============ 11. NOTIFICAÇÕES TOASTIFY ============
function notificar(mensagem, tipo = 'info') {
  if (typeof Toastify === 'undefined') {
    console.log(mensagem);
    return;
  }

  const cores = { info: '#3b82f6', success: '#22c55e', warning: '#eab308', error: '#ef4444' };

  Toastify({
    text: mensagem,
    duration: 4000,
    gravity: 'top',
    position: 'right',
    style: { background: cores[tipo] || '#3b82f6', borderRadius: '8px' }
  }).showToast();
}

// ============ INICIALIZAÇÃO ============
document.addEventListener('DOMContentLoaded', () => {
  atualizarDashboard();
  criarGraficoStatus();
  criarGraficoManutencoes();
  preencherTabelaViaturas();
  preencherTabelaOS();
  gerarAlertas();
  criarMapa();

  // Notificação de boas-vindas
  setTimeout(() => notificar('✅ Sistema carregado com sucesso!', 'success'), 500);
});
// ============================================================
// RESPONSIVIDADE — TOGGLE DO MENU MOBILE
// Bloco isolado — não altera nada do sistema existente
// ============================================================
document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.getElementById('menuToggle');
  var nav = document.getElementById('navPrincipal');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('aberto');
    });

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('aberto');
      });
    });
  }
});
