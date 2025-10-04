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

  return (
    <div className="card p-5 hover:shadow-lg hover:shadow-black/30 transition-shadow duration-300">
      <div className="flex items-center justify-between">
        <a
          href={htmlUrl}
          className="text-lg font-semibold hover:text-accent"
          target="_blank"
          rel="noopener noreferrer"
        >
          {name}
        </a>
        <div className="text-xs text-white/50">Updated {new Date(updatedAt).toLocaleDateString()}</div>
      </div>

      {description ? <p className="mt-2 text-white/70">{description}</p> : null}

      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-white/70">
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
        <div className="mt-3 flex flex-wrap gap-2">
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
