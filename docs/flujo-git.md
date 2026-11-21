# Flujo de git

Objetivo: que ningún cambio o borrado pueda romper o perder el proyecto. Cada cosa vive en su rama y solo llega a `main` revisada.

## Ramas

| Rama | Para qué | Quién escribe |
| --- | --- | --- |
| `main` | Lo que está (o va a estar) publicado. Vercel despliega producción desde acá | Solo merges desde `develop`, por pull request |
| `develop` | Integración: lo aprobado que todavía no se publicó. Vercel hace un deploy de preview | Solo merges desde ramas de trabajo, por pull request |
| `feat/<tema>` | Una funcionalidad o cambio de diseño (`feat/acento-hero`) | Claude o Franco |
| `fix/<tema>` | Una corrección | Claude o Franco |
| `content/<tema>` | Textos, piezas, CV (`content/textos-casos`) | Claude o Franco |
| `docs/<tema>` | Solo documentación | Claude o Franco |

## Cómo trabajamos

1. Cada cambio sale de `develop` en una rama nueva: `git switch develop && git pull && git switch -c feat/<tema>`.
2. Commits chicos y en español (`feat(visor): …`).
3. Push de la rama y **pull request a `develop`**. Franco revisa el deploy de preview y aprueba.
4. Para publicar: pull request de `develop` a `main`.
5. Nunca `git push --force` sobre `main` ni sobre `develop`. Nunca se borra `main`.

## Protección recomendada en GitHub (la configura Franco)

En **Settings → Rules → Rulesets → New branch ruleset**, para `main` y `develop`:

- **Restrict deletions**: nadie puede borrar la rama.
- **Block force pushes**: nadie puede reescribir su historia.
- **Require a pull request before merging**: los cambios entran solo por PR.

Con eso, un error en una rama de trabajo nunca alcanza a `main`, y aunque se borre una rama de trabajo, `main` y `develop` quedan intactas.

## Recuperar algo

- Todo commit sigue en el historial: `git log --oneline --all` y `git switch -c rescate <commit>`.
- Una rama borrada por error se recupera con `git reflog` (en la máquina donde estaba) o desde el pull request en GitHub ("Restore branch").
