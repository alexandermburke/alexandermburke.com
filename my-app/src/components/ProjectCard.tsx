"use client";

import React from "react";

type ProjectCardProps = {
  name: string;
  description: string | null;
  htmlUrl: string;
  homepage: string | null;
  language: string | null;
  stars: number;
  forks: number;
  commits: number;
  updatedAt: string;
  topics: readonly string[] | string[] | undefined;
};

export default function ProjectCard(props: ProjectCardProps) {
  const {
    name, description, htmlUrl, homepage, language,
    stars, forks, commits, updatedAt, topics
  } = props;
  const hasDescription = Boolean(description && description.trim().length > 0);

  return (
    <div className="card flex h-full flex-col p-5 transition-shadow duration-300 hover:shadow-lg hover:shadow-black/30">
      <div className="flex items-start justify-between gap-3">
        <a
          href={htmlUrl}
          className="text-lg font-semibold hover:text-accent"
          target="_blank"
          rel="noopener noreferrer"
        >
          {name}
        </a>
        <div className="shrink-0 text-xs text-white/50">Updated {new Date(updatedAt).toLocaleDateString()}</div>
      </div>

      <p
        className={`mt-3 flex-1 text-sm text-white/70 leading-relaxed clamp-3 min-h-[3.75rem]${
          hasDescription ? "" : " opacity-0"
        }`}
        aria-hidden={hasDescription ? undefined : true}
      >
        {hasDescription ? description : "Placeholder description for layout"}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-white/70">
        {language ? <span className="kbd">{language}</span> : null}
        <span className="kbd">★ {stars}</span>
        <span className="kbd">⑂ {forks}</span>
        <span className="kbd">⎇ {commits} commits</span>
        {homepage ? (
          <a className="kbd hover:text-accent" href={homepage} target="_blank" rel="noopener noreferrer">
            Live
          </a>
        ) : null}
      </div>

      {topics && topics.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {topics.slice(0, 6).map(t => (
            <span key={t} className="text-[11px] rounded border border-white/10 bg-white/5 px-2 py-0.5 text-white/60">
              #{t}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
