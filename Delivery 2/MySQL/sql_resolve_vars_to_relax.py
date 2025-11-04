#!/usr/bin/env python3
# sql_resolve_vars_to_relax_with_schema.py
#
# Lee un dump SQL que contiene:
#  - DEFINICIONES CREATE TABLE ...
#  - INSERT INTO ... (col1,col2,...) VALUES (...),(...);
#  - SET @var = LAST_INSERT_ID(); o SET @var = 123;
#
# Genera bloques RelaX sin paréntesis por fila, usando como esquema
# la lista de columnas obtenida de CREATE TABLE para cada tabla.
# Además resuelve variables tipo @r1 sustituyéndolas por los ids
# reales (simulados) generados para los AUTO_INCREMENT.
#
# Uso:
#   python3 sql_resolve_vars_to_relax_with_schema.py "Datos proyecto.sql" > Ghost_Running_relax_resuelto.txt

import re, sys, os, json

if len(sys.argv) < 2:
    print("Uso: python3 sql_resolve_vars_to_relax_with_schema.py <archivo_sql>", file=sys.stderr)
    sys.exit(1)

fn = sys.argv[1]
if not os.path.exists(fn):
    print("Archivo no encontrado:", fn, file=sys.stderr)
    sys.exit(1)

sql_text = open(fn, "r", encoding="utf-8").read()

# -------------------------
# 1) Parsear CREATE TABLE para obtener esquema canónico por tabla
# -------------------------
# Regex para capturar CREATE TABLE name ( ... );
create_table_re = re.compile(
    r"CREATE\s+TABLE\s+`?([A-Za-z0-9_]+)`?\s*\((.*?)\)\s*(?:ENGINE|COMMENT|COLLATE|;)",
    re.IGNORECASE | re.DOTALL
)

# Para identificar columnas en el bloque: buscamos líneas que comiencen con `colname`
col_def_re = re.compile(r"^\s*`?([A-Za-z0-9_]+)`?\s+([^,]+)", re.IGNORECASE)

# Guardaremos:
# schemas[table] = { 'cols': [col1,col2,...], 'auto_cols': set(...), 'pk': [cols...] }
schemas = {}

for m in create_table_re.finditer(sql_text):
    tname = m.group(1)
    body = m.group(2)
    # dividir por comas en nivel superior: se separa por líneas para sacar definiciones
    lines = [ln.strip() for ln in re.split(r",\s*\n", body) if ln.strip()]
    cols = []
    auto_cols = set()
    pk_cols = []
    for ln in lines:
        # Detect column definitions
        cm = col_def_re.match(ln)
        if cm:
            colname = cm.group(1)
            rest = cm.group(2).upper()
            cols.append(colname)
            if "AUTO_INCREMENT" in rest:
                auto_cols.add(colname)
            continue
        # detectar PRIMARY KEY (`a`,`b`)
        pkm = re.search(r"PRIMARY\s+KEY\s*\((.*?)\)", ln, re.IGNORECASE)
        if pkm:
            pk_fields = [c.strip().strip("`") for c in pkm.group(1).split(",")]
            pk_cols.extend(pk_fields)
            continue
    # store
    schemas[tname] = {
        "cols": cols,
        "auto_cols": auto_cols,
        "pk": pk_cols
    }

# -------------------------
# 2) Preparar para leer statements en orden y procesarlos
# -------------------------
# Regexes para inserts and set last insert
insert_re = re.compile(
    r"INSERT\s+INTO\s+`?([A-Za-z0-9_]+)`?\s*\(([^)]+)\)\s*VALUES\s*((?:\([^)]+\)\s*,\s*)*\([^)]+\))\s*;",
    re.IGNORECASE | re.DOTALL
)
set_lastid_re = re.compile(r"SET\s+@([A-Za-z0-9_]+)\s*[:=]?\s*LAST_INSERT_ID\s*\(\s*\)\s*;", re.IGNORECASE)
set_literal_re = re.compile(r"SET\s+@([A-Za-z0-9_]+)\s*[:=]?\s*([0-9]+)\s*;", re.IGNORECASE)
select_lastid_re = re.compile(r"SELECT\s+@([A-Za-z0-9_]+)\s*[:=]?\s*LAST_INSERT_ID\s*\(\s*\)\s*;", re.IGNORECASE)

# tokenizers helpers
def split_sql_fields(s):
    parts = []
    cur = ""
    in_str = False
    i = 0
    while i < len(s):
        c = s[i]
        if c == "'" and (i == 0 or s[i-1] != "\\"):
            in_str = not in_str
            cur += c
        elif c == "," and not in_str:
            parts.append(cur.strip())
            cur = ""
        else:
            cur += c
        i += 1
    if cur.strip():
        parts.append(cur.strip())
    return parts

def parse_value_tuples(values_block):
    tuples = []
    cur = ""
    depth = 0
    for ch in values_block:
        if ch == "(":
            if depth == 0:
                cur = ""
            else:
                cur += ch
            depth += 1
        elif ch == ")":
            depth -= 1
            if depth == 0:
                tuples.append(cur.strip())
            else:
                cur += ch
        else:
            cur += ch
    return tuples

def normalize_token(tok):
    t = tok.strip()
    if not t:
        return "NULL"
    if t.upper() == "NULL":
        return "NULL"
    # keep quoted strings single-quoted, but escape internal single quotes
    if t.startswith("'") and t.endswith("'"):
        inner = t[1:-1].replace("\\'", "'").replace("''", "'")
        inner = inner.replace("\n", " ").replace("\r", " ")
        inner = inner.replace("'", "\\'")
        return "'" + inner + "'"
    # token like @var
    return t

# State to build
tables_rows = {}  # table -> list of rows (each row is list of tokens in canonical column order)
tables_cols = {}  # table -> canonical columns (from CREATE or from first INSERT fallback)
var_map = {}      # varname -> string value (e.g., '123' or "'abc'")
next_auto = {}    # table -> next simulated AUTO_INCREMENT integer
last_generated_for_table = {}  # table -> list of generated ids for last processed INSERT (in order)
last_insert_table = None

# initialize tables_cols from schemas
for t, info in schemas.items():
    tables_cols[t] = info["cols"][:]  # copy

# If a table has no CREATE, we'll create columns from first INSERT when encountered.

# We'll process statements in order split by semicolon (basic but effective)
stmts = [s.strip() for s in re.split(r";\s*(?=\n|$)", sql_text) if s.strip()]

for stmt in stmts:
    s = stmt.strip()
    # process SET literal assignments first
    for m in set_literal_re.finditer(s):
        var = m.group(1)
        val = m.group(2)
        var_map[var] = val
    # process set last insert patterns (map to last generated for the previous insert)
    mlast = set_lastid_re.search(s) or select_lastid_re.search(s)
    if mlast:
        var = mlast.group(1)
        if last_insert_table and last_insert_table in last_generated_for_table and last_generated_for_table[last_insert_table]:
            # LAST_INSERT_ID() returns first id generated by the last insert statement
            var_map[var] = str(last_generated_for_table[last_insert_table][0])
        else:
            # not available yet; map to None for now (will attempt later)
            var_map[var] = None
    # process INSERTs
    for m in insert_re.finditer(s):
        tname = m.group(1)
        cols_raw = m.group(2)
        vals_block = m.group(3)
        insert_cols = [c.strip().strip("`") for c in split_sql_fields(cols_raw)]
        tuple_strs = parse_value_tuples(vals_block)
        # ensure canonical columns exist for this table
        if tname not in tables_cols:
            # if CREATE TABLE not present, use insert_cols as canonical order initially
            tables_cols[tname] = insert_cols[:]
        canonical_cols = tables_cols[tname]
        # prepare next_auto if table has auto cols in schemas
        if tname not in next_auto:
            # if we have schema and auto cols present, start next_auto at 1 or at 1+max explicit id seen so far
            if tname in schemas and schemas[tname]["auto_cols"]:
                # try to find max explicit id from earlier rows if any
                next_auto[tname] = 1
            else:
                next_auto[tname] = 1

        generated_ids_this_insert = []
        # determine index of an auto column to populate if missing
        auto_indices = []
        if tname in schemas:
            for ac in schemas[tname]["auto_cols"]:
                if ac in canonical_cols:
                    auto_indices.append(canonical_cols.index(ac))

        # Process each tuple
        for tup in tuple_strs:
            vals = split_sql_fields(tup)
            vals_norm = [normalize_token(v) for v in vals]
            # build map col->value for columns present in INSERT
            row_map = {}
            for i, c in enumerate(insert_cols):
                if i < len(vals_norm):
                    row_map[c] = vals_norm[i]
                else:
                    row_map[c] = "NULL"
            # Build canonical row
            row_canonical = []
            gen_ids_for_row = []
            for idx, col in enumerate(canonical_cols):
                if col in row_map:
                    token = row_map[col]
                    # if token is variable @x -> try to resolve now from var_map
                    if token.startswith("@"):
                        vname = token[1:]
                        if vname in var_map and var_map[vname] is not None:
                            token = str(var_map[vname])
                        else:
                            # unresolved variable: leave as '@name' for now; will resolve in post-pass
                            token = "@" + vname
                    # if token is NULL keep as-is
                    row_canonical.append(token)
                else:
                    # column not present in insert: if it's an auto column -> generate id; else NULL
                    if col in schemas.get(tname, {}).get("auto_cols", set()):
                        nextid = next_auto.get(tname, 1)
                        row_canonical.append(str(nextid))
                        gen_ids_for_row.append(nextid)
                        next_auto[tname] = nextid + 1
                    else:
                        row_canonical.append("NULL")
            # Save row
            tables_rows.setdefault(tname, []).append(row_canonical)
            # If we generated ids for this row, consider the first of them as one of the generated ids
            if gen_ids_for_row:
                generated_ids_this_insert.append(gen_ids_for_row[0])
            else:
                # if there is an explicit id in the canonical column (we must detect numeric)
                # try to get value of first auto column (if any)
                if auto_indices:
                    ai = auto_indices[0]
                    if ai < len(row_canonical):
                        tok = row_canonical[ai]
                        # if numeric
                        if re.match(r"^-?\d+$", tok):
                            generated_ids_this_insert.append(int(tok))
            # ensure next_auto is greater than any explicit id found in the row
            for ai in auto_indices:
                if ai < len(row_canonical):
                    tok = row_canonical[ai]
                    mnum = re.match(r"^-?\d+$", tok)
                    if mnum:
                        valnum = int(tok)
                        if next_auto[tname] <= valnum:
                            next_auto[tname] = valnum + 1

        # After processing all tuples of this INSERT, set last_generated_for_table
        # If we have generated ids collected, use them, otherwise leave as empty list
        if generated_ids_this_insert:
            last_generated_for_table[tname] = generated_ids_this_insert
        else:
            last_generated_for_table[tname] = []
        last_insert_table = tname

# -------------------------
# 3) Post-process: resolve remaining @var tokens in stored rows using var_map.
#    If a var maps to None (unresolved), we will leave NULL in its place.
# -------------------------
for tname, rows in tables_rows.items():
    for ridx, row in enumerate(rows):
        newrow = []
        for tok in row:
            if isinstance(tok, str) and tok.startswith("@"):
                v = tok[1:]
                if v in var_map and var_map[v] is not None:
                    newrow.append(str(var_map[v]))
                else:
                    # unresolved variable -> NULL (couldn't infer)
                    newrow.append("NULL")
            else:
                newrow.append(tok)
        tables_rows[tname][ridx] = newrow

# -------------------------
# 4) Prepare RelaX output: header uses canonical columns (from CREATE TABLE if exist),
#    otherwise falls back to columns known for the table.
# -------------------------
def guess_type(colname):
    n = colname.lower()
    if any(x in n for x in ["date", "datetime", "time", "hora", "registro", "start", "end"]):
        return "string"
    if any(x in n for x in ["email", "user", "name", "foto", "desc", "image", "priv", "gender", "type"]):
        return "string"
    if any(x in n for x in ["id", "counter", "num", "cantidad", "age", "km", "dist", "peso", "altura", "speed", "calories", "likes", "ranking"]):
        return "number"
    return "string"

out_blocks = []
for tname, cols in tables_cols.items():
    rows = tables_rows.get(tname, [])
    header = f"{tname} = {{\n  " + ", ".join(f"{c}:{guess_type(c)}" for c in cols) + "\n"
    lines = []
    for r in rows:
        # ensure length
        r2 = r + ["NULL"] * (len(cols) - len(r))
        lines.append("  " + ", ".join(r2))
    footer = "\n}\n"
    out_blocks.append(header + "\n".join(lines) + footer)

# Also include any table present in tables_rows but not in tables_cols
for tname in tables_rows:
    if tname in tables_cols:
        continue
    cols = []
    # build minimal cols from first row length
    first = tables_rows[tname][0] if tables_rows[tname] else []
    cols = [f"col{i+1}" for i in range(len(first))]
    header = f"{tname} = {{\n  " + ", ".join(f"{c}:string" for c in cols) + "\n"
    lines = []
    for r in tables_rows[tname]:
        lines.append("  " + ", ".join(r))
    footer = "\n}\n"
    out_blocks.append(header + "\n".join(lines) + footer)

# Write to stdout
output = "\n".join(out_blocks)
sys.stdout.write(output)

# Print diagnostics to stderr (var mappings and simulated next_auto)
sys.stderr.write("\n--- Diagnostics ---\n")
sys.stderr.write("Variable map (var -> value or null):\n")
sys.stderr.write(json.dumps(var_map, indent=2, ensure_ascii=False) + "\n")
sys.stderr.write("Next simulated auto per table:\n")
sys.stderr.write(json.dumps(next_auto, indent=2, ensure_ascii=False) + "\n")
if last_generated_for_table:
    sys.stderr.write("Last generated ids per table (first id is LAST_INSERT_ID):\n")
    sys.stderr.write(json.dumps(last_generated_for_table, indent=2, ensure_ascii=False) + "\n")
sys.stderr.write("--- End diagnostics ---\n")
