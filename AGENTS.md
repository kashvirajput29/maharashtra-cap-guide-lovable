<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep directory filtering and verified-branch matching in a browser-safe helper so rules can be tested without server dependencies.
- College/profile comparison uses one shared tray and the existing local-storage store so selection remains consistent across pages.
- Branch choices extend the existing option list with a separate local-storage map; preserve college ordering and limits.
- Outdated-information reports open a mail draft to VITE_COLLEGE_REPORT_EMAIL; never claim submission when no recipient is configured.
- Keep cutoff explorer enrichment, filtering, comparisons, and CSV serialization in a browser-safe helper; never mutate official rows or infer admission chances.
- Matchmaker uses a shared Zod schema on client and server and a pure matching helper; choose the newest sourced record per institute/branch and treat percentile bands only as historical differences.
