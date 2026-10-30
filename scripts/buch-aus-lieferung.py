#!/usr/bin/env python3
"""Erzeugt content/buecher/<slug>.json aus einer Buch-Lieferung (Vorlage 6-templates/buch im Vault).

Aufruf:
  python3 scripts/buch-aus-lieferung.py <lieferung.md> --vault <Vault> --repo <Worktree>      # schreibt die JSON
  python3 scripts/buch-aus-lieferung.py <lieferung.md> --vault <Vault> --ausgabe <datei.json> # Probelauf

Prüft vorher alles. Bei einem Fehler wird nichts geschrieben (Exit 1). Warnungen stoppen nicht.
"""
import argparse
import json
import re
import sys
from pathlib import Path

import yaml

PFLICHT = ["buch_nr", "slug", "titel_buch", "autor", "verlag", "erschienen", "isbn", "leitfrage",
           "einordnung", "karten_thema", "karten_reihenfolge", "beitrag_etikett", "beitrag_titel",
           "beitrag_anreisser", "beitrag_autor"]
GRUNDLAGE_STANDARD = "Grundlage sind die Quellen der Lernkarten."
fehler, warnungen = [], []


def leer(v):
    return v is None or v == [] or (isinstance(v, str) and not v.strip())


def lies_lieferung(pfad):
    t = pfad.read_text(encoding="utf-8")
    if not t.startswith("---"):
        sys.exit("Lieferung hat keinen Frontmatter-Block")
    _, fm, body = t.split("---", 2)
    return yaml.safe_load(fm) or {}, body


def absaetze(body):
    m = re.search(r"^## Beitrag\s*$\n(.*?)(?=^## |\Z)", body, re.S | re.M)
    if not m:
        return []
    bloecke = [b.strip() for b in re.split(r"\n\s*\n", m.group(1)) if b.strip()]
    return [b for b in bloecke if not b.startswith(">")]


def lies_karte(pfad):
    t = pfad.read_text(encoding="utf-8")
    _, fm, body = t.split("---", 2)
    meta = yaml.safe_load(fm) or {}
    titel = re.search(r"^# (.+)$", body, re.M)
    karte = re.search(r"^## Karte\s*\n(.+?)(?:\n\s*\n|\Z)", body, re.S | re.M)
    fragen = []
    for n, block in enumerate(re.split(r"\n(?=### Niveau )", body)[1:], 1):
        frage = re.search(r"\*\*Frage:\*\* (.+)", block)
        beleg = re.search(r"\*\*Beleg:\*\* „(.+?)“", block)
        beleg_de = re.search(r"\*\*Beleg \(deutsch\):\*\* (.+)", block)
        optionen = [{"text": m.group(2).strip(), "ok": m.group(1) == "x", "fb": m.group(3).strip()}
                    for m in re.finditer(r"^- \[([ x])\] (.*?) :: (.*)$", block, re.M)]
        fragen.append({"n": n, "frage": frage.group(1).strip() if frage else "",
                       "beleg": beleg.group(1).strip() if beleg else "",
                       "belegDe": beleg_de.group(1).strip() if beleg_de else None,
                       "optionen": optionen})
    url = str(meta.get("quelle_url", "")).strip()
    return {"slug": str(meta.get("slug", "")).strip(),
            "titel": titel.group(1).strip() if titel else "",
            "karte": karte.group(1).strip() if karte else "",
            "quelle": {"titel": str(meta.get("quelle_titel", "")).strip(), "url": url,
                       "herausgeber": "Wikipedia" if "wikipedia" in url else str(meta.get("quelle_herausgeber", "")).strip(),
                       "abgerufen": str(meta.get("quelle_abgerufen", "")).strip()},
            "fragen": fragen}


def pruefe_karte(k):
    s = k["slug"]
    if len(k["karte"]) > 700:
        fehler.append(f"{s}: Karte länger als 700 Zeichen")
    if len(k["fragen"]) != 3:
        fehler.append(f"{s}: {len(k['fragen'])} Fragen statt 3")
    for f in k["fragen"]:
        if len(f["frage"]) > 139:
            fehler.append(f"{s} N{f['n']}: Frage über 139 Zeichen")
        if not f["beleg"]:
            fehler.append(f"{s} N{f['n']}: Beleg fehlt")
        if len(f["optionen"]) != 4:
            fehler.append(f"{s} N{f['n']}: {len(f['optionen'])} Optionen statt 4")
        if sum(o["ok"] for o in f["optionen"]) != 1:
            fehler.append(f"{s} N{f['n']}: genau eine richtige Option nötig")
        for o in f["optionen"]:
            if len(o["text"]) > 97:
                fehler.append(f"{s} N{f['n']}: Option über 97 Zeichen")
            if len(o["fb"]) > 300:
                fehler.append(f"{s} N{f['n']}: Rückmeldung über 300 Zeichen")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("lieferung", type=Path)
    ap.add_argument("--vault", type=Path, required=True)
    ziel = ap.add_mutually_exclusive_group(required=True)
    ziel.add_argument("--repo", type=Path, help="Worktree der Website; schreibt content/buecher/<slug>.json")
    ziel.add_argument("--ausgabe", type=Path, help="Probelauf: schreibt diese Datei")
    ap.add_argument("--vorhanden", type=Path, help="bestehende JSON: Schlüsselreihenfolge und belegDe-Fallback")
    a = ap.parse_args()

    meta, body = lies_lieferung(a.lieferung)
    for k in PFLICHT:
        if leer(meta.get(k)):
            fehler.append(f"Pflichtfeld fehlt: {k}")
    slug = str(meta.get("slug", "")).strip()
    if slug and not re.fullmatch(r"[a-z0-9-]+", slug):
        fehler.append("slug: nur Kleinbuchstaben, Ziffern und Bindestrich")
    if leer(meta.get("verlag_url")) and leer(meta.get("amazon_url")):
        fehler.append("Bezugsquelle fehlt: verlag_url oder amazon_url")
    gelesen = bool(meta.get("buch_gelesen"))
    if not gelesen and leer(meta.get("grundlage_text")):
        warnungen.append("buch_gelesen ist false, grundlage_text leer: Standardtext wird verwendet")
    if leer(meta.get("freigabe_beitrag")):
        warnungen.append("freigabe_beitrag fehlt: der Beitrag ist noch nicht freigegeben")
    cover = str(meta.get("cover_datei") or "").strip()
    if cover and not (a.lieferung.parent / "bilder" / cover).is_file():
        fehler.append(f"Cover-Datei fehlt: anhang/buch-NN/bilder/{cover}")

    beitrag_absaetze = absaetze(body)
    if len(beitrag_absaetze) < 3:
        fehler.append(f"Beitrag: {len(beitrag_absaetze)} Absätze unter „## Beitrag“, mindestens 3")

    thema = str(meta.get("karten_thema", "")).strip()
    ordner = a.vault / "2-wiki" / "lernkarten" / thema
    if thema and not ordner.is_dir():
        fehler.append(f"Lernkarten-Ordner fehlt: 2-wiki/lernkarten/{thema}")
    gefunden = {}
    if ordner.is_dir():
        for f in sorted(ordner.glob("lk-*.md")):
            k = lies_karte(f)
            gefunden[k["slug"]] = k
    karten = []
    for eintrag in meta.get("karten_reihenfolge") or []:
        s = str(eintrag.get("slug", "")).strip()
        kurz = str(eintrag.get("kurz", "")).strip()
        if s not in gefunden:
            fehler.append(f"Karte nicht gefunden: {s} (in {thema})")
            continue
        if not kurz:
            fehler.append(f"kurz fehlt bei {s}")
        elif len(kurz) > 30:
            fehler.append(f"kurz über 30 Zeichen bei {s}")
        karten.append((kurz, gefunden[s]))
    if not karten:
        fehler.append("keine Karten in karten_reihenfolge")
    elif len(karten) < 3:
        warnungen.append("weniger als 3 Karten")
    for _, k in karten:
        pruefe_karte(k)

    idx = {k["slug"]: i for i, (_, k) in enumerate(karten)}
    kanten = []
    if meta.get("kanten"):
        for paar in meta["kanten"]:
            if len(paar) != 2 or any(s not in idx for s in paar):
                fehler.append(f"kanten: unbekannter Slug in {paar}")
                continue
            kanten.append([idx[paar[0]], idx[paar[1]], "verwandt"])
    else:
        kanten = [[i, i + 1, "verwandt"] for i in range(len(karten) - 1)]
    bruecken = []
    for b in meta.get("bruecken") or []:
        von = str(b.get("karte", ""))
        ziel_slug = str(b.get("ziel_slug", "")).strip()
        if von not in idx:
            fehler.append(f"bruecken: Karte {von} unbekannt")
            continue
        if not ziel_slug:
            fehler.append("bruecken: ziel_slug fehlt")
            continue
        bruecken.append({"von": [idx[von]], "titel": str(b.get("titel", "")).strip(),
                         "url": f"/buch/{ziel_slug}/", "ziel": ziel_slug})

    from collections import Counter
    grad = Counter(s for kante in kanten for s in kante[:2])
    if karten and not any(v >= 3 for v in grad.values()):
        fehler.append("Keine Abzweigung: mindestens eine Karte mit drei Verbindungen nötig (jeder Wissensgraph braucht eine Pfad-Entscheidung)")
    ziel_pfad = a.ausgabe or (a.repo / "content" / "buecher" / f"{slug}.json")
    vorhanden = {}
    vor = a.vorhanden or ziel_pfad
    if vor and Path(vor).is_file():
        vorhanden = json.loads(Path(vor).read_text(encoding="utf-8"))
    alt_de = {(k["slug"], f["n"]): f.get("belegDe") for k in vorhanden.get("kartenvoll", []) for f in k.get("fragen", [])}

    if fehler:
        print("\n".join("FEHLER: " + f for f in fehler), file=sys.stderr)
        print(f"{len(fehler)} Fehler, nichts geschrieben.", file=sys.stderr)
        sys.exit(1)

    kartenvoll = []
    for kurz, k in karten:
        fragen = []
        for f in k["fragen"]:
            bd = f["belegDe"] or alt_de.get((k["slug"], f["n"])) or ""
            if not bd:
                warnungen.append(f"{k['slug']} N{f['n']}: belegDe fehlt (Zeile „**Beleg (deutsch):**“ in der Karte ergänzen)")
            fragen.append({"n": f["n"], "frage": f["frage"], "beleg": f["beleg"], "belegDe": bd, "optionen": f["optionen"]})
        kartenvoll.append({"slug": k["slug"], "kurz": kurz, "titel": k["titel"], "karte": k["karte"],
                           "quelle": k["quelle"], "fragen": fragen})

    beitrag = {"etikett": str(meta["beitrag_etikett"]).strip(), "titel": str(meta["beitrag_titel"]).strip(),
               "anreisser": str(meta["beitrag_anreisser"]).strip(), "absaetze": beitrag_absaetze,
               "autor": str(meta["beitrag_autor"]).strip()}
    if not gelesen:
        beitrag["grundlage"] = str(meta.get("grundlage_text") or GRUNDLAGE_STANDARD).strip()

    d = dict(vorhanden)
    d.update({
        "slug": slug, "draft": False,
        "autor": str(meta["autor"]).strip(), "titel": str(meta["titel_buch"]).strip(),
        "untertitel": str(meta.get("untertitel") or "").strip(),
        "uebersetzer": str(meta.get("uebersetzer") or "").strip(),
        "verlag": str(meta["verlag"]).strip(), "erschienen": str(meta["erschienen"]).strip(),
        "isbn": str(meta["isbn"]).strip(), "leitfrage": str(meta["leitfrage"]).strip(),
        "einordnung": str(meta["einordnung"]).strip(),
        "kartenIntro": f"Alle {len(karten)} kannst du unten durchspielen.",
        "karten": [kurz for kurz, _ in karten],
        "kartenStatus": "Jede Karte nennt ihre Quelle und hat drei Fragen.",
        "verlagUrl": str(meta.get("verlag_url") or "").strip(),
        "leseprobeUrl": str(meta.get("leseprobe_url") or "").strip(),
        "amazonUrl": str(meta.get("amazon_url") or "").strip(),
        "cover": "cover.jpg" if cover else "",
        "coverCredit": str(meta.get("cover_credit") or "").strip(),
        "naechsteWoche": str(meta.get("ausblick") or "").strip(),
        "probeTitel": "Probier es an den Karten aus",
        "graphTitel": str(meta.get("graph_titel") or f"Der Wissensgraph zu {meta['titel_buch']}").strip(),
        "knoten": [{"slug": k["slug"], "titel": kurz} for kurz, k in karten],
        "kanten": kanten,
        "beitrag": beitrag,
        "kartenvoll": kartenvoll,
        "bruecken": bruecken,
        "platzhalter": False,
    })
    if cover:
        try:
            from PIL import Image
            with Image.open(a.lieferung.parent / "bilder" / cover) as im:
                d["coverBreite"], d["coverHoehe"] = im.size
        except ImportError:
            warnungen.append("Pillow fehlt: coverBreite/coverHoehe nicht gesetzt")

    ziel_pfad.parent.mkdir(parents=True, exist_ok=True)
    ziel_pfad.write_text(json.dumps(d, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    pos = {}
    for k in kartenvoll:
        for f in k["fragen"]:
            p = next(i + 1 for i, o in enumerate(f["optionen"]) if o["ok"])
            pos[p] = pos.get(p, 0) + 1
    print(f"Geschrieben: {ziel_pfad}")
    print(f"Karten: {len(kartenvoll)}, Fragen: {sum(len(k['fragen']) for k in kartenvoll)}, "
          f"Position der richtigen Antwort: {dict(sorted(pos.items()))}")
    for w in warnungen:
        print("WARNUNG: " + w, file=sys.stderr)


if __name__ == "__main__":
    main()
