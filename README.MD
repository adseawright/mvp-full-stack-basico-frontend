# Frontend README

## Overview

Este documento fornece uma visão geral do frontend do projeto **MVP FULL STACK BÁSICO**. Esse projeto é uma continuação do projeto apresentado na disciplina de [Arquitetura de Software](https://github.com/adseawright/software_architecture_mvp_main), onde criei uma loja online para crianças venderem seus produtos ou serviços na vizinhança local. Nesse projeto, elas podem fazer o cálculo de gastos de materiais, projeção de lucro (bruto e líquido), além de introduzir o conceito de imposto. O objetivo do projeto é ensinar conceitos financeiros básicos para crianças e promover o empreendedorismo infantil.

## Demonstração
**Clique na imagem abaixo** para assistir ao vídeo de demonstração da aplicação no YouTube:

[![MVP-FULL-STACK-BASICO](https://img.youtube.com/vi/UnpUz1-8npI/maxresdefault.jpg)](https://youtu.be/UnpUz1-8npI)

## Estrutura do Projeto

O frontend está organizado da seguinte maneira:

```
frontend/
  |- index.html         # Página principal da aplicação
  |- styles.css         # Folha de estilo para aparência da página
  |- app.js             # Lógica em JavaScript para interação dinâmica na página
```

## Como Executar

Para executar o frontend do projeto, siga os seguintes passos:

1. Baixe e execute o [backend](https://github.com/adseawright/mvp-full-stack-basico-backend) para que o frontend consiga se comunicar com a API.
    A estrutura do diretorio deve ser organizada da seguinte maneira:
    ```
    Calculadora-de-lucro
      |- backend/
      |- frontend/
    ```
2. Abra o arquivo **index.html** diretamente no navegador. Isso abrirá a página da aplicação e permitirá utilizar todas as funcionalidades.

## Funcionalidades do Frontend

O frontend é dividido em quatro telas principais:

1. **Tela de Materiais**: Permite adicionar materiais utilizados na produção, com nome, quantidade, custo total e unidade de medida. Também é possível editar ou deletar materiais.
2. **Tela de Impostos**: Permite inserir o valor do imposto pago para o cálculo total de custos (se aplicável).
3. **Tela de Cálculo de Ganhos**: Ajuda a calcular o lucro baseado na quantidade produzida e no valor que deseja ganhar por unidade.
4. **Tela de Resumo de Custos e Ganhos**: Mostra o resumo dos custos totais, incluindo impostos, e calcula o lucro obtido com base nas informações inseridas.

## Exemplos de Uso

### 1. Adicionar Material

- Abra o **index.html** no navegador.
- Preencha os campos "Nome do Item", "Quantidade", "Unidade de Medida", e "Custo Total".
- Clique em **Adicionar Item**. O material será adicionado à lista abaixo do formulário.

### 2. Atualizar Imposto

- Navegue para a seção de "Impostos" e informe o valor do imposto pago (pode ser 0).
- Clique em **Salvar Imposto** para salvar o valor no backend.

### 3. Calcular Lucro

- Na seção de "Cálculo de Ganhos", informe quantas unidades foram produzidas e quanto deseja ganhar por unidade.
- Clique em **Calcular e Próximo** para ir para a próxima tela, onde será exibido o resumo dos custos e ganhos.

## Integração com Backend

O frontend se comunica com o backend para as seguintes operações:

- **Adicionar Material**: Envia uma requisição `POST` para o backend para adicionar um novo material.
- **Obter Lista de Materiais**: Requisição `GET` para obter todos os materiais cadastrados.
- **Salvar Imposto**: Requisição `POST` para atualizar o valor do imposto.
- **Calcular Ganhos**: Usa os dados de materiais e impostos armazenados no backend para calcular os ganhos e fornecer um resumo.
