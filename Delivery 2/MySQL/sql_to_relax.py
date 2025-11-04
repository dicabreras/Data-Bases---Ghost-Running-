#!/usr/bin/env python3
# Convierte INSERT INTO ... VALUES(...) del SQL a bloques RelaX.
# Uso: python3 sql_to_relax.py Ghost_Running_datos.sql > Ghost_Running_relax.txt

import re
import sys
import ast

if len(sys.argv) < 2:
    print("Uso: python3 sql_to_relax.py <archivo_sql>", file=sys.stderr)
    sys.exit(1)

fn = sys.argv[1]
sql = open(fn, "r", encoding="utf-8").read()

# Mapeo de tablas -> lista de atributos (orden exacto esperado)
# Debe coincidir con el esquema RelaX que creaste previamente.
SCHEMA = {
    "Usuario": ["Usu_Correo","Usu_Username","Usu_Contrasena","Usu_Nombres","Usu_Apellidos","Usu_Edad","Usu_FotoPerfil","Usu_Descripcion","Usu_FechaRegistro","Usu_Genero"],
    "Estado_Fisico": ["Est_Fis_ID","Est_Fis_Peso","Est_Fis_Altura","Usu_Correo"],
    "Objetivos_Semanal": ["Obj_Ent_Sem_ID","Obj_Ent_Sem_NumeroEntrenamientos","Obj_Ent_Sem_Distancia","Usu_Correo"],
    "Ruta": ["Rut_ID","Rut_Distancia"],
    "Coordenada": ["Coor_ID","Coor_Latitud","Coor_Longitud","Coor_Altitud","Rut_ID"],
    "Entrenamiento": ["Ent_ID","Ent_Fecha","Ent_Hora_Inicio","Ent_Duracion","Ent_Distancia","Ent_Ritmo","Ent_Max_Speed","Ent_Avg_Speed","Ent_Calorias","Ent_CambioNivel","Usu_Correo","Rut_ID"],
    "Km": ["Km_ID","Km_Tiempo","Km_Distancia","Ent_ID"],
    "Reto": ["Ret_Men_ID","Ret_Men_Distancia","Ret_Men_Fecha_Inicio","Ret_Men_Fecha_Finalizacion"],
    "Inscripcion_Reto": ["Ret_ID","Usu_Correo"],
    "Publicacion": ["Pub_ID","Pub_Likes","Pub_ImagenRuta","Pub_Privacidad","Usu_Correo","Rut_ID"],
    "Cycling": ["Cyc_LongitudPedaleo","Usu_Correo","Ent_ID","Tipo"],
    "Running": ["Run_LongitudPaso","Usu_Correo","Ent_ID","Tipo"],
    "Entrenamientos_Usuario": ["Usu_Correo","Ent_ID"],
    "Seguidos": ["Usu_Correo1","Usu_Correo2"]
}

# Regex para encontrar INSERTs con columnas listadas
insert_re = re.compile(
    r"INSERT\s+INTO\s+`?([A-Za-z0-9_]+)`?\s*\(([^)]+)\)\s*VALUES\s*\((.+?)\)\s*;",
    re.IGNORECASE | re.DOTALL
)

# También capture múltiples VALUES per INSERT if present: VALUES (...),(...),...
insert_multi_re = re.compile(
    r"INSERT\s+INTO\s+`?([A-Za-z0-9_]+)`?\s*\(([^)]+)\)\s*VALUES\s*(\(.+?\))\s*;",
    re.IGNORECASE | re.DOTALL
)

# Another approach: find "INSERT INTO `Table` (`col`,`col`) VALUES (...);" but sometimes file has many separate INSERTs.
# We'll iterate all simple matches of "INSERT INTO `...` (...) VALUES (...);" using a more permissive regex:
simple_insert_re = re.compile(r"INSERT\s+INTO\s+`?([A-Za-z0-9_]+)`?\s*\(([^)]+)\)\s*VALUES\s*((?:\([^\)]*\)\s*,\s*)*\([^\)]*\))\s*;", re.IGNORECASE | re.DOTALL)

def parse_values_list(values_str):
    # values_str can be "(...),(...),(...)" -> return list of tuple strings
    tuples = []
    cur = ""
    depth = 0
    for ch in values_str:
        cur += ch
        if ch == "(":
            depth += 1
        elif ch == ")":
            depth -= 1
            if depth == 0:
                tuples.append(cur.strip())
                cur = ""
    # clean parentheses
    cleaned = [t.strip()[1:-1].strip() for t in tuples if t.strip()]
    return cleaned

def normalize_token(tok):
    tok = tok.strip()
    # Convert SQL NULL -> empty string (or leave as NULL literal in RelaX using NULL)
    if tok.upper() == "NULL":
        return "NULL"
    # If string is quoted in single quotes, preserve as '...'
    # We will return strings with single quotes for RelaX.
    if tok.startswith("'") and tok.endswith("'"):
        # keep single quotes, but escape internal single quotes
        inner = tok[1:-1].replace("\\'", "'").replace("''","'")
        inner = inner.replace("\n"," ").replace("\r"," ")
        return "'" + inner + "'"
    # numeric - return as is
    return tok

out_blocks = {}
for m in simple_insert_re.finditer(sql):
    table = m.group(1)
    cols_raw = m.group(2)
    vals_block = m.group(3)
    cols = [c.strip().strip("`") for c in cols_raw.split(",")]
    tuples = parse_values_list(vals_block)
    if table not in out_blocks:
        out_blocks[table] = {"cols": cols, "rows": []}
    for t in tuples:
        # split respecting commas inside quotes
        parts = []
        cur = ""
        in_str = False
        i = 0
        while i < len(t):
            c = t[i]
            if c == "'" and (i==0 or t[i-1] != "\\"):
                in_str = not in_str
                cur += c
            elif c == "," and not in_str:
                parts.append(cur.strip())
                cur = ""
            else:
                cur += c
            i += 1
        if cur.strip() != "":
            parts.append(cur.strip())
        parts_norm = [normalize_token(p) for p in parts]
        out_blocks[table]["rows"].append((cols, parts_norm))

# Now produce RelaX text for each table present in SCHEMA (even if no rows)
def format_relax_table(table, attrs, rows):
    # attrs: list of attribute names (from SCHEMA) to print in header with types guessed
    # We'll output header with types approximated: strings for those with 'Usu_' or containing 'Fecha' or 'Hora' or 'Descripcion' or 'Foto'
    def guess_type(a):
        a_low = a.lower()
        if any(x in a_low for x in ["fecha","hora","descripcion","foto","username","contrasena","genero","correo","imagen","tipo","nombre"]):
            return "string"
        if any(x in a_low for x in ["id","num","_id"]):
            return "number"
        if any(x in a_low for x in ["distancia","peso","altura","ritmo","speed","calorias","cambio","likes","longitud","latitud","longitud","altitud","km"]):
            return "number"
        return "string"
    header = f"{table} = {{\n  " + ", ".join(f"{a}:{guess_type(a)}" for a in attrs) + "\n"
    # rows: each row is (cols_in_insert, values_list)
    lines = []
    for cols_in, vals in rows:
        # create a dict col->val then order by attrs
        d = {}
        for c,v in zip(cols_in, vals):
            d[c] = v
        # produce values in schema order, using 'NULL' raw for NULL
        vals_ordered = []
        for a in attrs:
            v = d.get(a)
            if v is None:
                vals_ordered.append("NULL")
            else:
                vals_ordered.append(v)
        # join values: use tab or comma-separated
        lines.append("  " + ", ".join(vals_ordered))
    footer = "\n}\n\n"
    return header + "\n".join(lines) + footer

# Build final text
out_text = []
for table, attrs in SCHEMA.items():
    rows = out_blocks.get(table, {}).get("rows", [])
    out_text.append(format_relax_table(table, attrs, rows))

sys.stdout.write("\n".join(out_text))
