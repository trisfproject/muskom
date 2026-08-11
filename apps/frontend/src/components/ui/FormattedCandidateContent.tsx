import React, { Fragment } from 'react';

interface FormattedCandidateContentProps {
  content?: string;
}

export function FormattedCandidateContent({ content }: FormattedCandidateContentProps) {
  if (!content) {
    return <p className="text-slate-400 italic">Belum tersedia.</p>;
  }

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: 'ul' | 'ol' | null = null;
  let listItems: React.ReactNode[] = [];
  let currentParagraph: string[] = [];

  const commitParagraph = () => {
    if (currentParagraph.length > 0) {
      elements.push(
        <p key={`p-${elements.length}`} className="mb-4">
          {currentParagraph.map((line, i) => (
            <Fragment key={i}>
              {line}
              {i < currentParagraph.length - 1 && <br />}
            </Fragment>
          ))}
        </p>
      );
      currentParagraph = [];
    }
  };

  const commitList = () => {
    if (listItems.length > 0) {
      if (currentList === 'ul') {
        elements.push(
          <ul key={`ul-${elements.length}`} className="list-disc pl-5 mb-4 space-y-1">
            {listItems}
          </ul>
        );
      } else {
        elements.push(
          <ol key={`ol-${elements.length}`} className="list-decimal pl-5 mb-4 space-y-1">
            {listItems}
          </ol>
        );
      }
      listItems = [];
      currentList = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    // Remove carriage returns if any
    const cleanLine = rawLine.replace(/\r$/, '');
    const trimmedLine = cleanLine.trim();

    if (trimmedLine === '') {
      commitParagraph();
      commitList();
      continue;
    }

    const ulMatch = trimmedLine.match(/^[-*]\s+(.*)/);
    const olMatch = trimmedLine.match(/^\d+\.\s+(.*)/);

    if (ulMatch) {
      commitParagraph();
      if (currentList === 'ol') commitList();
      currentList = 'ul';
      listItems.push(<li key={listItems.length}>{ulMatch[1]}</li>);
    } else if (olMatch) {
      commitParagraph();
      if (currentList === 'ul') commitList();
      currentList = 'ol';
      listItems.push(<li key={listItems.length}>{olMatch[1]}</li>);
    } else {
      // It's a normal line. 
      if (currentList) {
        // If we are currently in a list, we treat consecutive non-bullet lines
        // as a new paragraph (breaking the list). This is standard for simple parsers
        // unless they use spaces to indent. Let's break the list for simplicity.
        commitList();
      }
      currentParagraph.push(cleanLine);
    }
  }

  commitParagraph();
  commitList();

  return (
    <div className="prose dark:prose-invert prose-base max-w-none prose-slate text-slate-700 dark:text-slate-300 [&_p]:leading-[1.7] [&_li]:leading-[1.7] [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
      {elements}
    </div>
  );
}
