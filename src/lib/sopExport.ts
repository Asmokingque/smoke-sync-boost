import { ADMIN_SOP_GUIDE, SOP_GROUPS } from "@/data/adminSopGuide";

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Builds a standalone, printable HTML document of the full SOP index. */
export const buildSopIndexHtml = () => {
  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const toc = SOP_GROUPS.map((group) => {
    const items = ADMIN_SOP_GUIDE.filter((e) => e.group === group);
    if (!items.length) return "";
    return `<li><strong>${escapeHtml(group)}</strong><ul>${items
      .map((e) => `<li><a href="#${e.id}">${escapeHtml(e.title)}</a></li>`)
      .join("")}</ul></li>`;
  }).join("");

  const body = SOP_GROUPS.map((group) => {
    const items = ADMIN_SOP_GUIDE.filter((e) => e.group === group);
    if (!items.length) return "";
    return `
      <section class="group">
        <h2>${escapeHtml(group)}</h2>
        ${items
          .map(
            (e) => `
          <article class="entry" id="${e.id}">
            <h3>${escapeHtml(e.title)}${e.superOnly ? '<span class="badge">Super Admin</span>' : ""}</h3>
            <p class="path">${escapeHtml(e.path)}</p>
            <p class="purpose">${escapeHtml(e.purpose)}</p>
            <ol>${e.steps.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ol>
            ${
              e.tips?.length
                ? `<ul class="tips">${e.tips.map((t) => `<li>${escapeHtml(t)}</li>`).join("")}</ul>`
                : ""
            }
          </article>`
          )
          .join("")}
      </section>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Anderson's Smoking Que — Admin SOP Index</title>
<style>
  :root { --gold:#C8A24A; --ink:#1a1a1a; --muted:#5c5c5c; }
  * { box-sizing: border-box; }
  body { font-family: Georgia, "Times New Roman", serif; color: var(--ink); background:#fff;
         margin: 0 auto; padding: 48px 40px; max-width: 900px; line-height: 1.55; }
  header { border-bottom: 2px solid var(--gold); padding-bottom: 16px; margin-bottom: 28px; }
  .kicker { font-family: Arial, Helvetica, sans-serif; letter-spacing: .28em; font-size: 11px;
            text-transform: uppercase; color: var(--gold); margin-bottom: 6px; }
  h1 { font-size: 30px; margin: 0 0 6px; }
  .meta { font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: var(--muted); }
  nav { margin-bottom: 32px; }
  nav h2 { font-size: 18px; margin: 0 0 8px; }
  nav ul { margin: 0 0 0 18px; padding: 0; font-size: 14px; }
  nav a { color: var(--ink); text-decoration: none; }
  h2 { font-size: 20px; border-bottom: 1px solid #ddd; padding-bottom: 6px; margin: 28px 0 14px; }
  .entry { page-break-inside: avoid; margin-bottom: 20px; }
  .entry h3 { font-size: 16px; margin: 0 0 2px; }
  .badge { font-family: Arial, Helvetica, sans-serif; font-size: 9px; letter-spacing: .12em;
           text-transform: uppercase; border: 1px solid var(--gold); color: var(--gold);
           padding: 1px 6px; border-radius: 3px; margin-left: 8px; vertical-align: middle; }
  .path { font-family: "Courier New", monospace; font-size: 11px; color: var(--muted); margin: 0 0 6px; }
  .purpose { margin: 0 0 8px; font-size: 14px; }
  ol { margin: 0 0 8px 20px; padding: 0; font-size: 14px; }
  ol li { margin-bottom: 4px; }
  .tips { list-style: none; margin: 0 0 0 0; padding: 8px 12px; font-size: 13px;
          background: #faf6ec; border-left: 3px solid var(--gold); }
  footer { margin-top: 40px; border-top: 1px solid #ddd; padding-top: 12px;
           font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: var(--muted); }
  @media print {
    body { padding: 0; max-width: none; }
    .group { page-break-before: auto; }
    a { color: inherit; text-decoration: none; }
  }
</style>
</head>
<body>
  <header>
    <div class="kicker">Anderson's Smoking Que</div>
    <h1>Admin SOP Index — How to Use Each Function</h1>
    <div class="meta">Version 1.0 &nbsp;•&nbsp; Audience: Admin Users &nbsp;•&nbsp; Generated ${escapeHtml(date)}</div>
  </header>
  <nav><h2>Contents</h2><ul>${toc}</ul></nav>
  ${body}
  <footer>Anderson's Smoking Que — internal admin standard operating procedures.</footer>
</body>
</html>`;
};

/** Opens the printable SOP in a new tab and triggers the browser print / Save-as-PDF dialog. */
export const printSopIndex = () => {
  const w = window.open("", "_blank");
  if (!w) return false;
  w.document.write(buildSopIndexHtml());
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 400);
  return true;
};

/** Downloads the printable SOP as a standalone .html file. */
export const downloadSopIndexHtml = () => {
  const blob = new Blob([buildSopIndexHtml()], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "Andersons_Smoking_Que_Admin_SOP_Index.html";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};
