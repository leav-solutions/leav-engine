---
name: usage-skills
description: Report which Claude Code skills were used and how often, over a given period, by reading the local session transcripts. Trigger when the user asks something like "quels skills j'ai utilisé", "combien de fois j'ai utilisé tel skill", "usage des skills la semaine dernière", or invokes /usage-skills.
---

# usage-skills

Compte l'usage des skills Claude Code à partir des transcripts de session locaux.

## Source des données

Les invocations de skills sont persistées dans les transcripts JSONL :

```
~/.claude/projects/*/*.jsonl
```

Chaque appel de skill est une entrée `assistant` contenant un `tool_use` dont :

- `name` == `"Skill"`
- `input.skill` == le nom du skill invoqué (ex. `create-worktree-skill`)

Le timestamp ISO de l'entrée est le champ top-level `.timestamp` (ex. `2026-06-16T09:12:00.000Z`).

> ⚠️ C'est une mesure _a posteriori_ sur les transcripts conservés **sur cette machine** — ce n'est
> pas de la télémétrie OTel. La couverture dépend de la rétention locale des sessions.

## Démarche

1. **Déterminer la fenêtre temporelle** demandée par l'utilisateur, en dates absolues `YYYY-MM-DD`.
    - "la semaine dernière" = la semaine calendaire précédente (lundi → dimanche).
    - Comme les timestamps sont en UTC, comparer en `YYYY-MM-DD` suffit (filtre `>= début` et `< lendemain de la fin`).
2. **Agréger** par nom de skill (et par jour si demandé).
3. **Présenter** un tableau trié par nombre d'invocations décroissant + le total, en précisant la période et le caveat « transcripts locaux ».

## Commande de référence

Adapter les deux dates (`>=` borne basse incluse, `<` lendemain de la borne haute) :

```bash
grep -rh '"name":"Skill"' ~/.claude/projects/*/*.jsonl 2>/dev/null \
| jq -r 'select(.timestamp >= "2026-06-16" and .timestamp < "2026-06-23")
         | .timestamp[0:10] as $d
         | (.message.content[]? | select(.type=="tool_use" and .name=="Skill") | "\($d)\t\(.input.skill)")' \
| sort \
| awk -F'\t' '{c[$2]++} END{for(s in c) printf "%3d  %s\n", c[s], s}' \
| sort -rn
```

### Variantes utiles

- **Ventilation par jour** : grouper la sortie de `jq` sur `($d)\t(.input.skill)` au lieu du seul skill.
- **Un seul skill** : ajouter `and .input.skill == "nom-du-skill"` dans le `select` du `jq` interne.
- **Tous projets vs un projet** : restreindre le glob `~/.claude/projects/<projet>/*.jsonl`.
- **Toutes les semaines (tendance)** : retirer le filtre de dates et grouper sur `.timestamp[0:7]` (mois) ou la semaine ISO.

## Sortie attendue

Tableau markdown trié décroissant + total, ex. :

| Skill                   | Invocations |
| ----------------------- | ----------- |
| `create-worktree-skill` | 4           |
| ...                     | ...         |

Toujours rappeler la période couverte et le caveat transcripts locaux.
