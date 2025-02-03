function CadastroManager() {
    const localStorageKey = 'cadastros';

    function obterCadastros() {
        const cadastros = JSON.parse(localStorage.getItem(localStorageKey));
        if (cadastros) {
            return cadastros;
        } else {
            return [];
        }
    }

    function atualizarLocalStorage(cadastros) {
        if (cadastros && cadastros.length > 0) {
            localStorage.setItem(localStorageKey, JSON.stringify(cadastros));
        } else {
            localStorage.removeItem(localStorageKey);
        }
    }

    function criarCadastro(nome, dataNascimento, telefone, email) {
        if (nome && dataNascimento && telefone && email) {
            return { id: Date.now(), nome, dataNascimento, telefone, email };
        } else {
            console.error("Todos os campos são obrigatórios para criar um cadastro.");
            return null;
        }
    }

    function salvarCadastro(cadastro) {
        if (cadastro) {
            const cadastros = obterCadastros();
            cadastros.push(cadastro);
            atualizarLocalStorage(cadastros);
            exibirCadastros();
        } else {
            console.error("Cadastro inválido, não foi salvo.");
        }
    }

    function formatarData(data) {
        if (data) {
            return data.split('-').reverse().join('/');
        } else {
            return '';
        }
    }

    function exibirCadastros(filtro = '') {
        const listaCadastro = document.getElementById('listaCadastro');
        const cadastros = obterCadastros().filter(cadastro => 
            cadastro.nome.toLowerCase().includes(filtro.toLowerCase())
        );

        if (cadastros.length > 0) {
            listaCadastro.innerHTML = cadastros.map(cadastro => `
                <li>
                    ${cadastro.nome} - ${formatarData(cadastro.dataNascimento)} - ${cadastro.telefone} - ${cadastro.email}
                    <button onclick="cadastroManager.deletarCadastro(${cadastro.id})">Deletar</button>
                </li>`).join('');
        } else {
            listaCadastro.innerHTML = '<li>Nenhum cadastro encontrado.</li>';
        }
    }

    function deletarCadastro(id) {
        const cadastros = obterCadastros();
        const novoCadastros = cadastros.filter(cadastro => cadastro.id !== id);
        
        if (novoCadastros.length !== cadastros.length) {
            atualizarLocalStorage(novoCadastros);
            exibirCadastros();
        } else {
            console.error("Erro ao deletar: cadastro não encontrado.");
        }
    }

    return {
        criarCadastro,
        salvarCadastro,
        exibirCadastros,
        deletarCadastro
    };
}

const cadastroManager = CadastroManager();

document.getElementById('cadastroForm').addEventListener('submit', e => {
    e.preventDefault();
    const { nome, dataNascimento, telefone, email } = e.target.elements;
    
    if (nome.value && dataNascimento.value && telefone.value && email.value) {
        const novoCadastro = cadastroManager.criarCadastro(
            nome.value, dataNascimento.value, telefone.value, email.value
        );
        
        if (novoCadastro) {
            cadastroManager.salvarCadastro(novoCadastro);
            e.target.reset();
        } else {
            console.error("Erro ao criar o cadastro.");
        }
    } else {
        console.error("Todos os campos do formulário são obrigatórios.");
    }
});

document.getElementById('pesquisaInput').addEventListener('input', e => {
    cadastroManager.exibirCadastros(e.target.value);
});

document.addEventListener('DOMContentLoaded', () => cadastroManager.exibirCadastros());