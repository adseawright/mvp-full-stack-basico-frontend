// Configuração da URL base da API
const apiBaseUrl = 'http://127.0.0.1:5000';

// Funções para navegação entre telas
async function nextScreen(nextSectionId) {
  const currentSection = document.querySelector('.screen:not([style*="display: none"])');
  const nextSection = document.getElementById(nextSectionId);

  if (currentSection && nextSection) {
    currentSection.style.display = 'none';
    nextSection.style.display = 'block';
    updateProgress(nextSectionId);
  } else {
    console.error("Erro ao tentar mudar de tela: Elementos não encontrados");
  }
}

async function previousScreen(previousSectionId) {
  const currentSection = document.querySelector('.screen:not([style*="display: none"])');
  const previousSection = document.getElementById(previousSectionId);

  if (currentSection && previousSection) {
    currentSection.style.display = 'none';
    previousSection.style.display = 'block';
    updateProgress(previousSectionId);
  } else {
    console.error("Erro ao tentar voltar de tela: Elementos não encontrados");
  }
}

// Função para atualizar progresso da navegação entre telas
function updateProgress(currentSectionId) {
  const steps = ['materiais-section', 'imposto-section', 'lucro-section', 'resumo-section'];
  steps.forEach((step, index) => {
    const stepElement = document.getElementById(`step-${index + 1}`);
    if (stepElement) {
      if (steps.indexOf(currentSectionId) >= index) {
        stepElement.classList.add('active');
      } else {
        stepElement.classList.remove('active');
      }
    }
  });
}

// Função para carregar unidades de medida no dropdown
async function loadUnits(selectId) {
  try {
    const response = await fetch(`${apiBaseUrl}/listar_unidades`);
    if (!response.ok) throw new Error("Erro ao obter unidades de medida");

    const unidades = await response.json();
    const unidadeSelect = document.getElementById(selectId);
    
    if (unidadeSelect) {
      unidadeSelect.innerHTML = ''; 
      unidades.forEach(unidade => {
        const option = document.createElement('option');
        option.value = unidade.id; 
        option.textContent = unidade.nome; 
        unidadeSelect.appendChild(option);
      });      
    }
  } catch (error) {
    console.error("Erro ao carregar unidades de medida:", error);
  }
}

// Função para carregar materiais e exibir na lista
async function loadMaterials() {
  try {
    const response = await fetch(`${apiBaseUrl}/listar_materiais`);
    if (!response.ok) throw new Error("Erro ao obter materiais");
    const materiais = await response.json();

    const materialList = document.getElementById('materialList');
    if (!materialList) {
      console.error("Erro: Elemento materialList não encontrado no HTML.");
      return;
    }

    materialList.innerHTML = ''; // Resetar lista
    resetForm(); // Reseta o formulário para evitar qualquer problema com o estado

    let totalCusto = 0;
    materiais.forEach(material => {
      // Validar se todos os valores estão definidos, caso contrário atribuir valor padrão
      const nome = material.nome || '';
      const quantidade = material.quantidade != null ? material.quantidade : 0; 
      const custoTotal = material.custo_total != null ? material.custo_total : 0;
      const unidade = material.unidade || 'unidades';

      totalCusto += parseFloat(custoTotal);

      // Construir o HTML do material
      materialList.innerHTML += 
        `<li id="material-${material.id}" class="material-item">
          <span id="nome-display-${material.id}">${nome}</span>
          <span id="quantidade-display-${material.id}">${quantidade} ${unidade}</span>
          <span id="custo-display-${material.id}">$${custoTotal}</span>
          <div class="edit-delete-buttons">
            <button onclick="enableEdit(${material.id})" class="edit-button large-button">✏️ Editar</button>
            <button onclick="deleteMaterial(${material.id})" class="delete-button large-button">❌ Deletar</button>
          </div>
        </li>`;
    });

    const totalGastoElement = document.getElementById('total_gasto');
    if (totalGastoElement) {
      totalGastoElement.innerText = totalCusto.toFixed(2);
    }
  } catch (error) {
    console.error("Erro ao carregar materiais:", error);
  }
}


// Função para adicionar material usando o formulário principal
async function addMaterial(e) {
  e.preventDefault();

  const nome = document.getElementById('nome').value;
  const quantidade = parseFloat(document.getElementById('quantidade').value);
  const custo_total = parseFloat(document.getElementById('custo_total').value);
  const unidade_id = document.getElementById('unidade').value;

  // verifica que todos os campos estao preenchidos corretamente
  if (!nome || isNaN(quantidade) || isNaN(custo_total) || !unidade_id) {
    showFeedback("Por favor, preencha todos os campos corretamente. ⚠️");
    return;
  }

  const material = { nome, quantidade, custo_total, unidade_id };

  try {
    const response = await fetch(`${apiBaseUrl}/cadastrar_material`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(material),
    });

    if (!response.ok) throw new Error('Erro ao cadastrar material');

    await response.json();
    loadMaterials();
    showFeedback("Material cadastrado com sucesso! ✅");
    resetForm();
  } catch (error) {
    console.error("Erro ao cadastrar material:", error);
  }
}

/// Função para habilitar a edição inline de um material específico
function enableEdit(materialId) {
  const nomeDisplay = document.getElementById(`nome-display-${materialId}`);
  const quantidadeDisplay = document.getElementById(`quantidade-display-${materialId}`);
  const custoDisplay = document.getElementById(`custo-display-${materialId}`);

  // Define todos os campos antes de tentar acessá-los
  const nome = nomeDisplay ? nomeDisplay.textContent.trim() : '';
  const quantidade = quantidadeDisplay ? quantidadeDisplay.textContent.split(' ')[0] : '0';
  const unidade = quantidadeDisplay ? quantidadeDisplay.textContent.split(' ')[1] : 'unidade';
  const custo = custoDisplay ? custoDisplay.textContent.replace('$', '').trim() : '0';

  // Substituir o conteúdo atual por campos editáveis (inline)
  const editFieldsHTML = `
    <div class="edit-fields">
      <input type="text" id="edit-nome-${materialId}" value="${nome}" />
      <input type="number" step="0.01" id="edit-quantidade-${materialId}" value="${quantidade}" />
      <select id="edit-unidade-${materialId}" class="input-field"></select>
      <input type="number" step="0.01" id="edit-custo-${materialId}" value="${custo}" />
    </div>
    <div class="edit-buttons">
      <button onclick="saveEdit(${materialId})" class="save-button">Salvar</button>
      <button onclick="cancelEdit(${materialId})" class="cancel-button">Cancelar</button>
    </div>`;

  nomeDisplay.parentElement.innerHTML = editFieldsHTML;

  // Carregar as unidades de medida no dropdown da edição
  loadUnits(`edit-unidade-${materialId}`).then(() => {
    const unidadeSelect = document.getElementById(`edit-unidade-${materialId}`);
    if (unidadeSelect) {
      unidadeSelect.value = unidade; // Tentar definir a unidade se disponível
    }
  });
}

// Função para salvar a edição de um material
async function saveEdit(materialId) {
  const nome = document.getElementById(`edit-nome-${materialId}`).value || '';
  const quantidade = parseFloat(document.getElementById(`edit-quantidade-${materialId}`).value) || 0;
  const custo_total = parseFloat(document.getElementById(`edit-custo-${materialId}`).value) || 0;
  const unidade_id = parseInt(document.getElementById(`edit-unidade-${materialId}`).value, 10);

  if (!nome || quantidade <= 0 || custo_total <= 0 || isNaN(unidade_id)) {
    showFeedback("Por favor, insira valores válidos para todos os campos. ⚠️");
    return;
  }

  const updatedMaterial = { nome, quantidade, custo_total, unidade_id };

  try {
    const response = await fetch(`${apiBaseUrl}/atualizar_material/${materialId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedMaterial),
    });

    if (!response.ok) throw new Error('Erro ao atualizar material');

    await response.json();
    loadMaterials();
    showFeedback("Material atualizado com sucesso! ✅");
  } catch (error) {
    console.error("Erro ao atualizar material:", error);
  }
}

// cancela a edição de um material (recarrega a lista)
function cancelEdit(materialId) {
  loadMaterials(); // Recarrega os materiais para restaurar o estado original
}

// deletar material
async function deleteMaterial(materialId) {
  try {
    const response = await fetch(`${apiBaseUrl}/deletar_material/${materialId}`, {
      method: 'DELETE',
    });

    if (!response.ok) throw new Error('Erro ao deletar material');

    await response.json();
    // Recarrega a lista de materiais e redefine o estado dos campos do formulário
    loadMaterials();  
    resetForm();  
    showFeedback("Material deletado com sucesso! ✅");
  } catch (error) {
    console.error("Erro ao deletar material:", error);
  }
}

// mostra feedback pro usuário
function showFeedback(message) {
  const feedbackElement = document.getElementById('feedback');
  if (feedbackElement) {
    feedbackElement.innerText = message;
    feedbackElement.style.display = 'block';
    setTimeout(() => {
      feedbackElement.style.display = 'none';
    }, 3000);
  }
}

// limpa o formulário após adicionar um material
function resetForm() {
  document.getElementById('nome').value = '';
  document.getElementById('quantidade').value = '';
  document.getElementById('custo_total').value = '';
  document.getElementById('unidade').value = '';
  
  // Defini a unidade de medida como o valor padrão (opcionalmente o primeiro da lista)
  const unidadeSelect = document.getElementById('unidade');
  if (unidadeSelect && unidadeSelect.options.length > 0) {
    unidadeSelect.selectedIndex = 0; // Seleciona o primeiro valor da lista de unidades
  }
}


// salva o imposto
async function saveTax() {
  const imposto = parseFloat(document.getElementById('imposto').value);
  
  // Verifica valor do imposto
  if (isNaN(imposto) || imposto < 0) {
    showFeedback("Por favor, insira um valor válido para o imposto. ⚠️");
    return;
  }

  const taxData = { valor: imposto };

  try {
    const response = await fetch(`${apiBaseUrl}/salvar_imposto`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taxData),
    });

    if (!response.ok) {
      throw new Error('Erro ao salvar imposto');
    }

    await response.json();
    showFeedback("Imposto salvo com sucesso! ✅");
  } catch (error) {
    console.error("Erro ao salvar imposto:", error);
    showFeedback("Erro ao salvar imposto. ⚠️");
  }
}

// carrega imposto e armazena em uma variável global
let impostoGlobal = 0;

async function loadTax() {
  try {
      const response = await fetch(`${apiBaseUrl}/obter_imposto`);
      if (!response.ok) throw new Error('Erro ao obter imposto');
      
      const data = await response.json();
      impostoGlobal = parseFloat(data.valor) || 0;

      const impostoPagoElement = document.getElementById('imposto_pago');
      if (impostoPagoElement) {
          impostoPagoElement.innerText = impostoGlobal.toFixed(2);
      }
  } catch (error) {
      console.error('Erro ao carregar imposto:', error);
  }
}

// calcula o total com imposto e navega para a próxima tela
function calculateTotalWithTax() {
  try {

    document.getElementById('calculate-and-next').addEventListener('click', () => {
      calculateTotalWithTax();
      setTimeout(() => {
        nextScreen('resumo-section');
      }, 200); // Pequeno atraso para garantir que o cálculo seja concluído antes da navegação
    });
    
    
    // Obtém os valores do imposto (carregado previamente) e do total gasto dos materiais
    const rendimento = parseFloat(document.getElementById('rendimento').value);
    const lucroDesejado = parseFloat(document.getElementById('lucro').value);
    const totalGasto = parseFloat(document.getElementById('total_gasto').innerText);
    const impostoPago = impostoGlobal;

    // Verifica se todos os valores necessários estão disponíveis
    if (isNaN(rendimento) || isNaN(lucroDesejado) || isNaN(totalGasto) || isNaN(impostoPago)) {
      showFeedback("Por favor, preencha todos os campos necessários para calcular o total. ⚠️");
      return;
    }

    // Calcula o custo total considerando os gastos e o imposto
    const totalComTaxa = totalGasto + impostoPago;

    // Calcula o gasto por unidade
    const custoPorUnidade = totalComTaxa / rendimento;

    // Calcula o preço de venda por unidade (custo por unidade + lucro desejado)
    const precoVendaPorUnidade = custoPorUnidade + lucroDesejado;

    // Calcula a receita total e o lucro final
    const receitaTotal = rendimento * precoVendaPorUnidade;
    const lucroTotal = receitaTotal - totalComTaxa;

    // Atualiza o resumo na tela de resumo
    document.getElementById('total_com_taxa').innerText = totalComTaxa.toFixed(2);
    document.getElementById('custo_por_unidade').innerText = custoPorUnidade.toFixed(2);
    document.getElementById('preco_venda').innerText = precoVendaPorUnidade.toFixed(2);
    document.getElementById('revenue_total').innerText = receitaTotal.toFixed(2);
    document.getElementById('lucro_por_unidade').innerText = lucroDesejado.toFixed(2);
    document.getElementById('lucro_total').innerText = lucroTotal.toFixed(2);
    document.getElementById('imposto_pago').innerText = impostoPago.toFixed(2);

    // Carregar a lista de materiais no resumo de custos
    loadMaterialDetailsForSummary();
  } catch (error) {
    console.error("Erro ao calcular o total com imposto:", error);
    showFeedback("Erro ao calcular os ganhos. ⚠️");
  }
}

function loadMaterialDetailsForSummary() {
  try {
    // Obtém as referências dos elementos da lista de materiais e do container de resumo
    const materialList = document.getElementById('materialList');
    const materialSummaryContainer = document.getElementById('material-summary');

    // Verifica se os elementos necessários foram encontrados no DOM
    if (!materialList || !materialSummaryContainer) {
      console.error("Erro ao encontrar elementos de resumo de materiais.");
      return;
    }

    
    let resumoHtml = "";
    const materialItems = materialList.querySelectorAll('li.material-item');
    
    // Caso não haja itens na lista de materiais, mostra um aviso e encerra a execução
    if (materialItems.length === 0) {
      console.warn("Nenhum material encontrado para o resumo.");
      return;
    }

    // Itera por cada item de material na lista
    materialItems.forEach(materialItem => {
      // Busca os elementos de nome, quantidade e custo dentro de cada item
      const nomeElement = materialItem.querySelector(`[id^="nome-display-"]`);
      const quantidadeElement = materialItem.querySelector(`[id^="quantidade-display-"]`);
      const custoElement = materialItem.querySelector(`[id^="custo-display-"]`);

      // Caso algum dos elementos esperados não seja encontrado, registra um erro detalhado para facilitar o debug
      if (!nomeElement) console.error(`Erro: Elemento 'nome-display' não encontrado para o material ID ${materialItem.id}`);
      if (!quantidadeElement) console.error(`Erro: Elemento 'quantidade-display' não encontrado para o material ID ${materialItem.id}`);
      if (!custoElement) console.error(`Erro: Elemento 'custo-display' não encontrado para o material ID ${materialItem.id}`);

      // Se qualquer um dos elementos estiver faltando, pula para o próximo material
      if (!nomeElement || !quantidadeElement || !custoElement) {
        return;  // 
      }

      // Extrai os textos de nome, quantidade e custo, removendo possíveis espaços em branco
      const nome = nomeElement.innerText.trim();
      const quantidade = quantidadeElement.innerText.trim();
      const custo = custoElement.innerText.trim();

      resumoHtml += `
        <div class="material-summary-item">
          <span>${nome} - ${quantidade} - ${custo}</span>
        </div>
      `;
    });

    // Atualiza o container de resumo de materiais com os detalhes de todos os itens da lista
    materialSummaryContainer.innerHTML = resumoHtml;

  } catch (error) {
    console.error("Erro ao carregar detalhes dos materiais para o resumo:", error);
  }
}

// Inicializa os formulários e carrega os dados
document.addEventListener('DOMContentLoaded', function() {
  loadMaterials();
  loadUnits('unidade');
  loadTax(); // Carregar o imposto previamente salvo ao carregar a página

  // Avança para a seção de impostos
  document.getElementById('next-to-imposto').addEventListener('click', () => {
    nextScreen('imposto-section'); 
  });

  // Aguarda a execução de saveTax
  document.getElementById('save-imposto').addEventListener('click', async () => {
    await saveTax(); 
  });

  // Avança para a seção de cálculo de lucro somente após salvar o imposto
  document.getElementById('next-to-lucro').addEventListener('click', async () => {
    await saveTax(); 
    nextScreen('lucro-section'); 
  });

  document.getElementById('calculate-and-next').addEventListener('click', () => {
    calculateTotalWithTax(); // Chama a função para calcular o total com imposto
    setTimeout(() => {
      nextScreen('resumo-section'); // Avança para a seção de Resumo após cálculo
    }, 200); // Atrasa um pouco para garantir que o cálculo seja concluído antes da navegação
  });
  

  document.getElementById('back-to-materiais').addEventListener('click', () => {
    previousScreen('materiais-section'); // Volta para a seção de Materiais
  });
  
  document.getElementById('back-to-imposto').addEventListener('click', () => {
    previousScreen('imposto-section'); // Volta para a seção de Impostos
  });
  
  document.getElementById('back-to-lucro').addEventListener('click', () => {
    previousScreen('lucro-section'); // Volta para a seção de Cálculo de Ganhos
  });
  
});
