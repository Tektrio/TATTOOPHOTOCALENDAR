// 🧪 ARQUIVO DE TESTE - Configurações do Cursor
// Este arquivo testa se as configurações estão funcionando

// Teste 1: Auto imports
// Tente importar algo - deve sugerir automaticamente
console.log("Teste 1: Auto imports ativo");

// Teste 2: Format on save
// Salve este arquivo (⌘ + S) - deve formatar automaticamente
const teste       =        "formatação";
const objeto={nome:"teste",valor:123};

// Teste 3: Bracket colorization
// Você deve ver cores diferentes nos parênteses
function testeAninhado() {
    if (true) {
        if (true) {
            if (true) {
                console.log("Cores diferentes nos parênteses?");
            }
        }
    }
}

// ✅ Se ao salvar este arquivo:
// - A formatação ficou limpa (espaços corretos)
// - Parênteses têm cores diferentes
// - Auto imports funcionam
// = TUDO ESTÁ FUNCIONANDO PERFEITAMENTE! 🎉

export default testeAninhado;

