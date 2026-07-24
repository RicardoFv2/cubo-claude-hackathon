"""
La Pupusería Alquimista — Hugging Face Dataset Loader
Carga el dataset 'nvidia/Nemotron-Personas-El-Salvador' usando la librería oficial `datasets`.

Uso:
  python scripts/fetch_hf_dataset.py
"""
import sys
import io

# Force UTF-8 output encoding for Windows terminals
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from datasets import load_dataset

def load_nemotron_dataset():
    print("🤗 Conectando con Hugging Face: 'nvidia/Nemotron-Personas-El-Salvador'...")
    try:
        ds = load_dataset("nvidia/Nemotron-Personas-El-Salvador")
        total = len(ds['train'])
        print(f"✅ Dataset cargado exitosamente. Total de personas salvadoreñas: {total}")
        print("\n--- Ejemplo de Persona (Registro 0) ---")
        row = ds['train'][0]
        print(f"UUID: {row.get('uuid')}")
        print(f"Departamento: {row.get('department')}, Municipio: {row.get('municipality')}")
        print(f"Edad: {row.get('age')}, Sexo: {row.get('sex')}, Ocupación: {row.get('occupation')}")
        print(f"Perfil Culinario: {row.get('culinary_persona')}")
        return ds
    except Exception as e:
        print(f"❌ Error al cargar el dataset de Hugging Face: {e}")
        return None

if __name__ == "__main__":
    load_nemotron_dataset()
