import sys
import json
import pandas as pd
from datetime import datetime
import mysql.connector

# -----------------------------
# 1. Receber caminho do ficheiro
# -----------------------------
file_path = sys.argv[1]

# -----------------------------
# 2. Ler Excel com pandas
# -----------------------------
df = pd.read_excel(file_path, dtype=str)
df = df.fillna("")  # evitar None

# -----------------------------
# 3. Conectar ao MySQL
# -----------------------------
db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="",
    database="cirurgia_app"
)

cursor = db.cursor(dictionary=True)

# -----------------------------
# Funções auxiliares
# -----------------------------

def parse_date(value):
    if value == "":
        return None

    # formato dd/mm/yyyy
    if "/" in value:
        try:
            return datetime.strptime(value, "%d/%m/%Y").strftime("%Y-%m-%d")
        except:
            return None

    # número Excel
    try:
        return pd.to_datetime(value, unit='d', origin='1899-12-30').strftime("%Y-%m-%d")
    except:
        return None


def normalize_date(value):
    if value in ("", None):
        return None

    try:
        if hasattr(value, "strftime"):
            return value.strftime("%Y-%m-%d")
        return parse_date(value)
    except:
        return None


def get_existing(id):
    cursor.execute("SELECT * FROM waiting_list WHERE id = %s", (id,))
    return cursor.fetchone()


def insert_new(data):
    fields = ", ".join(data.keys())
    placeholders = ", ".join(["%s"] * len(data))
    values = list(data.values())

    cursor.execute(
        f"INSERT INTO waiting_list ({fields}) VALUES ({placeholders})",
        values
    )
    db.commit()


def update_existing(id, data):
    updates = ", ".join([f"{k} = %s" for k in data.keys()])
    values = list(data.values()) + [id]

    cursor.execute(
        f"UPDATE waiting_list SET {updates} WHERE id = %s",
        values
    )
    db.commit()


def save_history(waiting_list_id, field, old, new):
    cursor.execute("""
        INSERT INTO waiting_list_history
        (waiting_list_id, campo_alterado, valor_antigo, valor_novo, alterado_em, origem)
        VALUES (%s, %s, %s, %s, NOW(), 'excel')
    """, (waiting_list_id, field, old, new))
    db.commit()


# -----------------------------
# 4. Processar Excel
# -----------------------------
imported = 0
updated = 0
unchanged = 0

for _, row in df.iterrows():

    if not row["NUM_LISTA_ESPERA"].isdigit():
        continue

    id = int(row["NUM_LISTA_ESPERA"])
    
    if row["DES_GRUPO"] != "HSA - CIRURGIA":
        continue

    data = {
        "id": id,
        "data_marcacao": parse_date(row["DTA_MARCACAO"]),
        "data_operado": parse_date(row["DTA_OPERADO"]),
        "data_agenda": parse_date(row["DTA_AGENDA"]),
        "data_cancel": parse_date(row["DTA_CANCEL"]),
        "prioridade": row["PRIORIDADE"],
        "regime": row["Regime"],
        "situacao": row["Situacao"],
        "estado": row["ESTADO"],
        "num_processo": row["NUM_PROCESSO"],
        "sexo": row["SEXO"],
        "des_grupo": row["DES_GRUPO"],
        "cod_medico": row["COD_MEDICO"],
        "nome_clinico": row["NOME_CLINICO"],
        "patologia": row["PATOLOGIA"],
        "des_diagnostico": row["DES_DIAGNOSTICO"],
        "interv_cirurgica": row["INTERV_CIRURGICA"],
        "cancel": row["CANCEL"],
        "des_cancel": row["DES_CANCEL"],
    }
    
    existing = get_existing(id)

    if not existing:
        insert_new(data)
        imported += 1
        continue

    changed = False

    # Comparar todos os campos
    for field, new_value in data.items():
        old_value = existing[field]

        if "data" in field:
            old_norm = normalize_date(old_value)
            new_norm = normalize_date(new_value)
        else:
            old_norm = str(old_value or "")
            new_norm = str(new_value or "")

        if old_norm != new_norm:
            changed = True
            save_history(id, field, old_norm, new_norm)

    # Só atualizar se houve alterações
    if changed:
        # valor novo
        new_ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        # valor antigo
        old_ts = existing.get("updated_from_excel_at")

        # guardar no histórico também
        save_history(id, "updated_from_excel_at", str(old_ts or ""), new_ts)

        # atualizar BD
        data["updated_from_excel_at"] = new_ts
        update_existing(id, data)

        updated += 1
    else:
        unchanged += 1


# -----------------------------
# 5. Devolver JSON para Laravel
# -----------------------------
print(json.dumps({
    "importados": imported,
    "atualizados": updated,
    "inalterados": unchanged
}))
