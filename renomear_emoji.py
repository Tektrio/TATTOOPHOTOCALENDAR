#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import subprocess
import sys

# Mapeamento de emojis para prefixos ASCII
EMOJI_MAP = {
    '🎊': '[INICIO]',
    '🚀': '[RAPIDO]',
    '🎯': '[ACAO]',
    '🎉': '[SUCESSO]',
    '📊': '[STATUS]',
    '📋': '[LISTA]',
    '📝': '[NOTA]',
    '⚡': '[URGENTE]',
    '✅': '[OK]',
    '▶️': '[START]',
    '📚': '[INDICE]',
    '🔧': '[CONFIG]',
    '📦': '[PACOTE]',
    '🏁': '[FINAL]',
    '👉': '[LEIA]',
    '📖': '[GUIA]',
    '📢': '[IMPORTANTE]',
    '🔐': '[SEGURANCA]',
    '🔑': '[CHAVES]',
    '🔽': '[BAIXAR]',
    '🧪': '[TESTE]',
    '🎨': '[VISUAL]',
    '🏆': '[COMPLETO]',
    '⚠️': '[AVISO]',
    '🇧🇷': '[BR]',
    '🆘': '[AJUDA]',
    '📌': '[PIN]',
    '📅': '[CALENDARIO]',
    '⭐': '[ESTRELA]',
}

def get_files_with_emoji():
    """Lista todos os arquivos rastreados pelo Git que contém emojis"""
    try:
        result = subprocess.run(
            ['git', 'ls-files', '-z'],
            cwd='/Users/luizlopes/Desktop/TATTOO_PHOTO_CALENDAR',
            capture_output=True,
            text=True,
            check=True
        )
        files = result.stdout.split('\0')
        return [f for f in files if f and any(emoji in f for emoji in EMOJI_MAP.keys())]
    except subprocess.CalledProcessError as e:
        print(f"Erro ao listar arquivos: {e}")
        return []

def normalize_filename(filename):
    """Substitui emojis por prefixos ASCII"""
    new_name = filename
    for emoji, prefix in EMOJI_MAP.items():
        new_name = new_name.replace(emoji, prefix)
    
    # Remove caracteres problemáticos adicionais
    new_name = new_name.replace('%', '_PORCENTO_')
    
    return new_name

def rename_file(old_path, new_path):
    """Renomeia um arquivo usando git mv"""
    try:
        subprocess.run(
            ['git', 'mv', old_path, new_path],
            cwd='/Users/luizlopes/Desktop/TATTOO_PHOTO_CALENDAR',
            check=True,
            capture_output=True,
            text=True
        )
        return True, None
    except subprocess.CalledProcessError as e:
        return False, e.stderr

def main():
    print("🔧 Iniciando renomeação de arquivos com emojis...")
    print()
    
    # Obter lista de arquivos com emojis
    files_with_emoji = get_files_with_emoji()
    
    if not files_with_emoji:
        print("✅ Nenhum arquivo com emoji encontrado!")
        return 0
    
    print(f"📊 Encontrados {len(files_with_emoji)} arquivos com emojis")
    print()
    
    success_count = 0
    error_count = 0
    errors = []
    
    for old_path in files_with_emoji:
        new_path = normalize_filename(old_path)
        
        if old_path == new_path:
            continue
        
        print(f"  Renomeando:")
        print(f"    De: {old_path}")
        print(f"    Para: {new_path}")
        
        success, error = rename_file(old_path, new_path)
        
        if success:
            success_count += 1
            print("    ✅ Sucesso")
        else:
            error_count += 1
            errors.append((old_path, error))
            print(f"    ❌ Erro: {error}")
        
        print()
    
    print()
    print("=" * 60)
    print(f"✅ Arquivos renomeados com sucesso: {success_count}")
    print(f"❌ Erros: {error_count}")
    
    if errors:
        print()
        print("Erros detalhados:")
        for path, error in errors:
            print(f"  - {path}")
            print(f"    {error}")
    
    return 0 if error_count == 0 else 1

if __name__ == '__main__':
    sys.exit(main())

