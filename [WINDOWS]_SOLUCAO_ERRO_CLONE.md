# 🪟 Solução para Erro de Clone no Windows

## ✅ Correções Aplicadas no Repositório

Todos os **151 arquivos com emojis** foram removidos permanentemente do histórico Git.
Um novo commit foi criado para forçar a atualização do cache do GitHub.

## 🔧 Se o Erro Persistir no Windows

Caso você ainda receba o erro ao clonar:
```
error: invalid path '\360\217\216\212_INICIO_RAPIDO.txt'
fatal: unable to checkout working tree
```

### Siga estes passos:

#### 1. Limpar Cache do Git no Windows

```cmd
# No PowerShell ou CMD, execute:
git config --global core.protectNTFS false
```

#### 2. Clonar com Configuração Especial

```cmd
# Clone com configuração para lidar com nomes de arquivo problemáticos:
git clone -c core.protectNTFS=false https://github.com/Tektrio/TATTOOPHOTOCALENDAR.git C:\TATTOOPHOTOCALENDAR
```

#### 3. Se Ainda Não Funcionar - Clone Parcial

```cmd
# Faça um clone sem checkout primeiro:
git clone --no-checkout https://github.com/Tektrio/TATTOOPHOTOCALENDAR.git C:\TATTOOPHOTOCALENDAR

# Entre no diretório:
cd C:\TATTOOPHOTOCALENDAR

# Configure para ignorar problemas de nome:
git config core.protectNTFS false
git config core.precomposeUnicode true

# Agora faça o checkout:
git checkout main
```

#### 4. Opção Alternativa - Usar WSL

Se você tem WSL (Windows Subsystem for Linux):

```bash
# No WSL:
git clone https://github.com/Tektrio/TATTOOPHOTOCALENDAR.git ~/TATTOOPHOTOCALENDAR

# Depois copie para o Windows se necessário:
cp -r ~/TATTOOPHOTOCALENDAR /mnt/c/Users/seu-usuario/Desktop/
```

## 📊 Verificação

Após clonar com sucesso, verifique que não há arquivos com emojis:

```cmd
cd C:\TATTOOPHOTOCALENDAR
git log --all --name-only --pretty=format: | findstr /R "\\3[0-9][0-9]"
```

Se não retornar nenhum resultado, está tudo limpo! ✅

## 🆘 Suporte

Se o problema persistir:
1. Aguarde 5-10 minutos (cache do GitHub pode levar um tempo)
2. Limpe o cache do Git: `git gc --aggressive --prune=all`
3. Tente novamente

## 📝 Último Commit

```
8cc4ee0 - chore: forçar atualização do repositório para remover cache de arquivos com emojis
```

Data da correção: 29/10/2025

