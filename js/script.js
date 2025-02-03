class CadastroManager {
    constructor() {
        this.localStorageKey = 'cadastros';
    }

    obterCadastros() {
        const cadastros = JSON.parse(localStorage.getItem(this.localStorageKey));
        return cadastros || [];
    }

    atualizarLocalStorage(cadastros) {
        if (cadastros && cadastros.length > 0) {
            localStorage.setItem(this.localStorageKey, JSON.stringify(cadastros));
        } else {
            localStorage.removeItem(this.localStorageKey);
        }
    }

    validarEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    validarTelefone(telefone) {
        const regex = /^\d{10,11}$/; // Aceita 10 ou 11 dígitos
        return regex.test(telefone);
    }

    criarCadastro(nome, dataNascimento, telefone, email) {
        if (nome && dataNascimento && telefone && email) {
            if (!this.validarEmail(email)) {
                this.mostrarMensagem('Por favor, insira um e-mail válido.', 'erro');
                return null;
            }
            if (!this.validarTelefone(telefone)) {
                this.mostrarMensagem('Por favor, insira um telefone válido (10 ou 11 dígitos).', 'erro');
                return null;
            }
            return { id: Date.now(), nome, dataNascimento, telefone, email };
        } else {
            this.mostrarMensagem('Todos os campos são obrigatórios.', 'erro');
            return null;
        }
    }

    salvarCadastro(cadastro) {
        if (cadastro) {
            const cadastros = this.obterCadastros();
            cadastros.push(cadastro);
            this.atualizarLocalStorage(cadastros);
            this.exibirCadastros();
            this.mostrarMensagem('Cadastro realizado com sucesso!', 'sucesso');
        }
    }

    formatarData(data) {
        return data ? data.split('-').reverse().join('/') : '';
    }

    exibirCadastros(filtro = '') {
        const listaCadastro = document.getElementById('listaCadastro');
        const cadastros = this.obterCadastros().filter(cadastro =>
            cadastro.nome.toLowerCase().includes(filtro.toLowerCase())
        );

        if (cadastros.length > 0) {
            listaCadastro.innerHTML = cadastros.map(cadastro => `
                <li>
                    ${cadastro.nome} - ${this.formatarData(cadastro.dataNascimento)} - ${cadastro.telefone} - ${cadastro.email}
                    <button onclick="cadastroManager.deletarCadastro(${cadastro.id})">Deletar</button>
                </li>`).join('');
        } else {
            listaCadastro.innerHTML = '<li>Nenhum cadastro encontrado.</li>';
        }
    }

    deletarCadastro(id) {
        const cadastros = this.obterCadastros();
        const novoCadastros = cadastros.filter(cadastro => cadastro.id !== id);

        if (novoCadastros.length !== cadastros.length) {
            this.atualizarLocalStorage(novoCadastros);
            this.exibirCadastros();
            this.mostrarMensagem('Cadastro deletado com sucesso!', 'sucesso');
        } else {
            this.mostrarMensagem('Erro ao deletar: cadastro não encontrado.', 'erro');
        }
    }

    mostrarMensagem(mensagem, tipo) {
        const feedback = document.getElementById('mensagemFeedback');
        feedback.textContent = mensagem;
        feedback.className = tipo;
        setTimeout(() => feedback.textContent = '', 3000);
    }
}

// Instância da classe CadastroManager
const cadastroManager = new CadastroManager();

// Evento de submit do formulario
document.getElementById('cadastroForm').addEventListener('submit', e => {
    e.preventDefault();
    const { nome, dataNascimento, telefone, email } = e.target.elements;

    const novoCadastro = cadastroManager.criarCadastro(
        nome.value, dataNascimento.value, telefone.value, email.value
    );

    if (novoCadastro) {
        cadastroManager.salvarCadastro(novoCadastro);
        e.target.reset();
    }
});

// Debounce para pesquisa
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// input para pesquisa
document.getElementById('pesquisaInput').addEventListener('input', debounce(e => {
    cadastroManager.exibirCadastros(e.target.value);
}, 300));

// Exibir cadastros ao carregar a pagina
document.addEventListener('DOMContentLoaded', () => cadastroManager.exibirCadastros());