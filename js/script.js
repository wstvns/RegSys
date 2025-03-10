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

    editarCadastro(id, novosDados) {
        const cadastros = this.obterCadastros();
        const index = cadastros.findIndex(cadastro => cadastro.id === id);

        if (index !== -1) {
            cadastros[index] = { ...cadastros[index], ...novosDados };
            this.atualizarLocalStorage(cadastros);
            this.exibirCadastros();
            this.mostrarMensagem('Cadastro atualizado com sucesso!', 'sucesso');
        } else {
            this.mostrarMensagem('Erro ao atualizar: cadastro não encontrado.', 'erro');
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
                    <button onclick="cadastroManager.editarFormulario(${cadastro.id})">Editar</button>
                    <button onclick="cadastroManager.deletarCadastro(${cadastro.id})">Deletar</button>
                </li>`).join('');
        } else {
            listaCadastro.innerHTML = '<li>Nenhum cadastro encontrado.</li>';
        }
    }

    editarFormulario(id) {
        const cadastros = this.obterCadastros();
        const cadastro = cadastros.find(cadastro => cadastro.id === id);

        if (cadastro) {
            // Preenche o formulário com os dados do cadastro
            document.getElementById('nome').value = cadastro.nome;
            document.getElementById('dataNascimento').value = cadastro.dataNascimento;
            document.getElementById('telefone').value = cadastro.telefone;
            document.getElementById('email').value = cadastro.email;

            // Altera o comportamento do botão de submit para atualizar em vez de criar
            document.getElementById('cadastroForm').onsubmit = e => {
                e.preventDefault();
                const { nome, dataNascimento, telefone, email } = e.target.elements;

                const novosDados = {
                    nome: nome.value,
                    dataNascimento: dataNascimento.value,
                    telefone: telefone.value,
                    email: email.value
                };

                this.editarCadastro(id, novosDados);
                e.target.reset();

                // Restaura o comportamento padrão do formulário para criar novos cadastros
                document.getElementById('cadastroForm').onsubmit = e => {
                    e.preventDefault();
                    const { nome, dataNascimento, telefone, email } = e.target.elements;

                    const novoCadastro = this.criarCadastro(
                        nome.value, dataNascimento.value, telefone.value, email.value
                    );

                    if (novoCadastro) {
                        this.salvarCadastro(novoCadastro);
                        e.target.reset();
                    }
                };
            };
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

// Evento de submit do formulário
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

// Input para pesquisa
document.getElementById('pesquisaInput').addEventListener('input', debounce(e => {
    cadastroManager.exibirCadastros(e.target.value);
}, 300));

// Exibir cadastros ao carregar a página
document.addEventListener('DOMContentLoaded', () => cadastroManager.exibirCadastros());
