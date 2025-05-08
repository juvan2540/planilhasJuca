const form = document.getElementById("transaction-form");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const receitasList = document.getElementById("receitas-list");
const despesasList = document.getElementById("despesas-list");
const balanceDisplay = document.getElementById("balance");
const clearAllButton = document.getElementById("clear-all");
const exportCsvButton = document.getElementById("export-csv");
const chartCanvas = document.getElementById("myChart");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let chart = null;

function updateLocalStorage() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

function updateBalance() {
  const total = transactions.reduce((acc, cur) => acc + cur.amount, 0);
  balanceDisplay.textContent = `R$ ${total.toFixed(2)}`;
}

function addTransactionToDOM(transaction) {
  const li = document.createElement("li");
  li.classList.add(transaction.amount >= 0 ? "receita" : "despesa");
  li.innerHTML = `
    ${transaction.description}
    <span>${transaction.amount >= 0 ? "+" : "-"} R$ ${Math.abs(transaction.amount).toFixed(2)}</span>
  `;

  if (transaction.amount >= 0) {
    receitasList.appendChild(li);
  } else {
    despesasList.appendChild(li);
  }
}

function renderTransactions() {
  receitasList.innerHTML = "";
  despesasList.innerHTML = "";
  transactions.forEach(addTransactionToDOM);
  updateChart();
}

function clearAll() {
  transactions = [];
  updateLocalStorage();
  renderTransactions();
  updateBalance();
  updateChart();
}

function exportToCSV() {
  const csv = "Descrição,Valor\n" + transactions.map(t => `${t.description},${t.amount}`).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "transacoes.csv";
  link.click();
}

function updateChart() {
  const receitas = transactions.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
  const despesas = transactions.filter(t => t.amount < 0).reduce((acc, t) => acc + Math.abs(t.amount), 0);

  const data = {
    labels: ["Receitas", "Despesas"],
    datasets: [{
      label: "Controle Financeiro",
      data: [receitas, despesas],
      backgroundColor: ["#28a745", "#dc3545"]
    }]
  };

  if (chart) {
    chart.data = data;
    chart.update();
  } else {
    chart = new Chart(chartCanvas, {
      type: "doughnut",
      data: data,
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "bottom"
          }
        }
      }
    });
  }
}

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const description = descriptionInput.value.trim();
  let amount = parseFloat(amountInput.value);
  const type = typeInput.value;

  if (!description || isNaN(amount)) {
    alert("Preencha todos os campos corretamente.");
    return;
  }

  // Corrige valor negativo para despesas
  if (type === "despesa") {
    amount = -Math.abs(amount);
  } else {
    amount = Math.abs(amount);
  }

  const transaction = { description, amount };
  transactions.push(transaction);

  updateLocalStorage();
  renderTransactions();
  updateBalance();

  form.reset();
});

clearAllButton.addEventListener("click", clearAll);
exportCsvButton.addEventListener("click", exportToCSV);

// Inicializa
renderTransactions();
updateBalance();
