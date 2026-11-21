/**
 * Tiny, SAFE Markdown renderer for blog posts. Builds React elements only (never dangerouslySetInnerHTML),
 * so nothing an author types can inject HTML or script.
 *
 * Supported:  # / ## / ### headings · paragraphs · **bold** · *italic* · [text](link) · - bullets · 1. numbered
 *             > quotes · --- divider · ![caption](image-url) on its own line
 * Links/images are limited to http(s), mailto and site-relative URLs.
 */
import { Fragment } from "react";
import { Link } from "react-router-dom";

const safeUrl = (u) => {
  const url = String(u || "").trim();
  if (/^https?:\/\//i.test(url) || /^mailto:/i.test(url)) return url;
  if (url.startsWith("/") && !url.startsWith("//")) return url;
  return null;
};

function renderInline(text, keyBase) {
  const parts = String(text).split(/(\*\*[^*]+\*\*|\*[^*\n]+\*|\[[^\]]+\]\([^)\s]+\))/g);
  return parts.map((part, i) => {
    const key = `${keyBase}-${i}`;
    let m;
    if ((m = part.match(/^\*\*([^*]+)\*\*$/))) return <strong key={key}>{m[1]}</strong>;
    if ((m = part.match(/^\*([^*\n]+)\*$/))) return <em key={key}>{m[1]}</em>;
    if ((m = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/))) {
      const href = safeUrl(m[2]);
      if (!href) return <Fragment key={key}>{m[1]}</Fragment>;
      if (href.startsWith("/")) return <Link key={key} to={href}>{m[1]}</Link>;
      return <a key={key} href={href} target="_blank" rel="noopener noreferrer nofollow">{m[1]}</a>;
    }
    return <Fragment key={key}>{part}</Fragment>;
  });
}

export default function MarkdownLite({ source }) {
  const lines = String(source || "").replace(/\r\n?/g, "\n").split("\n");
  const out = [];
  let i = 0;
  let k = 0;

  const isBlockStart = (l) => /^(#{1,3}\s|[-*]\s|\d+\.\s|>\s?|---+\s*$|!\[)/.test(l);

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }

    let m;
    if ((m = line.match(/^(#{1,3})\s+(.*)$/))) {
      // Page title is the h1, so # → h2, ## → h3, ### → h4
      const Tag = `h${m[1].length + 1}`;
      out.push(<Tag key={k++}>{renderInline(m[2], `h${k}`)}</Tag>);
      i++;
    } else if (/^---+\s*$/.test(line)) {
      out.push(<hr key={k++} />);
      i++;
    } else if ((m = line.match(/^!\[([^\]]*)\]\(([^)\s]+)\)\s*$/))) {
      const src = safeUrl(m[2]);
      if (src && !src.startsWith("mailto:")) {
        out.push(
          <figure key={k++} className="blog-figure">
            <img src={src} alt={m[1]} loading="lazy" decoding="async" />
            {m[1] && <figcaption>{m[1]}</figcaption>}
          </figure>,
        );
      }
      i++;
    } else if (/^>\s?/.test(line)) {
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, ""));
      out.push(<blockquote key={k++}>{renderInline(buf.join(" "), `q${k}`)}</blockquote>);
    } else if (/^[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) items.push(lines[i++].replace(/^[-*]\s+/, ""));
      out.push(<ul key={k++}>{items.map((t, j) => <li key={j}>{renderInline(t, `u${k}-${j}`)}</li>)}</ul>);
    } else if (/^\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) items.push(lines[i++].replace(/^\d+\.\s+/, ""));
      out.push(<ol key={k++}>{items.map((t, j) => <li key={j}>{renderInline(t, `o${k}-${j}`)}</li>)}</ol>);
    } else {
      const buf = [line];
      i++;
      while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i])) buf.push(lines[i++]);
      out.push(<p key={k++}>{renderInline(buf.join(" "), `p${k}`)}</p>);
    }
  }
  return <div className="blog-body">{out}</div>;
}
